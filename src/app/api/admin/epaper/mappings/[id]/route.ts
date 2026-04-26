import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { normalizeMappingInput } from '@/lib/epaper-mapping'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as Record<string, unknown>
  const pageId = String(body.page_id || '')
  if (!pageId) {
    return NextResponse.json({ error: 'page_id is required.' }, { status: 422 })
  }

  try {
    const normalized = normalizeMappingInput(body, pageId)
    const { data, error } = await supabase
      .from('epaper_page_mappings')
      .update(normalized)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid mapping payload.' },
      { status: 422 },
    )
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('epaper_page_mappings')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
