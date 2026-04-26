export type MappingShape = 'rect'
export type MappingTargetType = 'article' | 'clipping' | 'external_url' | 'popup'

export type EpaperPageMapping = {
  id: string
  page_id: string
  article_id: string | null
  title: string | null
  shape: MappingShape
  x: number
  y: number
  width: number
  height: number
  coords_json: Record<string, unknown> | null
  target_type: MappingTargetType
  target_value: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type MappingPayload = Omit<EpaperPageMapping, 'id' | 'created_at' | 'updated_at'>
