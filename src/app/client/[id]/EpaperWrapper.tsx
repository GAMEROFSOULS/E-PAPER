'use client'

import dynamic from 'next/dynamic'

const EpaperViewer = dynamic(() => import('./EpaperViewer'), { ssr: false })

type Props = {
  issues: { id: string; title: string | null; file_url: string; published_date: string }[]
  posts: { id: string; title: string; content: string | null; image_url: string | null; is_headline: boolean }[]
  ads: { id: string; title: string; position: string; image_url: string; link_url: string | null }[]
  clientName: string
  themeColor: string
  clientId: string
  logoUrl: string | null
}

export default function EpaperWrapper(props: Props) {
  return <EpaperViewer {...props} />
}
