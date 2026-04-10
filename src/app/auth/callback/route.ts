import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log("AUTH CALLBACK SUCCESS: Redirecting to", `${origin}${next}`)
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("AUTH CALLBACK ERROR:", error)
  }

  console.log("AUTH CALLBACK FALLBACK: Redirecting to login")
  return NextResponse.redirect(`${origin}/login?message=Could not login with provider`)
}
