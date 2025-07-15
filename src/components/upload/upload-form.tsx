'use client'
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./upload-form-input"
import {z} from 'zod'

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
  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("uploaded successfully!");
    },
    onUploadError: (err) => {
      console.log("error occurred while uploading",err);
    },
    onUploadBegin: ({ file }) => {
      console.log("upload has begun for", file);
    },
  });
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitted');
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    
    // validating the fields 
    const validatedFields = schema.safeParse({file});
    if(!validatedFields.success) {
      console.log(validatedFields.error.flatten().fieldErrors.file?.[0] ?? 'Invalid File')
      return;
    }
    

    // schema with zod -done
    // upload the file to uploadthing 
    const resp=await startUpload([file]);
    if(!resp){
      return 
    }
    // parse the pdf using the langchain 
    // summarize the pdf using AI 
    // return the file id 
  }
  return (
    <UploadFormInput onSubmit={handleSubmit}/>
  )
}