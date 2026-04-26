'use client'

import dynamic from 'next/dynamic'

const EpaperViewer = dynamic(() => import('./EpaperViewer'), { ssr: false })

type Props = {
  issues: { id: string; title: string | null; file_url: string; published_date: string }[]
  posts: { id: string; title: string; content: string | null; image_url: string | null; is_headline: boolean }[]
  ads: { id: string; title: string; position: string; image_url: string; link_url: string | null }[]
  mappings: {
    id: string
    page_id: string
    article_id: string | null
    title: string | null
    shape: 'rect'
    x: number
    y: number
    width: number
    height: number
    target_type: 'article' | 'clipping' | 'external_url' | 'popup'
    target_value: string | null
    sort_order: number
  }[]
  clientName: string
  themeColor: string
  clientId: string
  logoUrl: string | null
}

export default function EpaperWrapper(props: Props) {
  return <EpaperViewer {...props} />
}
