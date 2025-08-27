import React from 'react'

export type SidebarProps = {
  onNeueAusgabe: () => void
  activeKey: string
}

export const Sidebar: React.FC<SidebarProps> = ({ onNeueAusgabe, activeKey }) => {
  const nav = [
    { key: 'start', label: 'Start', icon: 'home', onClick: undefined },
    { key: 'statistik', label: 'Statistik', icon: 'query_stats', onClick: undefined },
    { key: 'mitglieder', label: 'Mitglieder', icon: 'group', onClick: undefined },
  ] as const

  return (
    <aside className="sidebar d-flex flex-column p-3 custom-scroll">
      <div className="mb-2">
        <button type="button" className="btn btn-success w-100" onClick={onNeueAusgabe}>
          Neue Ausgabe
        </button>
      </div>

      <nav className="d-grid gap-1">
        {nav.map((n) => (
          <button
            key={n.key}
            type="button"
            className={`btn btn-link text-start w-100 d-flex align-items-center gap-2 sidebar-link ${
              activeKey === n.key ? 'active' : ''
            }`}
            onClick={n.onClick}
          >
            <span className="material-icons" aria-hidden> {n.icon} </span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

