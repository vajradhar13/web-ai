//if we want expose public http endpoint without having to use api folder we can server actions
'use server'

import { fetchAndExtractPdfText } from "@/lib/langchain";

// Accepts the UploadThing response structure
export async function generatePdfSummary(uploadResponse: Array<{
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileKey: string;
}>) {
  if (!uploadResponse || !uploadResponse[0] || !uploadResponse[0].fileUrl) {
        return {
      success: false,
      message: "File upload failed ",
      data: null,
    };
    }
  const pdfUrl = uploadResponse[0].fileUrl;
  try {
    const pdfText = await fetchAndExtractPdfText(pdfUrl);
        return {
      success: true,
      message: "PDF text extracted",
      data: pdfText,
    };
  } catch {
        return {
      success: false,
      message: "File upload failed",
      data: null,
    };
    }
}
