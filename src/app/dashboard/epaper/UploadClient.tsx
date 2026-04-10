'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function UploadClient({ clientId }: { clientId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${clientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('epaper_assets')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('epaper_assets')
        .getPublicUrl(uploadData.path)

      // 3. Save to database
      const { error: dbError } = await supabase
        .from('epapers')
        .insert({
          client_id: clientId,
          title,
          file_url: publicUrl,
          published_date: date,
        })

      if (dbError) throw dbError

      // Reset form on success
      setFile(null)
      setTitle('')
      router.refresh()
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'An error occurred during upload.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4 max-w-md">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
      
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Issue Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="e.g. Sunday Edition"
          required
          className="border px-3 py-2 rounded-md transition-all focus:ring-2 focus:ring-blue-600 outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Publication Date</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          required
          className="border px-3 py-2 rounded-md transition-all focus:ring-2 focus:ring-blue-600 outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">PDF or Image File</label>
        <input 
          type="file" 
          accept="application/pdf,image/jpeg,image/png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          className="border px-3 py-2 rounded-md file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </div>

      <button 
        type="submit" 
        disabled={uploading}
        className="mt-2 bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {uploading ? 'Uploading...' : 'Publish Issue'}
      </button>
    </form>
  )
}
