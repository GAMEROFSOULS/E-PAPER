'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createAd(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) throw new Error('No client found')

  const title = formData.get('title') as string
  const position = formData.get('position') as string
  const link_url = formData.get('link_url') as string
  const imageFile = formData.get('image') as File

  if (!imageFile || imageFile.size === 0) throw new Error('Image is required')

  // Upload ad image
  const fileExt = imageFile.name.split('.').pop()
  const fileName = `ads/${client.id}/${Date.now()}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('epaper_assets')
    .upload(fileName, imageFile, { contentType: imageFile.type })

  if (uploadError) throw new Error('Failed to upload image: ' + uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from('epaper_assets')
    .getPublicUrl(fileName)

  const { error } = await supabase.from('ads').insert({
    client_id: client.id,
    title,
    position,
    link_url,
    image_url: publicUrl,
    is_active: true,
  })

  if (error) throw new Error('Failed to create ad: ' + error.message)
  redirect('/dashboard/ads')
}

export async function deleteAd(formData: FormData) {
  const supabase = await createClient()
  const adId = formData.get('id') as string
  
  await supabase.from('ads').delete().eq('id', adId)
  redirect('/dashboard/ads')
}

export async function toggleAd(formData: FormData) {
  const supabase = await createClient()
  const adId = formData.get('id') as string
  const isActive = formData.get('is_active') === 'true'
  
  await supabase.from('ads').update({ is_active: !isActive }).eq('id', adId)
  redirect('/dashboard/ads')
}
