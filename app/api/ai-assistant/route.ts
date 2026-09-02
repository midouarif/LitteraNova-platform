import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const SYSTEM_PROMPT_TEMPLATE = `Tu es l'Assistant de lecture de LittéraNova, une plateforme pédagogique pour l'apprentissage de textes littéraires destinée aux étudiants de français des universités algériennes.

CONTEXTE DE L'ŒUVRE ACTUELLE :
Titre : {title}
Auteur : {author}
Catégorie : {category}
Extrait pertinent : {excerpt}

RÈGLES STRICTES :
1. Tu réponds UNIQUEMENT à des questions concernant l'œuvre actuellement ouverte par l'étudiant. Si la question sort de ce cadre (culture générale, autre œuvre, sujet hors littérature), rappelle poliment que tu es limité à l'œuvre en cours de lecture.
2. Tu ne donnes JAMAIS la réponse complète à une question d'évaluation (QCM, question ouverte d'activité) — si l'étudiant colle une question d'activité, guide-le vers la compréhension du texte sans donner la réponse finale.
3. Base tes réponses sur l'extrait fourni. Si l'information demandée n'est pas dans l'extrait fourni, dis-le clairement plutôt que d'inventer.
4. Réponds toujours en français, sauf si l'étudiant te demande explicitement une traduction en arabe. Garde toujours un registre clair et pédagogique.
5. Reste concis : privilégie des réponses de quelques phrases à un court paragraphe, sauf si l'étudiant demande explicitement un résumé détaillé.
6. Ne génère JAMAIS de formatage Markdown (pas d'astérisques **, pas de titres #, etc.). Réponds uniquement en texte brut.

TÂCHES QUE TU PEUX EFFECTUER :
- Résumer un passage ou l'œuvre entière (selon ce qui est fourni en contexte)
- Expliquer une figure de style, une référence culturelle/historique, un terme de vocabulaire
- Éclairer le contexte d'un personnage ou d'un événement dans le passage
- Aider à formuler une analyse sans la faire à la place de l'étudiant`;

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, workId, input, text_selection, offset } = body;

    if (!action || !workId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch work and reading progress
    const { data: work, error: workError } = await supabase
      .from("works")
      .select("title, author, category, content_text")
      .eq("id", workId)
      .single();

    if (workError || !work) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    const { data: progress } = await supabase
      .from("reading_progress")
      .select("scroll_percentage")
      .eq("work_id", workId)
      .eq("student_id", user.id)
      .maybeSingle();

    const scrollPercentage = progress?.scroll_percentage || 0;
    const contentText = work.content_text || "";
    const totalChars = contentText.length;
    const currentPosition = Math.floor(totalChars * (scrollPercentage / 100));

    // 2. Build Extrait Pertinent (Context Injection Logic)
    let excerpt = "";

    if (action === "summarize") {
      if (totalChars < 30000) {
        excerpt = contentText;
      } else {
        const limit = currentPosition > 0 ? currentPosition : 30000;
        excerpt = contentText.slice(0, limit);
      }
    } else if (action === "explain_selection" || action === "vocab_selection" || action === "translate_selection") {
      const selectionOffset = offset !== undefined ? offset : contentText.indexOf(text_selection || "");
      if (selectionOffset !== -1) {
        // Roughly 2 paragraphs before and after: roughly 1500 chars before and 1500 after
        const start = Math.max(0, selectionOffset - 1500);
        const end = Math.min(totalChars, selectionOffset + (text_selection?.length || 0) + 1500);
        excerpt = contentText.slice(start, end);
      } else {
        excerpt = text_selection || "";
      }
    } else if (action === "free_question") {
      if (currentPosition > 0) {
        const start = Math.max(0, currentPosition - 3000);
        const end = Math.min(totalChars, currentPosition + 3000);
        excerpt = contentText.slice(start, end);
      } else {
        excerpt = contentText.slice(0, 6000);
      }
    }

    // Truncate to ~12000 chars max
    if (excerpt.length > 12000) {
      excerpt = excerpt.slice(0, 12000) + "...";
    }

    // 3. Build System Prompt
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE
      .replace("{title}", work.title)
      .replace("{author}", work.author)
      .replace("{category}", work.category)
      .replace("{excerpt}", excerpt);

    let userPrompt = "";
    if (action === "summarize") {
      userPrompt = "Fais un résumé.";
    } else if (action === "explain_selection") {
      userPrompt = `Peux-tu expliquer ce passage ? "${text_selection}"`;
    } else if (action === "vocab_selection") {
      userPrompt = `Peux-tu expliquer le vocabulaire difficile, rare ou ancien dans ce passage ? "${text_selection}"`;
    } else if (action === "translate_selection") {
      userPrompt = `Peux-tu traduire ce passage en arabe (fusha) ? "${text_selection}"`;
    } else {
      userPrompt = input || "";
    }

    // 4. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY");
      return NextResponse.json({ error: "L'assistant n'est pas disponible pour le moment, réessayez dans un instant." }, { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json({ error: "L'assistant n'est pas disponible pour le moment, réessayez dans un instant." }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Error in AI API route:", err);
    return NextResponse.json({ error: "L'assistant n'est pas disponible pour le moment, réessayez dans un instant." }, { status: 500 });
  }
}
