"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import path from "path";
import { pathToFileURL } from "url";

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Import directly from lib to bypass the buggy index.js (which tries to read a test file if module.parent is missing in Webpack)
    // @ts-ignore
    const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    
    if (typeof pdfParse !== "function") {
      throw new Error(`pdf-parse is not a function. Type is ${typeof pdfParse}`);
    }

    const data = await pdfParse(buffer);
    return data.text;
  } catch (error: any) {
    console.error("PDF Parsing error:", error);
    throw new Error("Failed to parse PDF document: " + (error?.message || error));
  }
}


export async function uploadAndExtractPDF(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autorisé." };
  }

  const file = formData.get("file") as File;

  if (!file) {
    return { error: "Veuillez fournir un fichier PDF." };
  }

  if (file.type !== "application/pdf") {
    return { error: "Le fichier doit être un PDF." };
  }

  try {
    // 1. Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload to Supabase Storage
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { error: `Erreur lors du téléversement: ${uploadError.message}` };
    }

    // Get public URL for PDF
    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName);
      
    const fileUrl = publicUrlData.publicUrl;

    // Optional: Upload cover image if provided
    const coverFile = formData.get("cover") as File | null;
    let coverUrl = null;
    if (coverFile && coverFile.size > 0) {
      const coverName = `cover_${Date.now()}_${coverFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      const { error: coverUploadError } = await supabase.storage
        .from("documents")
        .upload(coverName, coverBuffer, {
          contentType: coverFile.type,
          upsert: false
        });
      
      if (!coverUploadError) {
        coverUrl = supabase.storage.from("documents").getPublicUrl(coverName).data.publicUrl;
      } else {
        console.error("Cover upload error:", coverUploadError);
      }
    }

    // 3. Extract text
    const extractedText = await extractTextFromPDF(buffer);

    return { success: true, fileUrl, extractedText, coverUrl };
    
  } catch (err: any) {
    console.error("Extraction error:", err);
    return { error: `Erreur interne lors de l'extraction: ${err.message}` };
  }
}

export async function saveWorkData(
  title: string, 
  author: string, 
  category: string, 
  description: string, 
  fileUrl: string, 
  extractedText: string,
  coverUrl?: string | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autorisé." };
  }

  if (!title || !author || !category || !fileUrl || !extractedText) {
    return { error: "Paramètres manquants." };
  }

  try {
    const { data: workData, error: insertError } = await supabase
      .from("works")
      .insert({
        title,
        author,
        category,
        description,
        file_url: fileUrl,
        content_text: extractedText,
        cover_url: coverUrl || null,
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return { error: `Erreur lors de l'enregistrement en base: ${insertError.message}` };
    }

    revalidatePath("/dashboard/teacher/works");
    revalidatePath("/dashboard/student/library");
    
    return { success: true, workId: workData.id };
    
  } catch (err: any) {
    console.error("Server Action error:", err);
    return { error: `Erreur interne: ${err.message}` };
  }
}

export async function updateWorkData(
  id: string,
  title: string, 
  author: string, 
  category: string, 
  description: string, 
  extractedText: string,
  coverUrl?: string | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé." };

  try {
    const updateData: any = {
      title,
      author,
      category,
      description,
      content_text: extractedText,
    };
    if (coverUrl !== undefined) {
      updateData.cover_url = coverUrl;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isAdmin = profile?.role === "admin";

    let query = supabase.from("works").update(updateData).eq("id", id);
    if (!isAdmin) {
      query = query.eq("created_by", user.id);
    }
    
    const { error } = await query;

    if (error) return { error: error.message };

    revalidatePath("/dashboard/teacher/works");
    revalidatePath(`/dashboard/teacher/works/${id}`);
    revalidatePath("/dashboard/student/library");
    
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteWork(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé." };

  try {
    const { data: work } = await supabase
      .from("works")
      .select("created_by, file_url")
      .eq("id", id)
      .single();

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isAdmin = profile?.role === "admin";

    if (!work || (!isAdmin && work.created_by !== user.id)) {
      return { error: "Non autorisé à supprimer cette œuvre." };
    }

    // Attempt to delete file from storage if exists
    if (work.file_url) {
      try {
        const urlParts = work.file_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
          await supabase.storage.from("documents").remove([fileName]);
        }
      } catch (e) {
        console.error("Error deleting file:", e);
      }
    }

    const { error } = await supabase.from("works").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/dashboard/student/library");
    
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function uploadCover(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé." };

  const coverFile = formData.get("cover") as File | null;
  if (!coverFile || coverFile.size === 0) {
    return { error: "Aucun fichier fourni." };
  }

  try {
    const coverName = `cover_${Date.now()}_${coverFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
    const { error: coverUploadError } = await supabase.storage
      .from("documents")
      .upload(coverName, coverBuffer, {
        contentType: coverFile.type,
        upsert: false
      });
    
    if (coverUploadError) {
      return { error: coverUploadError.message };
    }

    const coverUrl = supabase.storage.from("documents").getPublicUrl(coverName).data.publicUrl;
    return { success: true, coverUrl };
  } catch (err: any) {
    return { error: err.message };
  }
}
