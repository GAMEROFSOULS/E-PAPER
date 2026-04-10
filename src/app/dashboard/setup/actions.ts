'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function saveClientSetup(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const site_name = formData.get('site_name') as string
  const theme_color = formData.get('theme_color') as string
  const logo_url = formData.get('logo_url') as string

  const { error } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      site_name,
      theme_color,
      logo_url,
    })

  if (error) {
    console.error('Error saving client setup:', error)
    throw new Error('Failed to save setup')
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
