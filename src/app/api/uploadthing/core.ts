
// import {UploadThingError } from "uploadthing/server";
// import { createUploadthing,type FileRouter } from "uploadthing/next";
// const f=createUploadthing();

// export const ourFileRouter ={
//     pdfUpload: f({pdf :{maxFileSize:"32MB"}}).onUploadComplete(async({file})=>{
//         console.log('upload complete for user id ');
//         console.log('file url:',file.url);
        
//         return{file.url};
//     })
// } satisfies FileRouter

// export type OurFileRouter=typeof ourFileRouter;


import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "32MB" } }).onUploadComplete(async ({ file }) => {
        console.log('upload complete for user id ');
        console.log('file url:', file.url);
        return { 
            fileUrl: file.url,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileKey: file.key
        };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;