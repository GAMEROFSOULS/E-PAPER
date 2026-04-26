import type { MappingPayload, MappingTargetType } from '@/types/epaper-mapping'

const TARGET_TYPES: MappingTargetType[] = ['article', 'clipping', 'external_url', 'popup']

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(1, value))
}

export function normalizeMappingInput(input: Partial<MappingPayload>, pageId: string): MappingPayload {
  const targetType = TARGET_TYPES.includes(input.target_type as MappingTargetType)
    ? (input.target_type as MappingTargetType)
    : 'article'

  const x = clamp01(Number(input.x))
  const y = clamp01(Number(input.y))
  const width = clamp01(Number(input.width))
  const height = clamp01(Number(input.height))

  if (width <= 0 || height <= 0) {
    throw new Error('Width and height must be greater than zero.')
  }

  if (x + width > 1.001 || y + height > 1.001) {
    throw new Error('Mapped area is outside image bounds.')
  }

  return {
    page_id: pageId,
    article_id: input.article_id ?? null,
    title: input.title?.trim() || null,
    shape: 'rect',
    x,
    y,
    width,
    height,
    coords_json: input.coords_json ?? null,
    target_type: targetType,
    target_value: input.target_value?.trim() || null,
    sort_order: Number.isFinite(Number(input.sort_order)) ? Number(input.sort_order) : 0,
  }
}

export function sortMappings<T extends { sort_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order)
}
