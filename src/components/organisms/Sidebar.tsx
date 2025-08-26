import React from 'react'

export type SidebarProps = {
  onNeueAusgabe: () => void
  activeKey: string
}

export const Sidebar: React.FC<SidebarProps> = ({ onNeueAusgabe, activeKey }) => {
  const navItem = (key: string, label: string) => (
    <button
      key={key}
      type="button"
      className={`btn btn-link text-start w-100 sidebar-link ${
        activeKey === key ? 'active' : ''
      }`}
      // dummy navigation
      onClick={() => undefined}
    >
      {label}
    </button>
  )

  return (
    <aside className="sidebar d-flex flex-column p-3">
      <div className="brand mb-4">
        <div className="brand-mark me-2" />
        <span className="brand-text fw-semibold">CSC Verwaltung</span>
      </div>

      <nav className="flex-grow-1 d-grid gap-2">
        {navItem('start', 'Start (coming soon)')}
        {navItem('mitglieder', 'Mitglieder (coming soon)')}
        {navItem('statistik', 'Statistik')}
      </nav>

      <div className="mt-3">
        <button type="button" className="btn btn-success w-100" onClick={onNeueAusgabe}>
          Neue Ausgabe
        </button>
      </div>
    </aside>
  )
}
