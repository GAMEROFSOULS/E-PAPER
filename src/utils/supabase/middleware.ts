import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Hosts that belong to the app itself — never treated as custom domains
const INTERNAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'reallygen.com',
  'www.reallygen.com',
  process.env.NEXT_PUBLIC_APP_DOMAIN,
  process.env.NEXT_PUBLIC_BASE_SUBDOMAIN_HOST,  // apex of the subdomain base (e.g. epaper.edgemindlab.cloud)
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

  // ── Domain / Subdomain Detection ─────────────────────────────────────────
  const host = getCleanHost(request)
  const { pathname } = request.nextUrl

  // The base subdomain host, e.g. "epaper.edgemindlab.cloud"
  const BASE_SUBDOMAIN_HOST = process.env.NEXT_PUBLIC_BASE_SUBDOMAIN_HOST || ''

  // Only intercept non-internal hosts that aren't Next.js internal paths
  if (!isInternalHost(host) && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    let clientId: string | null = null

    // ── Strategy 1: Platform subdomain (e.g. dawn.epaper.edgemindlab.cloud) ──
    // Check if this host is a subdomain of our BASE_SUBDOMAIN_HOST
    if (
      BASE_SUBDOMAIN_HOST &&
      host !== BASE_SUBDOMAIN_HOST &&
      host.endsWith(`.${BASE_SUBDOMAIN_HOST}`)
    ) {
      // Extract the subdomain slug: "dawn.epaper.edgemindlab.cloud" → "dawn"
      const slug = host.slice(0, host.length - BASE_SUBDOMAIN_HOST.length - 1)

      if (slug && !slug.includes('.')) {
        // Single-level slug — look up the client by subdomain column
        const { data: clientRow } = await supabase
          .from('clients')
          .select('id')
          .eq('subdomain', slug)
          .single()

        if (clientRow?.id) {
          clientId = clientRow.id
        }
      }
    }

    // ── Strategy 2: Fully custom domain (e.g. epaper.dawngroup.com) ──────────
    if (!clientId) {
      const { data: clientRow } = await supabase
        .from('clients')
        .select('id')
        .eq('custom_domain', host)
        .single()

      if (clientRow?.id) {
        clientId = clientRow.id
      }
    }

    // ── Rewrite to the client's page if matched ───────────────────────────────
    if (clientId) {
      // Transparent rewrite: browser URL stays as-is,
      // but Next.js serves the /client/[id] page
      const rewriteUrl = request.nextUrl.clone()
      const subPath = pathname === '/' ? '' : pathname
      rewriteUrl.pathname = `/client/${clientId}${subPath}`
      return NextResponse.rewrite(rewriteUrl)
    }

    // ── Unknown custom domain (not matched in DB) ─────────────────────────────
    // Only block if the host looks like a real custom domain (has a dot)
    // Don't block the base subdomain host itself (shows the marketing page)
    if (host.includes('.') && host !== BASE_SUBDOMAIN_HOST) {
      const errorUrl = request.nextUrl.clone()
      errorUrl.pathname = '/domain-not-found'
      return NextResponse.rewrite(errorUrl)
    }
  }

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
