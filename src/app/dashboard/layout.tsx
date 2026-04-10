import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Settings, FileText, LogOut, Megaphone } from 'lucide-react'
import { logout } from './actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Check if client setup exists
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold tracking-tighter">Epaper CMS</span>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <LayoutDashboard size={20} className="text-gray-500" />
            <span className="font-medium text-sm">Overview</span>
          </Link>
          <Link href="/dashboard/epaper" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <FileText size={20} className="text-gray-500" />
            <span className="font-medium text-sm">Upload E-paper</span>
          </Link>

          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <Settings size={20} className="text-gray-500" />
            <span className="font-medium text-sm">Site Settings</span>
          </Link>
          <Link href="/dashboard/ads" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <Megaphone size={20} className="text-gray-500" />
            <span className="font-medium text-sm">Manage Ads</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 transition-colors">
              <LogOut size={20} />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-6 justify-between md:justify-end">
          <div className="md:hidden font-bold tracking-tighter text-lg">Epaper CMS</div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              {clientData ? clientData.site_name : 'No Site setup'}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase text-xs">
              {user.email?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
