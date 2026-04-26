import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { normalizeMappingInput, sortMappings } from '@/lib/epaper-mapping'

export async function GET(_: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('epaper_page_mappings')
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data: data ?? [] })
}

export async function POST(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await req.json()) as { mappings?: unknown[] }
  const rawMappings = Array.isArray(payload.mappings) ? payload.mappings : []

  try {
    const normalized = rawMappings.map((item) => normalizeMappingInput(item as Record<string, unknown>, pageId))

    const { error: deleteError } = await supabase
      .from('epaper_page_mappings')
      .delete()
      .eq('page_id', pageId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    if (normalized.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const { data, error } = await supabase
      .from('epaper_page_mappings')
      .insert(normalized)
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: sortMappings(data ?? []) })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid mapping payload.' },
      { status: 422 },
    )
  }
}
