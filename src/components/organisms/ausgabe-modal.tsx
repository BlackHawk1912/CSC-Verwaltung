import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Strain } from '../../types/domain'
import { StrainCard } from '../molecules/strain-card'
import img1 from '../../imgs/1.webp'
import img2 from '../../imgs/2.webp'
import img3 from '../../imgs/3.webp'
import img4 from '../../imgs/4.webp'
import img5 from '../../imgs/5.webp'
import img6 from '../../imgs/6.webp'

export type AusgabeModalProps = {
  open: boolean
  onClose: () => void
}

const mockStrains: readonly Strain[] = [
  { id: 's-1', name: 'Mooswald Indica', stockGrams: 125.5, thc: 18, cbd: 2, info: ['Indica', 'Indoor'], imageDataUrl: img1 },
  { id: 's-2', name: 'Beige Sativa', stockGrams: 78.2, thc: 20, cbd: 1, info: ['Sativa', '12 Wochen'], imageDataUrl: img2 },
  { id: 's-3', name: 'Hybrid Classic', stockGrams: 210.0, thc: 14, cbd: 5, info: ['Hybrid', 'Outdoor'], imageDataUrl: img3 },
  { id: 's-4', name: 'Alpen Haze', stockGrams: 95.3, thc: 17, cbd: 3, info: ['Sativa', 'Greenhouse'], imageDataUrl: img4 },
  { id: 's-5', name: 'Stadtpark Kush', stockGrams: 142.1, thc: 22, cbd: 0.5, info: ['Indica', 'Indoor'], imageDataUrl: img5 },
  { id: 's-6', name: 'Waldsee OG', stockGrams: 60.0, thc: 8, cbd: 10, info: ['CBD-reich', 'Hybrid'], imageDataUrl: img6 },
]

export const AusgabeModal: React.FC<AusgabeModalProps> = ({ open, onClose }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [grams, setGrams] = useState<string>('')
  const [member, setMember] = useState<string>('')
  const listRef = useRef<HTMLDivElement | null>(null)
  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const selected = useMemo(() => mockStrains.find((s) => s.id === selectedId) || null, [selectedId])

  // prevent background scroll while modal is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // initialize fade overlay visibility on mount/open
  useEffect(() => {
    if (!open) return
    // next tick to ensure listRef is rendered
    queueMicrotask(onScroll)
  }, [open])

  const onScroll = () => {
    const el = listRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setAtTop(scrollTop <= 1)
    setAtBottom(scrollTop + clientHeight >= scrollHeight - 1)
  }

  const bump = (delta: number) => {
    const cur = parseLocale(grams)
    const next = Math.max(0, Math.round((cur + delta) * 100) / 100)
    setGrams(formatLocale(next))
  }

  const parseLocale = (s: string) => {
    if (!s) return 0
    const cleaned = s.replace(/\s/g, '').replace(',', '.')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : 0
  }

  const formatLocale = (n: number) => n ? n.toFixed(2).replace('.', ',') : ''

  const save = () => {
    if (!selected) return
    const g = parseLocale(grams)
    const m = Number(member)
    if (!Number.isFinite(g) || g <= 0) return
    if (!Number.isInteger(m) || m <= 0) return
    // would call API here
    // await api.postDisbursement({ strainId: selected.id, grams: g, memberNumber: m })
    // for now, just close
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog modal-lg modal-content glass-panel p-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Neue Ausgabe</h5>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
        </div>

        <div className="row g-4">
          <div className="col-md-7">
            <div className="small text-secondary mb-2">Sorte auswählen</div>
            <div className={`position-relative fade-container ${atTop ? 'at-top' : ''} ${atBottom ? 'at-bottom' : ''}`}>
              <div
                ref={listRef}
                onScroll={onScroll}
                className="strain-grid custom-scroll"
                style={{ maxHeight: '72vh', overflow: 'auto', padding: '16px' }}
              >
                {mockStrains.map((s) => (
                  <StrainCard key={s.id} strain={s} selected={s.id === selectedId} onSelect={setSelectedId} />
                ))}
              </div>
              <div className="fade-overlay-top" />
              <div className="fade-overlay-bottom" />
            </div>
          </div>

          <div className="col-md-5" style={{ position: 'relative', paddingBottom: 64 }}>
            <div className="mb-3">
              <label className="form-label">Menge</label>
              <div className="input-group align-items-stretch">
                <div className="with-suffix flex-grow-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    ref={inputRef}
                    className="form-control form-control-sm text-end"
                    value={grams}
                    onChange={(e) => setGrams(e.target.value.replace(/[^0-9.,]/g, '').replace(/\./g, ','))}
                    placeholder="0"
                  />
                  <span className="suffix-inside">g</span>
                </div>
                <button className="btn btn-outline-secondary btn-sm btn-stepper" type="button" onClick={() => bump(-0.1)} aria-label="minus 0.1">−</button>
                <button className="btn btn-outline-secondary btn-sm btn-stepper" type="button" onClick={() => bump(0.1)} aria-label="plus 0.1">+</button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Mitgliedsnummer</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={member}
                onChange={(e) => setMember(e.target.value)}
                placeholder="z.B. 12345"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Auswahl</label>
              {selected ? (
                <StrainCard strain={selected} selected onSelect={undefined} />
              ) : (
                <div className="small text-secondary">Keine Sorte gewählt</div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3"
                 style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', paddingTop: 12, paddingBottom: 12, borderTop: '1px solid #e5e7eb' }}>
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Abbrechen</button>
              <button type="button" className="btn btn-success" onClick={save} disabled={!selected || !grams || !member}>Speichern</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
