import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if client setup exists
  const { data: clientData, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!clientData || error) {
    redirect('/dashboard/setup')
  }

  // Fetch some metrics
  const { count: epaperCount } = await supabase.from('epapers').select('*', { count: 'exact', head: true }).eq('client_id', clientData.id)
  const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('client_id', clientData.id)

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back to {clientData.site_name} dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col">
          <span className="text-sm font-medium text-gray-500">Live Site URL</span>
          <a href={`/client/${clientData.id}`} target="_blank" className="font-semibold text-lg text-blue-600 mt-1 hover:underline truncate">
            /client/{clientData.id.split('-')[0]}
          </a>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col">
          <span className="text-sm font-medium text-gray-500">Total E-papers Published</span>
          <span className="font-bold text-3xl mt-1">{epaperCount || 0}</span>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col">
          <span className="text-sm font-medium text-gray-500">Total News Posts</span>
          <span className="font-bold text-3xl mt-1">{postsCount || 0}</span>
        </div>
      </div>
      
      <div className="bg-white border rounded-xl p-8 flex flex-col items-center justify-center text-center mt-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Publish your latest E-paper</h3>
        <p className="text-gray-500 mt-2 max-w-md">Upload a new PDF to publish today&apos;s newspaper issue. You can map interactive areas after uploading.</p>
        <a href="/dashboard/epaper" className="mt-6 bg-gray-900 text-white px-5 py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors">
          Upload E-paper
        </a>
      </div>
    </div>
  )
}
