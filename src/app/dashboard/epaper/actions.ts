'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteEpaper(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const id = formData.get('id') as string
  const fileUrl = formData.get('file_url') as string
  
  if (!id) return
  
  // 1. Delete from database
  await supabase.from('epapers').delete().eq('id', id)
  
  // 2. Delete from storage if it's stored in Supabase
  try {
    // If it's a supabase storage URL, extract the path.
    // Example: https://[project].supabase.co/storage/v1/object/public/epaper_assets/pdfs/client-id/file.pdf
    if (fileUrl && fileUrl.includes('/storage/v1/object/public/epaper_assets/')) {
      const parts = fileUrl.split('/storage/v1/object/public/epaper_assets/')
      if (parts.length > 1) {
        const filePath = parts[1]
        await supabase.storage.from('epaper_assets').remove([filePath])
      }
    }
  } catch (err) {
    console.error('Failed to delete storage file', err)
  }

  redirect('/dashboard/epaper')
}
