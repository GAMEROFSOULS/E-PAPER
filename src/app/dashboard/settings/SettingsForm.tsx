'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type ClientData = {
  id: string
  site_name: string
  theme_color: string
  logo_url: string | null
  custom_domain: string | null
}

export default function SettingsForm({ client }: { client: ClientData }) {
  const [siteName, setSiteName] = useState(client.site_name)
  const [themeColor, setThemeColor] = useState(client.theme_color || '#dc2626')
  const [logoUrl, setLogoUrl] = useState(client.logo_url || '')
  const [customDomain, setCustomDomain] = useState(client.custom_domain || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('clients')
      .update({
        site_name: siteName,
        theme_color: themeColor,
        logo_url: logoUrl || null,
        custom_domain: customDomain || null,
      })
      .eq('id', client.id)

    if (error) {
      setMessage('Error saving settings: ' + error.message)
    } else {
      setMessage('Settings saved successfully!')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-6">
      {message && (
        <div className={`p-3 rounded-md text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="site_name" className="text-sm font-medium">Site Name</label>
        <input
          type="text"
          id="site_name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="theme_color" className="text-sm font-medium">Theme Color</label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            id="theme_color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="w-12 h-12 p-1 bg-white border rounded cursor-pointer"
          />
          <span className="text-sm text-gray-500">Primary color for your public site header.</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="logo_url" className="text-sm font-medium">Logo URL (Optional)</label>
        <input
          type="url"
          id="logo_url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2 border-t pt-6 mt-2">
        <h3 className="text-lg font-medium">Custom Domain</h3>
        <p className="text-sm text-gray-500 mb-2">
          Connect your own domain (e.g. epaper.yoursite.com). Leave empty to use the default URL.
        </p>

        <label htmlFor="custom_domain" className="text-sm font-medium">Domain Name</label>
        <div className="flex gap-4">
          <input
            type="text"
            id="custom_domain"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
            placeholder="epaper.example.com"
            pattern="^[a-zA-Z0-9][a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$"
            title="Please enter a valid domain name (e.g., epaper.example.com)"
            className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {customDomain && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
            <p className="font-semibold mb-2 text-gray-900 border-b pb-2">DNS Configuration Required</p>
            <p className="text-gray-600 mb-4">
              To connect this domain, your client must log into their domain registrar (Hostinger, GoDaddy, Namecheap, etc.) and add ONE of the following records to point to your main application:
            </p>

            <div className="space-y-4">
              <div className="bg-white p-3 border rounded">
                <span className="block text-xs font-bold text-gray-500 uppercase mb-2">Option A: Via IP Address (If you host on Hostinger VPS, cPanel, or Railway)</span>
                <div className="flex flex-col gap-1 *:flex *:justify-between *:items-center">
                  <div><span className="font-medium text-gray-500 text-xs">Type</span><span className="font-mono text-sm select-all font-semibold">A Record</span></div>
                  <div><span className="font-medium text-gray-500 text-xs">Name</span><span className="font-mono text-sm select-all">{customDomain.split('.')[0] === 'www' ? 'www' : customDomain.split('.').length > 2 ? customDomain.split('.')[0] : '@'}</span></div>
                  <div><span className="font-medium text-gray-500 text-xs">Target</span><span className="font-mono text-sm select-all">192.168.x.x (Your Server IP)</span></div>
                </div>
              </div>

              <div className="bg-white p-3 border rounded">
                <span className="block text-xs font-bold text-gray-500 uppercase mb-2">Option B: Via CNAME (If you use Vercel/Netlify/Cloudflare)</span>
                <div className="flex flex-col gap-1 *:flex *:justify-between *:items-center">
                  <div><span className="font-medium text-gray-500 text-xs">Type</span><span className="font-mono text-sm select-all font-semibold">CNAME</span></div>
                  <div><span className="font-medium text-gray-500 text-xs">Name</span><span className="font-mono text-sm select-all">{customDomain.split('.')[0] === 'www' ? 'www' : customDomain.split('.').length > 2 ? customDomain.split('.')[0] : '@'}</span></div>
                  <div><span className="font-medium text-gray-500 text-xs">Target</span><span className="font-mono text-sm select-all">{process.env.NEXT_PUBLIC_APP_DOMAIN || 'your-main-app-domain.com'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <a
          href={`/client/${client.id}`}
          target="_blank"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Preview Public Site →
        </a>
      </div>
    </form>
  )
}
