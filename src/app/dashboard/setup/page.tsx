import { saveClientSetup } from './actions'

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

        {/* ── Client Custom Domain ── */}
        <div className="flex flex-col gap-2 border p-4 rounded-lg bg-gray-50">
          <label htmlFor="client_domain" className="text-sm font-medium">
            Your Root Domain <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Enter your main website domain (e.g., <span className="font-mono text-gray-700">dawngroup.com</span>). 
            Your e-paper will be available at <span className="font-mono font-semibold text-blue-700">epaper.dawngroup.com</span>
          </p>
          <div className="flex items-center gap-0 border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 bg-white">
            <span className="px-3 py-2 bg-gray-100 border-r text-sm text-gray-600 font-mono font-medium whitespace-nowrap">
              epaper.
            </span>
            <input
              type="text"
              name="client_domain"
              id="client_domain"
              required
              placeholder="yourwebsite.com"
              pattern="^[a-zA-Z0-9][a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$"
              title="Enter a valid root domain, like yourwebsite.com"
              className="flex-1 px-4 py-2 focus:outline-none bg-white font-mono text-sm"
            />
          </div>
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
