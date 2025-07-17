
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

export async function fetchAndExtractPdfText(fileUrl: string) {
  // If it's a remote URL, use WebPDFLoader only
  if (/^https?:\/\//.test(fileUrl)) {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const loader = new WebPDFLoader(blob);
      const docs = await loader.load();
      const text = docs.map((doc) => doc.pageContent).join('\n');
      return text;
    } catch (err) {
      console.error('WebPDFLoader failed:', err);
      return '';
    }
  }
  // Otherwise, try PDFLoader (local file)
  try {
    const loader = new PDFLoader(fileUrl);
    const docs = await loader.load();
    const text = docs.map((doc) => doc.pageContent).join('\n');
    if (text && text.trim().length > 0) {
      return text;
    }
    console.warn('PDFLoader returned empty text, trying WebPDFLoader...');
  } catch (e) {
    console.error('PDFLoader failed:', e);
  }
  return '';
}
