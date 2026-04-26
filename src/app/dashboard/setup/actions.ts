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
  const rawSubdomain = (formData.get('subdomain') as string || '').toLowerCase().trim()

  // Validate subdomain format
  if (rawSubdomain && !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(rawSubdomain) && rawSubdomain.length !== 1) {
    throw new Error('Invalid subdomain: use only lowercase letters, numbers, and hyphens.')
  }

  const { error } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      site_name,
      theme_color,
      logo_url: logo_url || null,
      subdomain: rawSubdomain || null,
    })

  if (error) {
    if (error.message.includes('unique') || error.code === '23505') {
      throw new Error('That subdomain is already taken. Please choose a different one.')
    }
    console.error('Error saving client setup:', error)
    throw new Error('Failed to save setup')
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
