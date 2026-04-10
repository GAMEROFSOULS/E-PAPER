import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Hosts that belong to the app itself — never treated as custom domains
const INTERNAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'reallygen.com',
  'www.reallygen.com',
  process.env.NEXT_PUBLIC_APP_DOMAIN,
].filter(Boolean) as string[])

function getCleanHost(request: NextRequest): string {
  const host = request.headers.get('host') || ''
  // Strip port (e.g. localhost:3000 → localhost)
  return host.split(':')[0]
}

function isInternalHost(host: string): boolean {
  if (INTERNAL_HOSTS.has(host)) return true
  // Also treat *.vercel.app preview URLs as internal
  if (host.endsWith('.vercel.app')) return true
  return false
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Custom Domain Detection ──────────────────────────────────────────────
  const host = getCleanHost(request)
  const { pathname } = request.nextUrl

  if (!isInternalHost(host) && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    // Look up which client owns this custom domain
    const { data: clientRow } = await supabase
      .from('clients')
      .select('id')
      .eq('custom_domain', host)
      .single()

    if (clientRow?.id) {
      // Transparent rewrite: browser URL stays as custom domain,
      // but Next.js serves the /client/[id] page
      const rewriteUrl = request.nextUrl.clone()
      // Preserve sub-paths: epaper.client.com/news → /client/[id]/news
      const subPath = pathname === '/' ? '' : pathname
      rewriteUrl.pathname = `/client/${clientRow.id}${subPath}`
      return NextResponse.rewrite(rewriteUrl)
    }

    // Custom domain but no matching client → show a friendly error page
    // Only block if the host looks like a real custom domain (has a dot)
    if (host.includes('.')) {
      const errorUrl = request.nextUrl.clone()
      errorUrl.pathname = '/domain-not-found'
      return NextResponse.rewrite(errorUrl)
    }
  }
  // ────────────────────────────────────────────────────────────────────────

  // Protect dashboard routes
  if (
    !user &&
    typeof pathname === 'string' &&
    pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
