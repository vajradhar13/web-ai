import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "edge"; // Use Edge runtime

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured." },
        { status: 500 }
      );
    }

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    // Check file type
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    // Extract text from PDF using pdf-lib
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer); 
    const pages = pdfDoc.getPages();
    let fullText = "";

    for (const page of pages) {
      const text = await page.getTextContent();
      fullText += text.items.map(item => item.str).join(" ") + "\n";
    }

    if (!fullText || fullText.trim().length < 20) {
      return NextResponse.json(
        { error: "No readable text found in PDF." },
        { status: 400 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate summary (limit to 30k chars)
    const prompt = `Please summarize the following document in clear, concise language for a general audience. Focus on the key points and main ideas:\n\n${fullText.substring(0, 30000)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = await response.text();

    return NextResponse.json({ summary });
    
  } catch (error: any) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to summarize document" },
      { status: 500 }
    );
  }
}