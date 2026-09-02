"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// We use the legacy build of pdf.js since we are in a Node environment (Next.js Server Action)
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import path from "path";
import { pathToFileURL } from "url";

if (typeof window === "undefined") {
  try {
    const workerPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
  } catch (e) {
    console.warn("Could not set local pdf worker, falling back to default.", e);
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Convert Node Buffer to Uint8Array for pdfjs
  const data = new Uint8Array(buffer);
  
  // Load the document
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  
  const numPages = doc.numPages;
  let allPagesText = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    
    // Items have str and transform [scaleX, skewY, skewX, scaleY, tx, ty]
    // tx is x coordinate, ty is y coordinate
    const items = textContent.items.map((item: any) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5]
    }));

    // Group items into lines based on Y coordinate (with tolerance)
    const tolerance = 3;
    const lines: { y: number, items: any[] }[] = [];

    for (const item of items) {
      if (!item.str.trim()) continue; // Skip empty strings
      
      const existingLine = lines.find(l => Math.abs(l.y - item.y) <= tolerance);
      if (existingLine) {
        existingLine.items.push(item);
      } else {
        lines.push({ y: item.y, items: [item] });
      }
    }

    // Sort lines from top to bottom. 
    // PDF coordinates typically have (0,0) at bottom-left, so larger Y is higher.
    // We want to read from top to bottom, so sort descending by Y.
    lines.sort((a, b) => b.y - a.y);

    // Sort items within each line from left to right (ascending by X)
    lines.forEach(line => {
      line.items.sort((a, b) => a.x - b.x);
    });

    // Reconstruct the page text
    const pageText = lines
      .map(line => line.items.map(item => item.str).join(" "))
      .join("\n");
      
    allPagesText.push(pageText);
  }

  // Join pages with a blank line separator
  return allPagesText.join("\n\n");
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

    const { error } = await supabase
      .from("works")
      .update(updateData)
      .eq("id", id)
      .eq("created_by", user.id);

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

    if (!work || work.created_by !== user.id) {
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
