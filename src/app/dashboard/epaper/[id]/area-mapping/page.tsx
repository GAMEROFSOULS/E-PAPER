import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AreaMappingEditor from './AreaMappingEditor'

export default async function AreaMappingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientData) redirect('/dashboard/setup')

  const { data: epaper } = await supabase
    .from('epapers')
    .select('*')
    .eq('id', id)
    .eq('client_id', clientData.id)
    .single()

  if (!epaper) redirect('/dashboard/epaper')

  return <AreaMappingEditor epaper={epaper} />
}
