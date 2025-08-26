import React, { useMemo, useState } from 'react'
import type { Strain } from '../../types/domain'
import { StrainCard } from '../molecules/strain-card'

export type AusgabeModalProps = {
  open: boolean
  onClose: () => void
}

const mockStrains: readonly Strain[] = [
  {
    id: 's-1',
    name: 'Mooswald Indica',
    stockGrams: 125.5,
    thc: 18,
    cbd: 1,
    info: ['Indica', 'Blütezeit 8-9 Wochen', 'Indoor'],
  },
  {
    id: 's-2',
    name: 'Beige Sativa',
    stockGrams: 78.2,
    thc: 21,
    cbd: 0.5,
    info: ['Sativa', 'Wuchsdauer 12 Wochen'],
  },
  {
    id: 's-3',
    name: 'Hybrid Classic',
    stockGrams: 210.0,
    thc: 16,
    cbd: 2,
    info: ['Hybrid', 'Outdoor'],
  },
]

export const AusgabeModal: React.FC<AusgabeModalProps> = ({ open, onClose }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [grams, setGrams] = useState<string>('')
  const [member, setMember] = useState<string>('')

  const selected = useMemo(() => mockStrains.find((s) => s.id === selectedId) || null, [selectedId])

  const save = () => {
    if (!selected) return
    const g = Number(grams)
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
      <div className="modal-dialog modal-lg modal-content glass-panel p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Neue Ausgabe</h5>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
        </div>

        <div className="row g-3">
          <div className="col-12">
            <div className="small text-secondary mb-2">Sorte auswählen</div>
            <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {mockStrains.map((s) => (
                <StrainCard key={s.id} strain={s} selected={s.id === selectedId} onSelect={setSelectedId} />
              ))}
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Menge (g)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="z.B. 2.50"
            />
          </div>
          <div className="col-md-6">
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
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button type="button" className="btn btn-success" onClick={save} disabled={!selected || !grams || !member}>
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
