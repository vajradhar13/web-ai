// src/app/api/v1/document-qa/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Parse form data (file and question)
async function parseFormData(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const question = formData.get("question") as string | null;
    
    if (!file) {
      throw new Error("No file provided in form data.");
    }
    if (!question) {
      throw new Error("No question provided in form data.");
    }
    return { file, question };
  } catch (error) {
    console.error("Error parsing form data:", error);
    throw new Error("Invalid form data. Please provide both a file and a question.");
  }
}

// Extract text from text-based PDF using pdf-parse
async function extractTextFromFile(file: File): Promise<string> {
  const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");
  if (!isPDF) {
    throw new Error("Only PDF files are supported.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);
    
    if (data.text && data.text.trim().length > 20) {
      console.log("Text extracted successfully with pdf-parse. Length:", data.text.length);
      return data.text;
    } else {
      throw new Error("No readable text found in the PDF. This may be an image-based PDF, which is not supported.");
    }
  } catch (error) {
    console.error("PDF text extraction failed:", error);
    throw new Error("Failed to extract text from PDF. Ensure the PDF is text-based and not image-based.");
  }
}

// Clean extracted text to remove unnecessary formatting
function cleanText(text: string): string {
  return text
    .replace(/\n{2,}/g, "\n") // Remove multiple newlines
    .replace(/[^\w\s.,!?]/g, "") // Remove special characters
    .trim();
}

// Split text into chunks to avoid Gemini token limits
function chunkText(text: string, maxLength: number = 5000): string[] {
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
      console.error("Gemini API key is missing.");
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    // Parse form data
    const { file, question } = await parseFormData(req);

    // Extract text from the uploaded file
    let docText = await extractTextFromFile(file);
    docText = cleanText(docText);

    if (!docText) {
      return NextResponse.json(
        { error: "No readable text extracted from the document." },
        { status: 400 }
      );
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Split text into chunks if necessary
    const textChunks = chunkText(docText);
    let combinedResponse = "";

    // Process each chunk with Gemini
    for (const chunk of textChunks) {
      const prompt = `
        You are an expert in document analysis. Below is a portion of a text-based PDF document followed by a question. Provide a concise and accurate answer based on the document content.

        **Document Portion**:
        ${chunk}

        **Question**:
        ${question}

        **Instructions**:
        - Answer the question directly based on the document.
        - If the document doesn't contain relevant information, state so clearly.
        - Keep the response concise and focused.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      combinedResponse += (await response.text()) + "\n";
    }

    return NextResponse.json({ output: combinedResponse.trim() });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: `Failed to process document: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}