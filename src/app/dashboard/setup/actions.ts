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
  const rawClientDomain = (formData.get('client_domain') as string || '').toLowerCase().trim()

  // Construct the custom domain (e.g. epaper.dawngroup.com)
  const fullCustomDomain = rawClientDomain ? `epaper.${rawClientDomain}` : null

  const { error } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      site_name,
      theme_color,
      logo_url: logo_url || null,
      custom_domain: fullCustomDomain,
      // We are leaving subdomain null deliberately, as we pivot to full custom domains
    })

  if (error) {
    if (error.message.includes('unique') || error.code === '23505') {
      throw new Error(`The domain ${fullCustomDomain} is already registered to another account.`)
    }
    console.error('Error saving client setup:', error)
    throw new Error('Failed to save setup')
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
