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

const BASE_SUBDOMAIN_HOST = process.env.NEXT_PUBLIC_BASE_SUBDOMAIN_HOST || 'epaper.edgemindlab.cloud'

function isValidSubdomain(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) || /^[a-z0-9]$/.test(value)
}

export default function SettingsForm({ client }: { client: ClientData }) {
  const [siteName, setSiteName] = useState(client.site_name)
  const [themeColor, setThemeColor] = useState(client.theme_color || '#dc2626')
  const [logoUrl, setLogoUrl] = useState(client.logo_url || '')
  const [subdomain, setSubdomain] = useState(client.subdomain || '')
  const [customDomain, setCustomDomain] = useState(client.custom_domain || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [subdomainError, setSubdomainError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubdomainChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSubdomain(clean)
    if (clean && !isValidSubdomain(clean)) {
      setSubdomainError('Only lowercase letters, numbers, and hyphens. Must not start or end with a hyphen.')
    } else {
      setSubdomainError(null)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (subdomain && !isValidSubdomain(subdomain)) {
      setSubdomainError('Invalid subdomain format.')
      return
    }
    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('clients')
      .update({
        site_name: siteName,
        theme_color: themeColor,
        logo_url: logoUrl || null,
        subdomain: subdomain || null,
        custom_domain: customDomain || null,
      })
      .eq('id', client.id)

    if (error) {
      if (error.message.includes('unique') || error.code === '23505') {
        setMessage('Error: That subdomain is already taken. Please choose a different one.')
      } else {
        setMessage('Error saving settings: ' + error.message)
      }
    } else {
      setMessage('Settings saved successfully!')
      router.refresh()
    }
    setSaving(false)
  }

  const previewUrl = subdomain ? `https://${subdomain}.${BASE_SUBDOMAIN_HOST}` : null

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

      {/* ── Platform Subdomain ── */}
      <div className="flex flex-col gap-2 border-t pt-6 mt-2">
        <h3 className="text-lg font-medium">Your Epaper Subdomain</h3>
        <p className="text-sm text-gray-500 mb-2">
          Choose a unique slug for your publication. Your readers will visit{' '}
          <span className="font-mono font-semibold text-gray-700">[slug].{BASE_SUBDOMAIN_HOST}</span>
        </p>

        <label htmlFor="subdomain" className="text-sm font-medium">Subdomain Slug</label>
        <div className="flex items-center gap-0 border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-600">
          <input
            type="text"
            id="subdomain"
            value={subdomain}
            onChange={(e) => handleSubdomainChange(e.target.value)}
            placeholder="your-publication"
            maxLength={50}
            className="flex-1 px-4 py-2 focus:outline-none bg-white"
          />
          <span className="px-3 py-2 bg-gray-50 border-l text-sm text-gray-500 font-mono whitespace-nowrap">
            .{BASE_SUBDOMAIN_HOST}
          </span>
        </div>

        {subdomainError && (
          <p className="text-xs text-red-600">{subdomainError}</p>
        )}

        {previewUrl && !subdomainError && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 mb-1">✓ Your public URL will be:</p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-blue-700 hover:underline break-all"
            >
              {previewUrl}
            </a>
          </div>
        )}
      </div>

      {/* ── Custom Domain (Advanced) ── */}
      <div className="flex flex-col gap-2 border-t pt-6 mt-2">
        <h3 className="text-lg font-medium">Custom Domain <span className="text-sm font-normal text-gray-500">(Advanced / Optional)</span></h3>
        <p className="text-sm text-gray-500 mb-2">
          If you own a domain like <span className="font-mono">epaper.yoursite.com</span>, enter it here. Leave empty to use your subdomain above.
        </p>

        <label htmlFor="custom_domain" className="text-sm font-medium">Domain Name</label>
        <input
          type="text"
          id="custom_domain"
          value={customDomain}
          onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
          placeholder="epaper.example.com"
          pattern="^[a-zA-Z0-9][a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$"
          title="Please enter a valid domain name (e.g., epaper.example.com)"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />

        {customDomain && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
            <p className="font-semibold mb-2 text-gray-900 border-b pb-2">DNS Configuration Required</p>
            <p className="text-gray-600 mb-4">
              Point <span className="font-mono font-semibold">{customDomain}</span> to this app by adding a CNAME record:
            </p>

            <div className="space-y-4">
              <div className="bg-white p-3 border rounded">
                <span className="block text-xs font-bold text-gray-500 uppercase mb-2">Via CNAME (Vercel/Netlify/Cloudflare)</span>
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
          disabled={saving || !!subdomainError}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {(subdomain || customDomain) && (
          <a
            href={previewUrl || (customDomain ? `https://${customDomain}` : `/client/${client.id}`)}
            target="_blank"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Preview Public Site →
          </a>
        )}
      </div>
    </form>
  )
}
