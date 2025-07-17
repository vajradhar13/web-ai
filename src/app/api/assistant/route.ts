import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { DOCUMENT_SUMMARIZATION_PROMPT, DOCUMENT_QA_PROMPT } from "@/utils/prompt";

export const config = {
  api: {
    bodyParser: false,
  },
};

function chunkText(text: string, maxLength: number = 5000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { text, fileUrl, mode } = await req.json();
    const selectedMode = mode || 'chat';

    if (selectedMode === 'summarize') {
      // Summarization mode
      let docText = text;
      if (!docText && fileUrl) {
        docText = await fetchAndExtractPdfText(fileUrl);
      }
      if (!docText || typeof docText !== "string" || docText.trim().length < 20) {
        return NextResponse.json({ error: "No valid document text provided for summarization." }, { status: 400 });
      }
      const textChunks = chunkText(docText);
      const chunkSummaries: string[] = [];
      for (const chunk of textChunks) {
        const prompt = `${DOCUMENT_SUMMARIZATION_PROMPT}\n\n---\n\nDocument:\n${chunk}`;
        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          chunkSummaries.push((await response.text()).trim());
        } catch (err: unknown) {
          if (typeof err === 'object' && err !== null && 'status' in err && (err as { status?: unknown }).status === 503) {
            return NextResponse.json({ error: 'The AI model is overloaded. Please try again in a few seconds.' }, { status: 503 });
          }
          throw err;
        }
      }
      const uniqueSummaries = Array.from(new Set(chunkSummaries.map(s => s.trim())));
      const summary = uniqueSummaries.join("\n\n");
      return NextResponse.json({ summary: summary.trim() });
    } else if (selectedMode === 'qa') {
      // Document QA mode
      let docText = text;
      if (!docText && fileUrl) {
        docText = await fetchAndExtractPdfText(fileUrl);
      }
      if (!docText || typeof docText !== "string" || docText.trim().length < 20) {
        return NextResponse.json({ error: "No valid document text provided for QA." }, { status: 400 });
      }
      // For QA, require a question (use 'text' as question)
      const question = text;
      const textChunks = chunkText(docText);
      const chunkResponses: string[] = [];
      for (const chunk of textChunks) {
        const prompt = `${DOCUMENT_QA_PROMPT}\n\n---\n\nDocument:\n${chunk}\n\nQuestion:\n${question}`;
        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          chunkResponses.push((await response.text()).trim());
        } catch (err: unknown) {
          if (typeof err === 'object' && err !== null && 'status' in err && (err as { status?: unknown }).status === 503) {
            return NextResponse.json({ error: 'The AI model is overloaded. Please try again in a few seconds.' }, { status: 503 });
          }
          throw err;
        }
      }
      // Deduplicate fallback and real answers
      const realAnswers = chunkResponses.filter(r => !/^❌\s*\*\*Not Available\*\*/.test(r.trim()));
      let output = "";
      if (realAnswers.length > 0) {
        const uniqueAnswers = Array.from(new Set(realAnswers.map(a => a.trim())));
        output = uniqueAnswers.join("\n\n");
      } else {
        const firstFallback = chunkResponses.find(r => /^❌\s*\*\*Not Available\*\*/.test(r.trim()));
        output = firstFallback || chunkResponses[0] || "No answer found.";
      }
      return NextResponse.json({ output: output.trim() });
    } else {
      // Chat mode (default)
      if (!text || typeof text !== "string" || text.trim().length < 1) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
      }
      const prompt = text;
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const chatResponse = (await response.text()).replace(/```json|```/g, "").trim();
        return NextResponse.json({ output: chatResponse });
      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'status' in err && (err as { status?: unknown }).status === 503) {
          return NextResponse.json({ error: 'The AI model is overloaded. Please try again in a few seconds.' }, { status: 503 });
        }
        throw err;
      }
    }
  } catch (error: unknown) {
    let message = "Assistant error";
    if (typeof error === "object" && error !== null && "message" in error && typeof (error as { message?: unknown }).message === "string") {
      message = (error as { message: string }).message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
