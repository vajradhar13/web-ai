// src/app/api/v1/document-qa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DOCUMENT_QA_PROMPT } from "@/utils/prompt";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API key is missing.");
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    // Parse JSON body for extracted text and question
    const { text, question } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json(
        { error: "No valid document text provided for QA." },
        { status: 400 }
      );
    }
    if (!question || typeof question !== "string" || question.trim().length < 1) {
      return NextResponse.json(
        { error: "No valid question provided for QA." },
        { status: 400 }
      );
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Split text into chunks if necessary (to avoid token limits)
    const chunkText = (text: string, maxLength: number = 5000) => {
      const chunks = [];
      for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
      }
      return chunks;
    };
    const textChunks = chunkText(text);
    const chunkResponses: string[] = [];

    // Process each chunk with Gemini
    for (const chunk of textChunks) {
      const prompt = `${DOCUMENT_QA_PROMPT}\n\n---\n\nDocument:\n${chunk}\n\nQuestion:\n${question}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      chunkResponses.push((await response.text()).trim());
    }

    // Post-process responses to deduplicate fallback blocks
    const realAnswers = chunkResponses.filter(r => !/^❌\s*\*\*Not Available\*\*/.test(r.trim()));
    let output = "";
    if (realAnswers.length > 0) {
      // Deduplicate real answers by their content
      const uniqueAnswers = Array.from(new Set(realAnswers.map(a => a.trim())));
      output = uniqueAnswers.join("\n\n");
    } else {
      // All are fallback, show only the first one
      const firstFallback = chunkResponses.find(r => /^❌\s*\*\*Not Available\*\*/.test(r.trim()));
      output = firstFallback || chunkResponses[0] || "No answer found.";
    }

    return NextResponse.json({ output: output.trim() });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: `Failed to process document: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}