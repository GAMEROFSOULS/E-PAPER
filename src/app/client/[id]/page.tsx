import { createClient } from '@/utils/supabase/server'
import EpaperWrapper from './EpaperWrapper'

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient()

  // Fetch client data
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  // Fetch all e-paper issues (each treated as a "page")
  const { data: epapers } = await supabase
    .from('epapers')
    .select('*')
    .eq('client_id', resolvedParams.id)
    .order('published_date', { ascending: false })

  // Fetch posts for breaking news ticker & hotspots
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('client_id', resolvedParams.id)
    .order('created_at', { ascending: false })

  // Fetch active ads
  const { data: ads } = await supabase
    .from('ads')
    .select('*')
    .eq('client_id', resolvedParams.id)
    .eq('is_active', true)

  const pageIds = (epapers || []).map((item) => item.id)
  const { data: mappings } = pageIds.length > 0
    ? await supabase
        .from('epaper_page_mappings')
        .select('*')
        .in('page_id', pageIds)
        .order('sort_order', { ascending: true })
    : { data: [] }

  return (
    <EpaperWrapper 
      issues={epapers || []}
      posts={posts || []}
      ads={ads || []}
      mappings={mappings || []}
      clientName={clientData?.site_name || 'E-Paper'}
      themeColor={clientData?.theme_color || '#dc2626'}
      clientId={resolvedParams.id}
      logoUrl={clientData?.logo_url || null}
    />
  )
}
