'use client'

import { useMemo, useRef, useState, type MouseEvent } from 'react'
import Link from 'next/link'
import type { EpaperPageMapping, MappingPayload, MappingTargetType } from '@/types/epaper-mapping'

type Epaper = {
  id: string
  title: string | null
  file_url: string
  published_date: string
}

type DraftRect = { x: number; y: number; width: number; height: number }
type Point = { x: number; y: number }
type DragMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se'

const targetTypeOptions: MappingTargetType[] = ['article', 'clipping', 'external_url', 'popup']

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export default function AreaMappingEditor({ epaper }: { epaper: Epaper }) {
  const [mappings, setMappings] = useState<EpaperPageMapping[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [imgNatural, setImgNatural] = useState({ width: 1, height: 1 })
  const [imgSize, setImgSize] = useState({ width: 1, height: 1 })
  const [drawingStart, setDrawingStart] = useState<Point | null>(null)
  const [drawingRect, setDrawingRect] = useState<DraftRect | null>(null)
  const [dragging, setDragging] = useState<{ id: string; mode: DragMode; start: Point; base: DraftRect } | null>(null)

  const imgRef = useRef<HTMLImageElement>(null)

  const isPdf = epaper.file_url.toLowerCase().includes('.pdf')
  const selected = useMemo(
    () => mappings.find((item) => item.id === selectedId) || null,
    [mappings, selectedId],
  )

  async function loadMappings() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/epaper/pages/${epaper.id}/mappings`)
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'Failed to load mappings.')
      setMappings(payload.data || [])
      setSelectedId(payload.data?.[0]?.id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mappings.')
    } finally {
      setLoading(false)
    }
  }

  async function saveMappings() {
    setSaving(true)
    setError(null)
    try {
      const payload: Partial<MappingPayload>[] = mappings.map((mapping, idx) => ({
        page_id: epaper.id,
        article_id: mapping.article_id,
        title: mapping.title,
        shape: 'rect',
        x: mapping.x,
        y: mapping.y,
        width: mapping.width,
        height: mapping.height,
        coords_json: null,
        target_type: mapping.target_type,
        target_value: mapping.target_value,
        sort_order: idx,
      }))

      const res = await fetch(`/api/admin/epaper/pages/${epaper.id}/mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save mappings.')
      setMappings(data.data || [])
      setSelectedId(data.data?.[0]?.id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mappings.')
    } finally {
      setSaving(false)
    }
  }

  function toPxRect(item: EpaperPageMapping): DraftRect {
    return {
      x: item.x * imgSize.width,
      y: item.y * imgSize.height,
      width: item.width * imgSize.width,
      height: item.height * imgSize.height,
    }
  }

  function toNormalizedRect(rect: DraftRect): Pick<EpaperPageMapping, 'x' | 'y' | 'width' | 'height'> {
    return {
      x: rect.x / imgSize.width,
      y: rect.y / imgSize.height,
      width: rect.width / imgSize.width,
      height: rect.height / imgSize.height,
    }
  }

  function getRelativePoint(event: MouseEvent<HTMLDivElement>): Point {
    const host = event.currentTarget.getBoundingClientRect()
    return {
      x: clamp(event.clientX - host.left, 0, host.width),
      y: clamp(event.clientY - host.top, 0, host.height),
    }
  }

  function startDraw(event: MouseEvent<HTMLDivElement>) {
    if (dragging) return
    const point = getRelativePoint(event)
    setDrawingStart(point)
    setDrawingRect({ x: point.x, y: point.y, width: 0, height: 0 })
  }

  function onDrawMove(event: MouseEvent<HTMLDivElement>) {
    if (dragging) {
      const point = getRelativePoint(event)
      const deltaX = point.x - dragging.start.x
      const deltaY = point.y - dragging.start.y
      const next: DraftRect = { ...dragging.base }

      if (dragging.mode === 'move') {
        next.x = clamp(dragging.base.x + deltaX, 0, imgSize.width - dragging.base.width)
        next.y = clamp(dragging.base.y + deltaY, 0, imgSize.height - dragging.base.height)
      } else if (dragging.mode === 'resize-se') {
        next.width = clamp(dragging.base.width + deltaX, 12, imgSize.width - dragging.base.x)
        next.height = clamp(dragging.base.height + deltaY, 12, imgSize.height - dragging.base.y)
      } else if (dragging.mode === 'resize-nw') {
        const newX = clamp(dragging.base.x + deltaX, 0, dragging.base.x + dragging.base.width - 12)
        const newY = clamp(dragging.base.y + deltaY, 0, dragging.base.y + dragging.base.height - 12)
        next.x = newX
        next.y = newY
        next.width = dragging.base.width + (dragging.base.x - newX)
        next.height = dragging.base.height + (dragging.base.y - newY)
      } else if (dragging.mode === 'resize-ne') {
        const newY = clamp(dragging.base.y + deltaY, 0, dragging.base.y + dragging.base.height - 12)
        next.y = newY
        next.height = dragging.base.height + (dragging.base.y - newY)
        next.width = clamp(dragging.base.width + deltaX, 12, imgSize.width - dragging.base.x)
      } else if (dragging.mode === 'resize-sw') {
        const newX = clamp(dragging.base.x + deltaX, 0, dragging.base.x + dragging.base.width - 12)
        next.x = newX
        next.width = dragging.base.width + (dragging.base.x - newX)
        next.height = clamp(dragging.base.height + deltaY, 12, imgSize.height - dragging.base.y)
      }

      setMappings((prev) =>
        prev.map((item) =>
          item.id === dragging.id
            ? { ...item, ...toNormalizedRect(next) }
            : item,
        ),
      )
      return
    }

    if (!drawingStart || !drawingRect) return
    const point = getRelativePoint(event)
    setDrawingRect({
      x: Math.min(drawingStart.x, point.x),
      y: Math.min(drawingStart.y, point.y),
      width: Math.abs(point.x - drawingStart.x),
      height: Math.abs(point.y - drawingStart.y),
    })
  }

  function stopDrawOrDrag() {
    if (dragging) {
      setDragging(null)
      return
    }
    if (!drawingRect) return
    if (drawingRect.width < 12 || drawingRect.height < 12) {
      setDrawingRect(null)
      setDrawingStart(null)
      return
    }

    const normalized = toNormalizedRect(drawingRect)
    const id = crypto.randomUUID()
    const newArea: EpaperPageMapping = {
      id,
      page_id: epaper.id,
      article_id: null,
      title: `Region ${mappings.length + 1}`,
      shape: 'rect',
      ...normalized,
      coords_json: null,
      target_type: 'article',
      target_value: null,
      sort_order: mappings.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setMappings((prev) => [...prev, newArea])
    setSelectedId(id)
    setDrawingStart(null)
    setDrawingRect(null)
  }

  function startDrag(event: MouseEvent, id: string, mode: DragMode, rect: DraftRect) {
    event.stopPropagation()
    const host = event.currentTarget.closest('[data-map-host]') as HTMLElement | null
    if (!host) return
    const bounds = host.getBoundingClientRect()
    setDragging({
      id,
      mode,
      start: { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
      base: rect,
    })
    setSelectedId(id)
  }

  function updateField<K extends keyof EpaperPageMapping>(key: K, value: EpaperPageMapping[K]) {
    if (!selected) return
    setMappings((prev) => prev.map((item) => (item.id === selected.id ? { ...item, [key]: value } : item)))
  }

  function removeSelected() {
    if (!selected) return
    setMappings((prev) => prev.filter((item) => item.id !== selected.id))
    setSelectedId(null)
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Area Mapping Editor</h1>
          <p className="text-sm text-gray-500 mt-1">
            {epaper.title || 'Untitled issue'} - {new Date(epaper.published_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/epaper" className="px-3 py-2 rounded-md border text-sm">
            Back
          </Link>
          <button onClick={loadMappings} className="px-3 py-2 rounded-md border text-sm" disabled={loading}>
            {loading ? 'Loading...' : 'Reload'}
          </button>
          <button
            onClick={saveMappings}
            disabled={saving || loading}
            className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save All Mapped Areas'}
          </button>
        </div>
      </div>

      {error && <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">{error}</div>}

      {isPdf ? (
        <div className="border rounded-xl p-6 bg-amber-50 text-amber-800">
          PDF mapping is not enabled in this first version. Please map image-based pages first.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="border rounded-xl bg-white p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Draw, move, resize, and select regions.</span>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 border rounded text-sm" onClick={() => setZoom((z) => clamp(z - 0.1, 0.5, 2))}>-</button>
                <span className="text-xs text-gray-500 w-14 text-center">{Math.round(zoom * 100)}%</span>
                <button className="px-2 py-1 border rounded text-sm" onClick={() => setZoom((z) => clamp(z + 0.1, 0.5, 2))}>+</button>
              </div>
            </div>

            <div className="overflow-auto border rounded-lg bg-gray-100">
              <div
                data-map-host
                className="relative inline-block align-top"
                onMouseDown={startDraw}
                onMouseMove={onDrawMove}
                onMouseUp={stopDrawOrDrag}
                onMouseLeave={stopDrawOrDrag}
              >
                <img
                  ref={imgRef}
                  src={epaper.file_url}
                  alt={epaper.title || 'Epaper page'}
                  className="block max-w-none"
                  style={{ width: `${zoom * 100}%`, height: 'auto' }}
                  onLoad={(event) => {
                    const img = event.currentTarget
                    setImgNatural({ width: img.naturalWidth, height: img.naturalHeight })
                    setImgSize({ width: img.clientWidth, height: img.clientHeight })
                    loadMappings()
                  }}
                />

                {mappings.map((item) => {
                  const px = toPxRect(item)
                  const active = selectedId === item.id
                  return (
                    <div
                      key={item.id}
                      className={`absolute border-2 ${active ? 'border-blue-600' : 'border-blue-400'} bg-blue-500/20`}
                      style={{ left: px.x, top: px.y, width: px.width, height: px.height }}
                      onMouseDown={(event) => startDrag(event, item.id, 'move', px)}
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedId(item.id)
                      }}
                    >
                      {(['resize-nw', 'resize-ne', 'resize-sw', 'resize-se'] as DragMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          className="absolute h-3 w-3 bg-white border border-blue-700 rounded-full"
                          style={{
                            left: mode.includes('w') ? -6 : undefined,
                            right: mode.includes('e') ? -6 : undefined,
                            top: mode.includes('n') ? -6 : undefined,
                            bottom: mode.includes('s') ? -6 : undefined,
                            cursor: 'nwse-resize',
                          }}
                          onMouseDown={(event) => startDrag(event, item.id, mode, px)}
                        />
                      ))}
                    </div>
                  )
                })}

                {drawingRect && (
                  <div
                    className="absolute border-2 border-dashed border-green-600 bg-green-400/20 pointer-events-none"
                    style={{ left: drawingRect.x, top: drawingRect.y, width: drawingRect.width, height: drawingRect.height }}
                  />
                )}
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Saved as normalized values against original image ({imgNatural.width}x{imgNatural.height}), so rendering scales correctly.
            </p>
          </div>

          <div className="border rounded-xl bg-white p-4">
            <h2 className="font-semibold mb-3">Mapped Regions</h2>
            <div className="space-y-2 mb-4 max-h-56 overflow-auto">
              {mappings.length === 0 && <p className="text-sm text-gray-500">No regions yet.</p>}
              {mappings.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-md border text-sm ${selectedId === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  {item.title || `Region ${idx + 1}`}
                </button>
              ))}
            </div>

            {selected && (
              <div className="space-y-2">
                <input
                  value={selected.title || ''}
                  onChange={(event) => updateField('title', event.target.value)}
                  placeholder="Title"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <input
                  value={selected.article_id || ''}
                  onChange={(event) => updateField('article_id', event.target.value || null)}
                  placeholder="Article ID (optional)"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <select
                  value={selected.target_type}
                  onChange={(event) => updateField('target_type', event.target.value as MappingTargetType)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  {targetTypeOptions.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  value={selected.target_value || ''}
                  onChange={(event) => updateField('target_value', event.target.value || null)}
                  placeholder="Target value (URL, article ID, popup text)"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={selected.sort_order}
                  onChange={(event) => updateField('sort_order', Number(event.target.value))}
                  placeholder="Sort order"
                  className="w-full border rounded px-3 py-2 text-sm"
                />

                <button onClick={removeSelected} className="w-full mt-2 px-3 py-2 rounded-md bg-red-600 text-white text-sm">
                  Delete Mapped Area
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
