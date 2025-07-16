import { NextRequest, NextResponse } from "next/server";
import { fetchAndExtractPdfText } from "@/lib/langchain";

export async function POST(req: NextRequest) {
  try {
    const { fileUrl } = await req.json();
    if (!fileUrl) {
      return NextResponse.json({ error: "No fileUrl provided" }, { status: 400 });
    }
    const pdfText = await fetchAndExtractPdfText(fileUrl);
    return NextResponse.json({ pdfText });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to extract PDF text";
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 