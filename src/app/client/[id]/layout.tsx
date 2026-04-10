import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient()
  const { data: client } = await supabase.from('clients').select('site_name').eq('id', resolvedParams.id).single()
  return { title: client?.site_name || 'Epaper Publication' }
}

export default async function ClientLayout({ children, params }: { children: React.ReactNode, params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient()
  
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !client) {
    notFound()
  }

  const themeStyle = {
    '--theme-color': client.theme_color || '#dc2626',
  } as React.CSSProperties

  return (
    <div style={themeStyle} className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Top Brand Header */}
      <header className="bg-white border-b shadow-sm shrink-0 z-50">
        <div className="px-4 h-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {client.logo_url ? (
              <img src={client.logo_url} alt={client.site_name} className="h-7 object-contain" />
            ) : (
              <span className="text-lg font-serif font-black tracking-tight" style={{ color: client.theme_color || '#dc2626' }}>
                {client.site_name}
              </span>
            )}
            <span className="text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase" style={{ backgroundColor: client.theme_color || '#dc2626' }}>E-PAPER</span>
          </div>

          <div className="flex items-center gap-2">
            <a href="https://play.google.com/store" target="_blank" className="hidden md:block">
              <div className="bg-black text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 font-medium">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
                Google Play
              </div>
            </a>
            <a href="https://apps.apple.com" target="_blank" className="hidden md:block">
              <div className="bg-black text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 font-medium">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,16.94 2.94,12.39 4.7,9.29C5.57,7.74 7.13,6.76 8.82,6.74C10.1,6.72 11.32,7.62 12.11,7.62C12.89,7.62 14.37,6.53 15.92,6.71C16.57,6.73 18.39,6.98 19.56,8.67C19.47,8.74 17.39,9.92 17.41,12.44C17.44,15.46 20.06,16.44 20.09,16.45C20.06,16.51 19.68,17.84 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/></svg>
                App Store
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Children fill remaining space */}
      {children}
    </div>
  )
}
