'use client'

import { useState, useRef, useEffect } from 'react'
import { Document, Page as PDFPage, pdfjs } from 'react-pdf'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Setup PDF worker - safe because entire component is loaded with ssr:false
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

/* ── Inline SVG Icons (always #333 fill to avoid dark-mode issues) ── */
const IconMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconHome = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconChevLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
const IconChevRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
const IconBookmark = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
const IconFull = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
const IconGrid = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>
const IconList = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
const IconZoomIn = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
const IconZoomOut = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
const IconMinimize = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
const IconFullscreen = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
const IconPrinter = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
const IconDownload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IconShare = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
const IconAreaMap = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3h18v18H3z"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
const IconCut = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 15h12M6 9h12M9 6v12M15 6v12"/></svg>
const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconCopy = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
const IconLink = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
const IconMail = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>

/* Social brand icons */
const FacebookIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
const TwitterIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
const LinkedinIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
const TelegramIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
const WhatsAppIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>

type EpaperIssue = { id: string; title: string | null; file_url: string; published_date: string }
type Post = { id: string; title: string; content: string | null; image_url: string | null; is_headline: boolean }
type Ad = { id: string; title: string; position: string; image_url: string; link_url: string | null }
export default function EpaperViewer({ 
  issues, posts, ads = [], clientName, themeColor, clientId, logoUrl = null
}: { 
  issues: EpaperIssue[]; posts: Post[]; ads?: Ad[]; clientName: string; themeColor: string; clientId: string; logoUrl?: string | null
}) {
  const [currentPage, setCurrentPage] = useState(0)
  const [pdfNumPages, setPdfNumPages] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)
  const [viewMode, setViewMode] = useState<'full' | 'thumb' | 'list'>('full')
  const [containerWidth, setContainerWidth] = useState(900)
  const viewerWrapRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [showBreakingNews, setShowBreakingNews] = useState(true)
  
  // Area mapping states
  const [isAreaMapping, setIsAreaMapping] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [areaMapStart, setAreaMapStart] = useState<{x: number, y: number} | null>(null)
  const [areaMapEnd, setAreaMapEnd] = useState<{x: number, y: number} | null>(null)
  const [selectedArea, setSelectedArea] = useState<{x: number, y: number, width: number, height: number} | null>(null)
  const [areaMapImageUrl, setAreaMapImageUrl] = useState<string | null>(null)
  const [showAreaMapModal, setShowAreaMapModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [activeIssueId, setActiveIssueId] = useState(issues[0]?.id || null)
  void clientId

  const activeIssue = issues.find(i => i.id === activeIssueId) || issues[0] || null
  const isPDF = activeIssue?.file_url?.toLowerCase().includes('.pdf')
  
  const displayIssue = isPDF ? activeIssue : issues[currentPage]
  const totalPages = isPDF && pdfNumPages ? pdfNumPages : issues.length

  useEffect(() => {
    setCurrentPage(0)
    setZoom(1)
  }, [activeIssueId])

  // Filter Ads
  const topBanners = ads.filter(a => a.position === 'top_banner')
  const bottomBanners = ads.filter(a => a.position === 'bottom_banner')
  const sidebarAds = ads.filter(a => a.position === 'sidebar')

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      switch(e.key) {
        case 'ArrowLeft': setCurrentPage(p => Math.max(p - 1, 0)); break
        case 'ArrowRight': setCurrentPage(p => Math.min(p + 1, totalPages - 1)); break
        case '+': case '=': setZoom(z => Math.min(z + 0.25, 3)); break
        case '-': setZoom(z => Math.max(z - 0.25, 0.5)); break
        case 'Escape': 
          setIsAreaMapping(false); setSelectedArea(null); setAreaMapStart(null); setAreaMapEnd(null)
          setShowShareMenu(false); setShowAreaMapModal(false); setShowMainMenu(false)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [totalPages])

  // Measure container width for full-page PDF rendering
  useEffect(() => {
    const el = viewerWrapRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen(); setIsFullscreen(true)
    } else {
      document.exitFullscreen(); setIsFullscreen(false)
    }
  }

  // Share
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = `${clientName} - E-Paper`
  const shareOptions = [
    { name: 'WhatsApp', icon: <WhatsAppIcon />, color: '#25D366', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}` },
    { name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'Twitter / X', icon: <TwitterIcon />, color: '#000', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'LinkedIn', icon: <LinkedinIcon />, color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { name: 'Email', icon: <IconMail />, color: '#EA4335', url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}` },
    { name: 'Telegram', icon: <TelegramIcon />, color: '#0088CC', url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}` },
  ]

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // ── CROP & SHARE ──
  const toggleAreaMap = () => {
    if (isAreaMapping) {
      setIsAreaMapping(false)
      setAreaMapStart(null)
      setAreaMapEnd(null)
      setSelectedArea(null)
    } else {
      setIsAreaMapping(true)
      setAreaMapStart(null)
      setAreaMapEnd(null)
      setSelectedArea(null)
      setAreaMapImageUrl(null)
      setShowAreaMapModal(false)
    }
  }

  const cancelAreaSelection = () => {
    setIsAreaMapping(false)
    setAreaMapStart(null)
    setAreaMapEnd(null)
    setSelectedArea(null)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    const sourceEl = getCanvasOrImage()
    if (!isAreaMapping || !sourceEl) return
    e.preventDefault()
    const rect = sourceEl.getBoundingClientRect()
    const fracX = (e.clientX - rect.left) / rect.width
    const fracY = (e.clientY - rect.top) / rect.height
    const x = fracX * sourceEl.clientWidth
    const y = fracY * sourceEl.clientHeight
    setAreaMapStart({ x, y }); setAreaMapEnd({ x, y }); setIsDragging(true)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const sourceEl = getCanvasOrImage()
    if (!isDragging || !isAreaMapping || !sourceEl) return
    e.preventDefault()
    const rect = sourceEl.getBoundingClientRect()
    const fracX = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1))
    const fracY = Math.max(0, Math.min((e.clientY - rect.top) / rect.height, 1))
    const x = fracX * sourceEl.clientWidth
    const y = fracY * sourceEl.clientHeight
    setAreaMapEnd({ x, y })
  }

  const getCanvasOrImage = (): HTMLImageElement | HTMLCanvasElement | null => {
    if (imageRef.current) return imageRef.current
    // For react-pdf, we can query the canvas inside the container
    if (isPDF && containerRef.current) {
      const pdfCanvas = containerRef.current.querySelector('canvas.react-pdf__Page__canvas')
      if (pdfCanvas) return pdfCanvas as HTMLCanvasElement
    }
    return null
  }

  // ── Helper: draw source onto a new canvas and stamp logo bottom-right ──
  const compositeWithLogo = async (
    source: HTMLCanvasElement | HTMLImageElement,
    sx: number, sy: number, sw: number, sh: number
  ): Promise<string> => {
    const footerH = Math.max(100, sh * 0.12)
    const out = document.createElement('canvas')
    out.width = sw; out.height = sh + footerH
    const ctx = out.getContext('2d')!
    
    // Fill white background for whole image just in case
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, out.width, out.height)
    
    // Draw crop natively
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh)
    
    const dispUrl = typeof window !== 'undefined' ? window.location.hostname : 'epaper'
    const dateStr = displayIssue ? new Date(displayIssue.published_date + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
    const pageStr = `${dateStr} - Page ${currentPage + 1}`

    if (logoUrl) {
      await new Promise<void>((resolve) => {
        const logo = new Image()
        logo.crossOrigin = 'anonymous'
        logo.onload = () => {
          const logoMaxH = footerH * 0.4
          const logoW = (logo.naturalWidth / logo.naturalHeight) * logoMaxH
          ctx.drawImage(logo, (sw - logoW) / 2, sh + 15, logoW, logoMaxH)
          
          ctx.fillStyle = '#222'
          ctx.font = `bold ${Math.max(14, footerH * 0.18)}px system-ui, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(dispUrl, sw / 2, sh + 15 + logoMaxH + 8)
          
          ctx.fillStyle = '#666'
          ctx.font = `${Math.max(11, footerH * 0.14)}px system-ui, sans-serif`
          ctx.fillText(pageStr, sw / 2, sh + 15 + logoMaxH + 8 + Math.max(14, footerH * 0.18) + 4)
          resolve()
        }
        logo.onerror = () => resolve()
        logo.src = logoUrl!
      })
    } else {
      ctx.fillStyle = '#222'
      ctx.font = `bold ${Math.max(16, footerH * 0.25)}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(dispUrl, sw / 2, sh + footerH / 2 - 10)
      
      ctx.fillStyle = '#666'
      ctx.font = `${Math.max(12, footerH * 0.18)}px system-ui, sans-serif`
      ctx.fillText(pageStr, sw / 2, sh + footerH / 2 + 15)
    }

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    return out.toDataURL('image/png')
  }

  const onMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    const sourceEl = getCanvasOrImage()
    if (!areaMapStart || !areaMapEnd || !sourceEl) return

    const x = Math.min(areaMapStart.x, areaMapEnd.x)
    const y = Math.min(areaMapStart.y, areaMapEnd.y)
    const width = Math.abs(areaMapEnd.x - areaMapStart.x)
    const height = Math.abs(areaMapEnd.y - areaMapStart.y)

    if (width < 20 || height < 20) {
      setAreaMapStart(null)
      setAreaMapEnd(null)
      return
    }

    setSelectedArea({ x, y, width, height })
    setIsAreaMapping(false)
  }

  const cutAndShare = async () => {
    const sourceEl = getCanvasOrImage()
    if (!selectedArea || !sourceEl) return

    setIsProcessing(true)
    try {
      let finalCanvas: HTMLCanvasElement | HTMLImageElement | null = null
      let sx = 0, sy = 0, sw = 0, sh = 0

      if (isPDF && pdfDocument) {
        // HIGH-RES PDF RENDER (4x Scale for zero pixel loss)
        const page = await pdfDocument.getPage(currentPage + 1)
        const scale = 4.0
        const viewport = page.getViewport({ scale })
        
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const context = canvas.getContext('2d')!
        
        await page.render({ canvasContext: context, canvas, viewport }).promise
        finalCanvas = canvas

        // Calculate mapped coordinates on high-res canvas
        const clientWidth = sourceEl.clientWidth
        const clientHeight = sourceEl.clientHeight
        const scaleX = viewport.width / clientWidth
        const scaleY = viewport.height / clientHeight

        sx = selectedArea.x * scaleX
        sy = selectedArea.y * scaleY
        sw = Math.min(selectedArea.width * scaleX, viewport.width - sx)
        sh = Math.min(selectedArea.height * scaleY, viewport.height - sy)
      } else {
        // IMAGE MODE High-Res
        const isCanvas = sourceEl.tagName.toLowerCase() === 'canvas'
        const sourceWidth = isCanvas ? (sourceEl as HTMLCanvasElement).width : (sourceEl as HTMLImageElement).naturalWidth
        const sourceHeight = isCanvas ? (sourceEl as HTMLCanvasElement).height : (sourceEl as HTMLImageElement).naturalHeight
        const clientWidth = sourceEl.clientWidth
        const clientHeight = sourceEl.clientHeight

        const scaleX = sourceWidth / clientWidth
        const scaleY = sourceHeight / clientHeight

        sx = selectedArea.x * scaleX
        sy = selectedArea.y * scaleY
        sw = selectedArea.width * scaleX
        sh = selectedArea.height * scaleY
        finalCanvas = sourceEl
      }

      if (sw < 10 || sh < 10) {
        setIsProcessing(false)
        return
      }

      if (!finalCanvas) return
      const dataUrl = await compositeWithLogo(finalCanvas, sx, sy, sw, sh)
      setAreaMapImageUrl(dataUrl)
      setShowAreaMapModal(true)
    } catch (err) {
      console.error("High-res export failed:", err)
      alert("Failed to generate high-resolution image.")
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadAreaMap = () => {
    if (!areaMapImageUrl) return
    const a = document.createElement('a')
    a.href = areaMapImageUrl; a.download = `${clientName}-area-map.png`; a.click()
  }

  const printAreaMap = () => {
    if (!areaMapImageUrl) return
    const printWin = window.open('', '_blank')
    if (printWin) {
      printWin.document.write(`
        <html>
          <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#eee;">
            <img src="${areaMapImageUrl}" style="max-width:100%; height:auto;" onload="window.print(); window.close();" />
          </body>
        </html>
      `)
      printWin.document.close()
    }
  }

  const printCurrentPage = async () => {
    setIsProcessing(true)
    try {
      const sourceEl = getCanvasOrImage()
      if (!sourceEl) return

      let dataUrl = ''
      if (isPDF && pdfDocument) {
        const page = await pdfDocument.getPage(currentPage + 1)
        const scale = 3.0
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width; canvas.height = viewport.height
        const context = canvas.getContext('2d')!
        await page.render({ canvasContext: context, canvas, viewport }).promise
        dataUrl = await compositeWithLogo(canvas, 0, 0, canvas.width, canvas.height)
      } else {
        const isCanvas = sourceEl.tagName.toLowerCase() === 'canvas'
        const cWidth = isCanvas ? (sourceEl as HTMLCanvasElement).width : (sourceEl as HTMLImageElement).naturalWidth
        const cHeight = isCanvas ? (sourceEl as HTMLCanvasElement).height : (sourceEl as HTMLImageElement).naturalHeight
        dataUrl = await compositeWithLogo(sourceEl, 0, 0, cWidth, cHeight)
      }

      const win = window.open('', '_blank')
      if (win) {
        win.document.write(`
          <html>
            <head><title>Print Page ${currentPage + 1} - ${clientName}</title></head>
            <body style="margin:0; padding:0; display:flex; justify-content:center; align-items:flex-start;">
              <img src="${dataUrl}" style="max-width:100%; height:auto;" onload="window.print(); window.setTimeout(() => window.close(), 500);" />
            </body>
          </html>
        `)
        win.document.close()
      }
    } catch (err) {
      console.error("Print failed:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const headlines = posts.filter(p => p.is_headline).map(p => p.title)

  /* ─────────── Render ─────────── */
  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#e5e7eb', color: '#333', fontFamily: 'system-ui, sans-serif' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* DIAGNOSTIC TAG */}
      {/* ════════ TOOLBAR ════════ */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', height: '44px', flexShrink: 0, zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        
        {/* LEFT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          
          {/* Main Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <ToolbarBtn onClick={() => setShowMainMenu(!showMainMenu)} title="Menu" active={showMainMenu}><IconMenu /></ToolbarBtn>
            {showMainMenu && (
              <div style={{ position: 'absolute', left: 0, top: '100%', marginTop: '4px', width: '220px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 100 }}>
                <div style={{ padding: '8px' }}>
                  <MenuBtn icon={<IconFull />} label="Full Page View" active={viewMode === 'full'} onClick={() => { setViewMode('full'); setShowMainMenu(false) }} />
                  <MenuBtn icon={<IconGrid />} label="Thumbnail View" active={viewMode === 'thumb'} onClick={() => { setViewMode('thumb'); setShowMainMenu(false) }} />
                  <MenuBtn icon={<IconList />} label="Page List View" active={viewMode === 'list'} onClick={() => { setViewMode('list'); setShowMainMenu(false) }} />
                </div>
              </div>
            )}
          </div>

          <ToolbarBtn onClick={() => { setCurrentPage(0); setZoom(1); setViewMode('full') }} title="Home"><IconHome /></ToolbarBtn>
          
          <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 6px' }} />
          
          {/* Date Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }} title="View Past Issues">
            <IconCalendar />
            <input 
              type="date"
              value={displayIssue ? displayIssue.published_date : ''}
              min={issues.length > 0 ? issues[issues.length - 1].published_date : ''}
              max={issues.length > 0 ? issues[0].published_date : ''}
              onChange={(e) => {
                const selected = issues.find(i => i.published_date === e.target.value)
                if (selected) setActiveIssueId(selected.id)
                else alert('No newspaper issue found on this specific date. Try another date!')
              }}
              style={{ 
                fontWeight: 600, border: 'none', background: 'transparent', outline: 'none', color: '#333', cursor: 'pointer', fontFamily: 'inherit' 
              }}
            />
          </div>

          <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 6px' }} />

          {/* Page Nav */}
          <ToolbarBtn onClick={() => setCurrentPage(p => Math.max(p - 1, 0))} disabled={currentPage === 0} title="Previous"><IconChevLeft /></ToolbarBtn>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#333', padding: '0 4px', whiteSpace: 'nowrap' }}>
            {totalPages > 0 ? `${currentPage + 1}: Page ${currentPage + 1}` : 'No pages'}
          </span>
          <ToolbarBtn onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))} disabled={currentPage >= totalPages - 1} title="Next"><IconChevRight /></ToolbarBtn>
        </div>

        {/* CENTER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <ToolbarBtn onClick={() => {}} title="Bookmark"><IconBookmark /></ToolbarBtn>

          <ToolbarBtn onClick={() => setZoom(z => Math.min(z + 0.25, 3))} title="Zoom In"><IconZoomIn /></ToolbarBtn>
          <ToolbarBtn onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} title="Zoom Out"><IconZoomOut /></ToolbarBtn>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <ToolbarBtn onClick={toggleFullscreen} title="Fullscreen">
            {isFullscreen ? <IconMinimize /> : <IconFullscreen />}
          </ToolbarBtn>
          <ToolbarBtn onClick={printCurrentPage} title="Print Current Page"><IconPrinter /></ToolbarBtn>
          {displayIssue && (
            <div style={{ position: 'relative' }} className="download-btn-wrap">
              <button
                onClick={async () => {
                  setIsProcessing(true)
                  try {
                    const sourceEl = getCanvasOrImage()
                    if (!sourceEl) return
                    
                    let dataUrl = ''
                    if (isPDF && pdfDocument) {
                      const page = await pdfDocument.getPage(currentPage + 1)
                      const scale = 3.0
                      const viewport = page.getViewport({ scale })
                      const canvas = document.createElement('canvas')
                      canvas.width = viewport.width; canvas.height = viewport.height
                      await page.render({ canvasContext: canvas.getContext('2d')!, canvas, viewport }).promise
                      dataUrl = await compositeWithLogo(canvas, 0, 0, canvas.width, canvas.height)
                    } else {
                      const isCanvas = sourceEl.tagName.toLowerCase() === 'canvas'
                      const sw = isCanvas ? (sourceEl as HTMLCanvasElement).width : (sourceEl as HTMLImageElement).naturalWidth
                      const sh = isCanvas ? (sourceEl as HTMLCanvasElement).height : (sourceEl as HTMLImageElement).naturalHeight
                      dataUrl = await compositeWithLogo(sourceEl, 0, 0, sw, sh)
                    }

                    const a = document.createElement('a')
                    a.href = dataUrl
                    a.download = `${clientName}-page-${currentPage + 1}.png`
                    a.click()
                  } catch (err) {
                    console.error("Download failed:", err)
                  } finally {
                    setIsProcessing(false)
                  }
                }}
                style={{ display: 'flex', border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px', borderRadius: '4px', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#333' }}
                title="Download current page (High Res)"
              >
                <IconDownload />
              </button>
            </div>
          )}

          {/* Share */}
          <div style={{ position: 'relative' }}>
            <ToolbarBtn onClick={() => setShowShareMenu(!showShareMenu)} title="Share" active={showShareMenu}><IconShare /></ToolbarBtn>
            {showShareMenu && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', width: '260px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 100, animation: 'fadeInDown 0.15s ease-out' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>Share this page</span>
                  <button onClick={() => setShowShareMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><IconX /></button>
                </div>
                <div style={{ padding: '8px' }}>
                  {shareOptions.map(opt => (
                    <a key={opt.name} href={opt.url} target="_blank" rel="noopener noreferrer" onClick={() => setShowShareMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', color: '#333', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: opt.color, flexShrink: 0 }}>{opt.icon}</div>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{opt.name}</span>
                    </a>
                  ))}
                  <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '4px', paddingTop: '4px' }}>
                    <button onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', width: '100%', color: '#333', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#6b7280', flexShrink: 0 }}>{copied ? <IconCopy /> : <IconLink />}</div>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════ BREAKING NEWS TICKER ════════ */}
      {showBreakingNews && headlines.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '13px', overflow: 'hidden', flexShrink: 0, background: themeColor }}>
          <span style={{ fontWeight: 800, padding: '6px 12px', background: 'rgba(0,0,0,0.2)', whiteSpace: 'nowrap', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>Breaking News</span>
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div className="animate-marquee" style={{ whiteSpace: 'nowrap', padding: '6px 0' }}>
              {headlines.map((h, i) => <span key={i} style={{ margin: '0 32px', fontWeight: 500 }}>{h}</span>)}
            </div>
          </div>
          <button onClick={() => setShowBreakingNews(false)} style={{ padding: '6px 8px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* ════════ HIGH-RES AREA MAP MODAL ════════ */}
      {showAreaMapModal && areaMapImageUrl && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowAreaMapModal(false)}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111' }}>Share & Print Selection</h3>
              <button onClick={() => { setShowAreaMapModal(false); setIsAreaMapping(false); setSelectedArea(null); setAreaMapStart(null); setAreaMapEnd(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><IconX /></button>
            </div>
            {/* Branded strip showing logo is embedded */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: themeColor, borderRadius: '0' }}>
              {logoUrl
                ? <img src={logoUrl} alt={clientName} style={{ height: '28px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} crossOrigin="anonymous" />
                : <span style={{ fontWeight: 800, fontSize: '16px', color: '#fff', letterSpacing: '0.5px' }}>{clientName}</span>
              }
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 500 }}>— Logo & branding included in export</span>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <img src={areaMapImageUrl} alt="Area Selection" style={{ width: '100%', borderRadius: '8px', border: '1px solid #eee', marginBottom: '16px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <ShareBtn color="#111" onClick={downloadAreaMap} icon={<IconDownload />} label="Download full res" />
                <ShareBtn color="#4b5563" onClick={printAreaMap} icon={<IconPrinter />} label="Print exactly this" />
                <ShareBtn color="#25D366" onClick={() => { downloadAreaMap(); window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle)}`) }} icon={<WhatsAppIcon />} label="WhatsApp" />
                <ShareBtn color="#000" onClick={() => { downloadAreaMap(); window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}`) }} icon={<TwitterIcon />} label="X / Twitter" />
                <ShareBtn color="#1877F2" onClick={() => { downloadAreaMap(); window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`) }} icon={<FacebookIcon />} label="Facebook" />
                <ShareBtn color="#0088CC" onClick={() => { downloadAreaMap(); window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`) }} icon={<TelegramIcon />} label="Telegram" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MAIN RENDERING AREA ════════ */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', background: '#d1d5db', position: 'relative' }}>
        
        {/* TOP BANNER */}
        {viewMode === 'full' && topBanners.length > 0 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
            <AdItem ad={topBanners[0]} />
          </div>
        )}

        {/* DYNAMIC VIEW MODE */}
        <div ref={viewerWrapRef} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: viewMode === 'full' ? '0' : '0' }}>
          
          {/* Main Viewer (Full Page - newspaper style) */}
          {viewMode === 'full' && displayIssue && (
            <div style={{ display: 'flex', gap: '16px', width: '100%', alignItems: 'flex-start' }}>
              
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div style={{ position: 'relative', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', userSelect: 'none', width: '100%', maxWidth: `${containerWidth}px` }}>
                    <div
                      style={{ position: 'relative', cursor: isAreaMapping ? 'crosshair' : 'default', width: '100%' }}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={onMouseUp}
                      onMouseLeave={() => { if (isDragging) { setIsDragging(false) } }}
                    >
                      {isPDF ? (
                        <Document
                          file={displayIssue.file_url}
                          onLoadSuccess={(pdf) => {
                            setPdfNumPages(pdf.numPages)
                            setPdfDocument(pdf)
                          }}
                          loading={<div style={{ padding: '80px', color: '#666', textAlign: 'center' }}>Loading PDF...</div>}
                        >
                          <PDFPage
                            pageNumber={currentPage + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={Math.floor(containerWidth * zoom)}
                          />
                        </Document>
                      ) : (
                        <img
                          ref={imageRef}
                          src={displayIssue.file_url}
                          alt={displayIssue.title || 'E-paper'}
                          style={{ width: `${100 * zoom}%`, height: 'auto', display: 'block', userSelect: 'none' }}
                          draggable={false}
                          crossOrigin="anonymous"
                        />
                      )}

                      
                      {/* Area selection overlay */}
                      {(isAreaMapping || selectedArea) && areaMapStart && areaMapEnd && (
                        <div style={{
                          position: 'absolute', border: '2px dashed #2563eb',
                          background: 'rgba(37,99,235,0.12)',
                          left: Math.min(areaMapStart.x, areaMapEnd.x),
                          top: Math.min(areaMapStart.y, areaMapEnd.y),
                          width: Math.abs(areaMapEnd.x - areaMapStart.x),
                          height: Math.abs(areaMapEnd.y - areaMapStart.y),
                          pointerEvents: 'none', zIndex: 10
                        }}>
                          <div style={{ position: 'absolute', top: '-28px', left: 0, background: '#2563eb', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {isAreaMapping ? 'Drag to select' : 'Area selected'}
                          </div>
                        </div>
                      )}

                      {selectedArea && !isAreaMapping && (
                        <div style={{ position: 'absolute', left: selectedArea.x + (selectedArea.width / 2), top: Math.max(8, selectedArea.y - 46), transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: '8px' }}>
                          <button
                            onClick={cutAndShare}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                              borderRadius: '8px', border: 'none', background: '#ffffff', color: '#111827',
                              fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                              whiteSpace: 'nowrap', animation: 'scaleIn 0.2s ease-out'
                            }}
                          >
                            <IconCut /> Share
                          </button>
                          <button
                            onClick={cancelAreaSelection}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                              borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff',
                              fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                              whiteSpace: 'nowrap', animation: 'scaleIn 0.2s ease-out'
                            }}
                          >
                            <IconX /> Cancel
                          </button>
                        </div>
                      )}

                      {isAreaMapping && !areaMapStart && !areaMapEnd && (
                        <div style={{ position: 'absolute', left: '16px', top: '16px', zIndex: 20, background: 'rgba(255,255,255,0.92)', color: '#111', padding: '8px 12px', borderRadius: '10px', boxShadow: '0 12px 30px rgba(15,23,42,0.12)', fontSize: '13px' }}>
                          Click and drag on the page to map the area to cut and share.
                        </div>
                      )}
                    </div>
                </div>
              </div>

              {/* SIDEBAR ADS */}
              {sidebarAds.length > 0 && (
                <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sidebarAds.map(ad => <AdItem key={ad.id} ad={ad} />)}
                </div>
              )}
            </div>
          )}

          {/* Missing Epaper State */}
          {viewMode === 'full' && !displayIssue && (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#999', width: '100%' }}>
              <svg style={{ width: '80px', height: '80px', marginBottom: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>No E-Paper Published Yet</h2>
            </div>
          )}

          {/* List View (Vertically scrolling large pages) */}
          {viewMode === 'list' && (
            <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {issues.map((issue, idx) => (
                <div key={issue.id} style={{ background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Page {idx + 1}</div>
                   {issue.file_url.toLowerCase().includes('.pdf')
                      ? <iframe src={`${issue.file_url}#toolbar=0`} style={{ width: '100%', height: '1100px', border: 'none' }} />
                      : <img src={issue.file_url} alt="" style={{ width: '100%', height: 'auto' }} />}
                </div>
              ))}
            </div>
          )}

          {/* Thumb View (Grid of thumbnails) */}
          {viewMode === 'thumb' && (
             <div style={{ width: '100%', padding: '24px', background: '#f3f4f6' }}>
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '20px' }}>All Pages ({totalPages})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                  {issues.map((issue, idx) => (
                    <button key={issue.id} onClick={() => { setCurrentPage(idx); setViewMode('full') }}
                      style={{ border: currentPage === idx ? '2px solid #2563eb' : '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff', cursor: 'pointer', padding: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                      <div style={{ aspectRatio: '3/4', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {issue.file_url.toLowerCase().includes('.pdf')
                          ? <span style={{ color: '#999', fontSize: '12px', fontWeight: 700 }}>PDF</span>
                          : <img src={issue.file_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ padding: '6px 0', textAlign: 'center', borderTop: '1px solid #eee' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Page {idx + 1}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM BANNER */}
        {viewMode === 'full' && bottomBanners.length > 0 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
            <AdItem ad={bottomBanners[0]} />
          </div>
        )}

      </div>

      {/* ════════ BOTTOM PAGE STRIP ════════ */}
      {viewMode === 'full' && totalPages > 1 && (
        <div style={{ background: '#fff', borderTop: '1px solid #ddd', padding: '6px 16px', display: 'flex', justifyContent: 'center', gap: '8px', overflowX: 'auto', flexShrink: 0, minHeight: '60px' }}>
          {Array.from({ length: totalPages }).map((_, idx) => {
            // For images, issues[idx] is the source. For PDF, it's just the page idx.
            const thumbUrl = isPDF ? null : issues[idx]?.file_url;
            return (
              <button key={idx} onClick={() => setCurrentPage(idx)}
                style={{ width: '40px', height: '48px', border: currentPage === idx ? '2px solid #2563eb' : '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, padding: 0, background: '#fff', transform: currentPage === idx ? 'scale(1.1)' : 'scale(1)', opacity: currentPage === idx ? 1 : 0.6, transition: 'all 0.15s' }}>
                {isPDF || !thumbUrl
                  ? <span style={{ fontSize: '10px', fontWeight: 700, color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>P{idx + 1}</span>
                  : <img src={thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </button>
            )
          })}
        </div>
      )}

      {/* Floating Arrow Nav for full mode */}
      {viewMode === 'full' && totalPages > 1 && (
        <>
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 0))} disabled={currentPage === 0} style={{ position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', opacity: currentPage === 0 ? 0.3 : 1, zIndex: 10 }}><IconChevLeft /></button>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))} disabled={currentPage >= totalPages - 1} style={{ position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', opacity: currentPage >= totalPages - 1 ? 0.3 : 1, zIndex: 10 }}><IconChevRight /></button>
        </>
      )}

      {/* ════════ LOADING OVERLAY ════════ */}
      {isProcessing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <div style={{ fontSize: '18px', fontWeight: 700 }}>Processing High-Res Image...</div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>Optimizing for sharing without pixel loss</div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes scaleIn { from { transform: translateX(-50%) scale(0.9); opacity: 0; } to { transform: translateX(-50%) scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}

    </div>
  )
}

/* ── UI Components ── */

function ToolbarBtn({ children, onClick, title, disabled, active }: { children: React.ReactNode; onClick: () => void; title: string; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px', borderRadius: '4px', border: 'none',
        background: active ? '#e5e7eb' : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        transition: 'background 0.15s'
      }}
      onMouseEnter={e => { if (!disabled && !active) e.currentTarget.style.background = '#f3f4f6' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? '#e5e7eb' : 'transparent' }}
    >
      {children}
    </button>
  )
}

function ShareBtn({ color, onClick, icon, label }: { color: string; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: color, color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'opacity 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {icon} {label}
    </button>
  )
}

function MenuBtn({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', border: 'none', background: active ? '#f3f4f6' : 'transparent', color: '#333', cursor: 'pointer', borderRadius: '6px', textAlign: 'left', transition: 'background 0.15s' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f9fafb' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ color: '#666', display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
      {active && <span style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />}
    </button>
  )
}

function AdItem({ ad }: { ad: Ad }) {
  if (!ad) return null;
  const content = <img src={ad.image_url} alt={ad.title} style={{ maxWidth: '100%', display: 'block', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
  
  if (ad.link_url) {
    return <a href={ad.link_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>{content}</a>
  }
  return content;
}
