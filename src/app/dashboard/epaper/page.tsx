import UploadClient from './UploadClient'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { deleteEpaper } from './actions'

export default async function EpaperPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientData) {
    redirect('/dashboard/setup')
  }

  // Fetch past epapers
  const { data: epapers } = await supabase
    .from('epapers')
    .select('*')
    .eq('client_id', clientData.id)
    .order('published_date', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">E-Papers</h1>
        <p className="text-gray-500 mt-1">Upload and manage your digital publications.</p>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Upload New Issue</h2>
        <UploadClient clientId={clientData.id} />
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Past Issues</h2>
        {epapers && epapers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {epapers.map(ep => (
              <div key={ep.id} className="border rounded-lg overflow-hidden flex flex-col group">
                <div className="bg-gray-100 aspect-[3/4] flex items-center justify-center border-b relative">
                  <span className="text-gray-400 font-bold">Preview</span>
                </div>
                <div className="p-3 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate pr-2">{ep.title || 'Untitled Issue'}</h3>
                    <p className="text-sm text-gray-500 mt-1">{new Date(ep.published_date).toLocaleDateString()}</p>
                  </div>
                  <form action={deleteEpaper}>
                    <input type="hidden" name="id" value={ep.id} />
                    <input type="hidden" name="file_url" value={ep.file_url} />
                    <button 
                      type="submit" 
                      className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 border border-dashed rounded-lg">
            No e-papers uploaded yet.
          </div>
        )}
      </div>
    </div>
  )
}
