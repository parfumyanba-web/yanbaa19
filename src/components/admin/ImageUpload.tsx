'use client'

import React, { useRef, useState } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { resolveProductImage } from '@/lib/utils/imageUtils'

interface ImageUploadProps {
  defaultValue?: string
  onImageUploaded: (url: string) => void
  onImageRemoved: () => void
}

export default function ImageUpload({ defaultValue, onImageUploaded, onImageRemoved }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(defaultValue ? resolveProductImage(defaultValue) : null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setImage(publicUrl)
      onImageUploaded(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setImage(null)
    onImageRemoved()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4 w-full">
      <div 
        className={`relative w-full aspect-square md:aspect-video rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden group
          ${image ? 'border-gold/20 bg-black/40' : 'border-white/10 bg-white/5 hover:border-gold/30 hover:bg-white/10'}`}
      >
        {image ? (
          <>
            <img src={image} alt="Product preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
               <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                title="Change Image"
               >
                 <Upload size={20} />
               </button>
               <button 
                type="button"
                onClick={handleRemove}
                className="p-3 bg-red-500/20 backdrop-blur-md rounded-full text-red-400 hover:bg-red-500/40 transition-colors"
                title="Remove Image"
               >
                 <X size={20} />
               </button>
            </div>
          </>
        ) : (
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex flex-col items-center justify-center gap-3 text-white/40 group-hover:text-gold transition-colors w-full h-full"
          >
            {isUploading ? (
              <Loader2 size={32} className="animate-spin text-gold" />
            ) : (
              <>
                <ImageIcon size={32} />
                <span className="text-xs uppercase tracking-[0.2em] font-bold">Upload Product Image</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden" 
        accept="image/*"
      />
      
      <p className="text-[10px] text-white/20 uppercase tracking-widest text-center">
        Recommended size: 1080x1080px. Max file size: 5MB.
      </p>
    </div>
  )
}
