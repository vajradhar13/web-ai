'use client'
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./upload-form-input"
import {z} from 'zod'
import { toast } from "sonner";
import { useState } from "react";
// import { generatePdfSummary } from "@/actions/upload-action"; // Remove unused import

const schema = z.object({
  file: z.instanceof(File, {message: 'Invalid file'})
    .refine((file: File) => file.size <= 20 * 1024 * 1024, {
      message: 'File size must be less than 20MB'
    })
    .refine((file: File) => file.type.startsWith('application/pdf'), {
      message: 'File must be a PDF'
    })
});

export default function Uploadform() {
  const { startUpload } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("uploaded successfully!");
    },
    onUploadError: (err) => {
      console.log("error occurred while uploading", err);
      toast.error("Something went wrong");
    },
    onUploadBegin: ({ file }) => {
      console.log("upload has begun for", file);
    },
  });
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSummary(null);
    setLoading(false);
    console.log('Submitted');
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file');
    if (typeof file !== 'object' || !(file instanceof File)) {
      toast.error('No file selected or file is not valid');
      return;
    }
    // validating the fields 
    const validatedFields = schema.safeParse({ file: file as File });
    if (!validatedFields.success) {
      toast.error(validatedFields.error.flatten().fieldErrors.file?.[0] ?? 'Invalid File');
      return;
    }
    // upload the file to uploadthing 
    const resp = await startUpload([file]); // <-- THIS LINE WAS MISSING!
    console.log('Upload response:', resp);
    if (!resp) {
      console.log('No response from upload');
      return;
    }
    if (!resp[0]) {
      console.log('No first item in upload response');
      return;
    }
    // Try both resp[0].fileUrl and resp[0].serverData?.fileUrl
    let fileUrl = resp[0].fileUrl || (resp[0].serverData && resp[0].serverData.fileUrl);
    if (!fileUrl) {
      console.log('fileUrl missing in upload response:', resp[0]);
      return;
    }
    console.log('About to call /api/extract-pdf-text with:', fileUrl);
    // Call API route to extract text
    try {
      const apiResp = await fetch("/api/extract-pdf-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const data = await apiResp.json();
      if (data.pdfText) {
        // Now call Gemini summarization API
        setLoading(true);
        const sumResp = await fetch("/api/v1/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.pdfText }),
        });
        const sumData = await sumResp.json();
        setLoading(false);
        if (sumData.summary) {
          setSummary(sumData.summary);
        } else {
          toast.error(  "Failed to generate summary");
        }
      } else {
        toast.error(  "Failed to extract PDF text");
      }
    } catch {
      setLoading(false);
      toast.error("Failed to extract PDF text");
    }
  };
  return (
    <>
      <UploadFormInput onSubmit={handleSubmit} />
      {loading && <div style={{ marginTop: 24 }}>Generating summary...</div>}
      {summary && !loading && (
        <div style={{ marginTop: 24 }}>
          <h3>Summary:</h3>
          <pre style={{ whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto", background: "#f5f5f5", padding: 12 }}>{summary}</pre>
        </div>
      )}
    </>
  );
}