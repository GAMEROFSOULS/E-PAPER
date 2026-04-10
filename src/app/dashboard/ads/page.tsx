import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createAd, deleteAd, toggleAd } from './actions'

type AdItem = {
  id: string
  title: string
  position: string
  image_url: string | null
  is_active: boolean
}

export default async function ManageAdsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let ads: AdItem[] = []
  if (client) {
    const { data } = await supabase
      .from('ads')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
    ads = data || []
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Advertisements</h1>
          <p className="text-gray-500 mt-1">Upload banner ads for your e-paper viewer</p>
        </div>
      </div>

      {/* Create New Ad */}
      <div className="bg-white rounded-xl border p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Ad</h2>
        <form action={createAd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Title</label>
            <input type="text" name="title" required placeholder="e.g. Summer Sale Banner"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select name="position" required
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900">
              <option value="top_banner">Top Banner (728x90)</option>
              <option value="sidebar">Sidebar (300x250)</option>
              <option value="bottom_banner">Bottom Banner (728x90)</option>
              <option value="popup">Popup Overlay</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Click-through URL</label>
            <input type="url" name="link_url" placeholder="https://example.com/landing-page"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Image</label>
            <input type="file" name="image" accept="image/*" required
              className="w-full border rounded-lg px-4 py-2 text-sm bg-white text-gray-900 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
              Upload Ad
            </button>
          </div>
        </form>
      </div>

      {/* Ad List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800">Active Advertisements ({ads.length})</h2>
        </div>
        {ads.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4-4h8m-4-7V3M5 8l3.5 3.5M19 8l-3.5 3.5" />
            </svg>
            <p className="font-medium">No ads uploaded yet</p>
            <p className="text-sm mt-1">Upload your first ad above to get started</p>
          </div>
        ) : (
          <div className="divide-y">
            {ads.map((ad) => (
              <div key={ad.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-24 h-16 border rounded overflow-hidden flex-shrink-0 bg-gray-100">
                  {ad.image_url && <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{ad.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{ad.position?.replace('_', ' ').toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded font-medium ${ad.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {ad.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <form action={toggleAd}>
                    <input type="hidden" name="id" value={ad.id} />
                    <input type="hidden" name="is_active" value={String(ad.is_active)} />
                    <button type="submit" className={`text-xs font-medium px-3 py-1.5 rounded ${ad.is_active ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'} transition-colors`}>
                      {ad.is_active ? 'Pause' : 'Activate'}
                    </button>
                  </form>
                  <form action={deleteAd}>
                    <input type="hidden" name="id" value={ad.id} />
                    <button type="submit" className="text-xs font-medium px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SQL Setup Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 text-sm mb-2">⚠️ First-time Setup Required</h3>
        <p className="text-blue-700 text-xs leading-relaxed">
          Run this SQL in your Supabase SQL Editor to create the ads table:
        </p>
        <pre className="mt-2 bg-blue-100 text-blue-900 rounded-lg p-3 text-xs overflow-x-auto">{`CREATE TABLE IF NOT EXISTS ads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  position text NOT NULL DEFAULT 'sidebar',
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ads" ON ads
  FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own ads" ON ads
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own ads" ON ads
  FOR UPDATE USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own ads" ON ads
  FOR DELETE USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Public can view active ads" ON ads
  FOR SELECT USING (is_active = true);`}</pre>
      </div>
    </div>
  )
}
