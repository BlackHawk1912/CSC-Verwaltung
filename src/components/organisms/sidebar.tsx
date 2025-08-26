import React from 'react'

export type SidebarProps = {
  onNeueAusgabe: () => void
  activeKey: string
}

export const Sidebar: React.FC<SidebarProps> = ({ onNeueAusgabe, activeKey }) => {
  const nav = [
    { key: 'start', label: 'Start (coming soon)' },
    { key: 'mitglieder', label: 'Mitglieder (coming soon)' },
    { key: 'statistik', label: 'Statistik' },
  ] as const

  return (
    <aside className="sidebar d-flex flex-column p-3 glass-panel">
      <div className="brand mb-4 d-flex align-items-center">
        <div className="brand-mark me-2" />
        <span className="brand-text fw-semibold">CSC Verwaltung</span>
      </div>

      <nav className="flex-grow-1 d-grid gap-2">
        {nav.map((n) => (
          <button
            key={n.key}
            type="button"
            className={`btn btn-link text-start w-100 sidebar-link ${
              activeKey === n.key ? 'active' : ''
            }`}
            onClick={() => undefined}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <div className="mt-3">
        <button type="button" className="btn btn-success w-100" onClick={onNeueAusgabe}>
          Neue Ausgabe
        </button>
      </div>
    </aside>
  )
}
