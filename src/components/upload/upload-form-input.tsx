'use client '
import React from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input';
interface UploadFormInputsProps{
    onSubmit:(e:React.FormEvent<HTMLFormElement>) => void;
}
export default function UploadFormInput({onSubmit}:UploadFormInputsProps) {
  return (
   <form className='flex flex-col gap-6' action="" onSubmit={onSubmit}>
    <div className='flex justify-end items-center gap-1'>
            <Input type="file" name="file" id="file" accept='application/pdf' required />
            <Button> Upload your PDF</Button>
    </div>
    </form>
  )
}
