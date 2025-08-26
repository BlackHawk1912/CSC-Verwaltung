import React from 'react'
import type { Strain } from '../../types/domain'

export type StrainCardProps = {
  strain: Strain
  selected?: boolean
  onSelect?: (id: string) => void
}

const defaultImg =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#f0e7d6"/><stop offset="1" stop-color="#b5c2a1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#2f3b2a" font-size="24" font-family="system-ui, sans-serif">Sorte</text></svg>`
  )

export const StrainCard: React.FC<StrainCardProps> = ({ strain, selected, onSelect }) => {
  const total = Math.max(1, strain.thc + strain.cbd)
  const thcPct = (strain.thc / total) * 100
  const cbdPct = (strain.cbd / total) * 100

  return (
    <button
      type="button"
      className={`glass-card strain-card text-start position-relative overflow-hidden ${selected ? 'selected' : ''}`}
      onClick={() => onSelect?.(strain.id)}
      style={{ background: 'rgba(255,255,255,0.7)' }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${strain.imageDataUrl || defaultImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          filter: 'grayscale(20%)',
        }}
      />
      <div className="position-relative">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="fw-semibold text-dark-emphasis">{strain.name}</div>
            <div className="small text-secondary">Vorrätig: {strain.stockGrams.toFixed(1)} g</div>
          </div>
        </div>

        <div className="mt-2">
          <div className="small text-secondary mb-1">THC / CBD (relativ)</div>
          <div className="ratio-bars" style={{ gridTemplateColumns: `${thcPct}% ${cbdPct}%` }}>
            <div className="ratio-bar thc" />
            <div className="ratio-bar cbd" />
          </div>
          <div className="d-flex justify-content-between small text-secondary mt-1">
            <span>THC {strain.thc}%</span>
            <span>CBD {strain.cbd}%</span>
          </div>
        </div>

        {strain.info.length > 0 && (
          <ul className="small text-secondary mb-0 mt-2 d-flex flex-wrap gap-2 list-unstyled">
            {strain.info.map((i) => (
              <li key={i} className="badge bg-light text-dark border">
                {i}
              </li>
            ))}
          </ul>
        )}
      </div>
    </button>
  )
}
