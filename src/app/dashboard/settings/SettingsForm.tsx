'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type ClientData = {
  id: string
  site_name: string
  theme_color: string
  logo_url: string | null
  subdomain: string | null
  custom_domain: string | null
}

export default function SettingsForm({ client }: { client: ClientData }) {
  const [siteName, setSiteName] = useState(client.site_name)
  const [themeColor, setThemeColor] = useState(client.theme_color || '#dc2626')
  const [logoUrl, setLogoUrl] = useState(client.logo_url || '')
  
  // Parse custom_domain back to root domain if it starts with epaper.
  const initialRootDomain = (client.custom_domain || '').replace(/^epaper\./, '')
  const [rootDomain, setRootDomain] = useState(initialRootDomain)
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const fullCustomDomain = rootDomain ? `epaper.${rootDomain}` : null

    const { error } = await supabase
      .from('clients')
      .update({
        site_name: siteName,
        theme_color: themeColor,
        logo_url: logoUrl || null,
        custom_domain: fullCustomDomain,
      })
      .eq('id', client.id)

    if (error) {
      if (error.message.includes('unique') || error.code === '23505') {
        setMessage(`Error: The domain ${fullCustomDomain} is already registered to another account.`)
      } else {
        setMessage('Error saving settings: ' + error.message)
      }
    } else {
      setMessage('Settings saved successfully!')
      router.refresh()
    }
    setSaving(false)
  }

  const previewUrl = rootDomain ? `https://epaper.${rootDomain}` : null
  
  // HOSTINGER INSTRUCTIONS
  // The user hosts the main app on Hostinger. They should replace this IP with their actual Hostinger VPS/Panel IP.
  const HOSTINGER_IP = "YOUR_HOSTINGER_SERVER_IP" 

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

      {/* ── Client Custom Domain ── */}
      <div className="flex flex-col gap-2 border-t pt-6 mt-2">
        <h3 className="text-lg font-medium">Domain Settings</h3>
        <p className="text-sm text-gray-500 mb-2">
          Your e-paper will be available at <span className="font-mono font-semibold text-blue-700">epaper.[your-domain].com</span>
        </p>

        <label htmlFor="root_domain" className="text-sm font-medium">Your Root Domain</label>
        <div className="flex items-center gap-0 border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-600">
          <span className="px-3 py-2 bg-gray-50 border-r text-sm text-gray-500 font-mono whitespace-nowrap font-semibold">
            epaper.
          </span>
          <input
            type="text"
            id="root_domain"
            value={rootDomain}
            onChange={(e) => {
              let val = e.target.value.toLowerCase().trim()
              val = val.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/^epaper\./, '')
              setRootDomain(val)
            }}
            placeholder="dawngroup.com"
            pattern="^[a-zA-Z0-9][a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$"
            className="flex-1 px-4 py-2 focus:outline-none bg-white font-mono"
          />
        </div>

        {rootDomain && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
            <p className="font-semibold mb-2 text-gray-900 border-b pb-2">Hostinger DNS Configuration Required</p>
            <p className="text-gray-600 mb-4">
              To connect your domain, log into your domain registrar (GoDaddy, Namecheap, Hostinger, etc.) and add the following <strong>A Record</strong>:
            </p>

            <div className="space-y-4">
              <div className="bg-white p-3 border rounded">
                <div className="flex flex-col gap-1 *:flex *:justify-between *:items-center">
                  <div><span className="font-medium text-gray-500 text-xs">Type</span><span className="font-mono text-sm select-all font-semibold text-blue-700">A Record</span></div>
                  <div><span className="font-medium text-gray-500 text-xs">Name / Host</span><span className="font-mono text-sm select-all font-semibold">epaper</span></div>
                  <div><span className="font-medium text-gray-500 text-xs">Points to / Target</span><span className="font-mono text-sm select-all">{HOSTINGER_IP}</span></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">Note: DNS propagation can take up to 24 hours.</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Preview Live Site →
          </a>
        )}
      </div>
    </form>
  )
}
