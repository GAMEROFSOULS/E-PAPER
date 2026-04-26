import { saveClientSetup } from './actions'

const BASE_SUBDOMAIN_HOST = process.env.NEXT_PUBLIC_BASE_SUBDOMAIN_HOST || 'epaper.edgemindlab.cloud'

export default function SetupPage() {
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to Epaper CMS</h1>
      <p className="text-gray-500 mb-8">Let&apos;s set up your publication&apos;s site before we start adding e-papers.</p>
      
      <form action={saveClientSetup} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="site_name" className="text-sm font-medium">Site Name</label>
          <input 
            type="text" 
            name="site_name" 
            id="site_name" 
            required 
            placeholder="e.g. Telangana Today E-paper"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* ── Subdomain (the key field) ── */}
        <div className="flex flex-col gap-2">
          <label htmlFor="subdomain" className="text-sm font-medium">
            Your Subdomain <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500">
            This is your unique address. Choose wisely — readers will visit{' '}
            <span className="font-mono font-semibold text-gray-700">[slug].{BASE_SUBDOMAIN_HOST}</span>
          </p>
          <div className="flex items-center gap-0 border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-600">
            <input
              type="text"
              name="subdomain"
              id="subdomain"
              required
              placeholder="your-publication"
              maxLength={50}
              pattern="^[a-z0-9][a-z0-9\-]*[a-z0-9]$|^[a-z0-9]$"
              title="Lowercase letters, numbers, and hyphens only. Must not start or end with a hyphen."
              className="flex-1 px-4 py-2 focus:outline-none bg-white"
              onInput={(e) => {
                const el = e.currentTarget
                el.value = el.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
              }}
            />
            <span className="px-3 py-2 bg-gray-50 border-l text-sm text-gray-500 font-mono whitespace-nowrap">
              .{BASE_SUBDOMAIN_HOST}
            </span>
          </div>
          <p className="text-xs text-gray-400">Only lowercase letters, numbers, and hyphens. Example: <span className="font-mono">dawn-epaper</span></p>
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="theme_color" className="text-sm font-medium">Theme Color</label>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              name="theme_color" 
              id="theme_color" 
              defaultValue="#dc2626"
              className="w-12 h-12 p-1 bg-white border rounded cursor-pointer"
            />
            <span className="text-sm text-gray-500">Select the primary color for your site&apos;s header and buttons.</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="logo_url" className="text-sm font-medium">Logo URL (Optional)</label>
          <input 
            type="url" 
            name="logo_url" 
            id="logo_url" 
            placeholder="https://example.com/logo.png"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <button type="submit" className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors self-start">
          Save and Continue
        </button>
      </form>
    </div>
  )
}
