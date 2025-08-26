import React, { useMemo } from 'react'
import { PieChart } from '../components/charts/pie-chart'
import { LineChart } from '../components/charts/line-chart'
import { BarChart } from '../components/charts/bar-chart'
import type { ColumnDef } from '@tanstack/react-table'
import { SimpleTable } from '../components/table/simple-table'
import type { Disbursement, Gender } from '../types/domain'

const moss = '#355E3B'
const mossLight = '#6f8f77'
const beigeDark = '#bfae94'

const mockToday: readonly Disbursement[] = [
  { id: '1', strainId: 's-1', strainName: 'Mooswald Indica', grams: 2.5, over21: true, gender: 'm', dateIso: '2025-08-26' },
  { id: '2', strainId: 's-2', strainName: 'Beige Sativa', grams: 1.2, over21: false, gender: 'w', dateIso: '2025-08-26' },
  { id: '3', strainId: 's-1', strainName: 'Mooswald Indica', grams: 3.0, over21: true, gender: 'd', dateIso: '2025-08-26' },
]

const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const

export const StatistikPage: React.FC = () => {
  const genderCounts = useMemo(() => {
    const counts: Record<Gender, number> = { m: 0, w: 0, d: 0 }
    mockToday.forEach((d) => (counts[d.gender] += d.grams))
    return counts
  }, [])

  const over21 = useMemo(() => {
    const yes = mockToday.filter((d) => d.over21).reduce((a, b) => a + b.grams, 0)
    const no = mockToday.filter((d) => !d.over21).reduce((a, b) => a + b.grams, 0)
    const total = yes + no || 1
    return { yes, no, yesPct: Math.round((yes / total) * 100), noPct: Math.round((no / total) * 100) }
  }, [])

  const lineData = useMemo(() => {
    const labels = ['KW29', 'KW30', 'KW31', 'KW32', 'KW33']
    const total = [12, 18, 22, 17, 25]
    const u21 = [2, 3, 4, 3, 5]
    const mwdM = [5, 8, 10, 7, 11]
    const mwdW = [6, 7, 9, 7, 10]
    const mwdD = [1, 3, 3, 3, 4]
    return { labels, total, u21, mwdM, mwdW, mwdD }
  }, [])

  const weekdayAverages = useMemo(() => [2.3, 2.8, 3.1, 2.5, 4.0, 5.2, 3.9], [])

  const columns: readonly ColumnDef<Disbursement>[] = [
    { header: 'Sorte', accessorKey: 'strainName' },
    {
      header: 'Menge (g)',
      accessorKey: 'grams',
      cell: ({ getValue }: { getValue: () => unknown }) => Number(getValue() as number).toFixed(2),
    },
    {
      header: 'Ü21',
      accessorKey: 'over21',
      cell: ({ getValue }: { getValue: () => unknown }) => (Boolean(getValue()) ? 'Ja' : 'Nein'),
    },
    { header: 'm/w/d', accessorKey: 'gender' },
  ]

  const exportCsv = () => {
    const rows = [
      ['Sorte', 'Menge (g)', 'Ü21', 'm/w/d'],
      ...mockToday.map((d) => [d.strainName, d.grams.toFixed(2), d.over21 ? 'Ja' : 'Nein', d.gender]),
    ] as const
    const csv = rows
      .map((r) =>
        r
          .map((x) => {
            const s = String(x)
            return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
          })
          .join(',')
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'heutige-ausgaben.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container-fluid py-3 d-grid gap-3">
      <div className="row g-3">
        <div className="col-md-4">
          <div className="glass-panel p-3 h-100">
            <h6 className="mb-3">Zusammensetzung (m/w/d)</h6>
            <PieChart
              labels={['männlich', 'weiblich', 'divers']}
              values={[genderCounts.m, genderCounts.w, genderCounts.d]}
              colors={[moss, mossLight, beigeDark]}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-panel p-3 h-100">
            <h6 className="mb-3">Ü21 vs. U21</h6>
            <div className="progress" role="progressbar" aria-label="Ü21">
              <div className="progress-bar" style={{ width: `${over21.yesPct}%`, backgroundColor: moss }}>
                Ü21 {over21.yesPct}%
              </div>
            </div>
            <div className="progress mt-2" role="progressbar" aria-label="U21">
              <div className="progress-bar" style={{ width: `${over21.noPct}%`, backgroundColor: beigeDark, color: '#1a1a1a' }}>
                U21 {over21.noPct}%
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-panel p-3 h-100 d-flex flex-column">
            <h6 className="mb-3">Export / Druck</h6>
            <div className="d-flex gap-2 mt-auto">
              <button className="btn btn-outline-secondary" onClick={() => window.print()}>Drucken</button>
              <button className="btn btn-success" onClick={exportCsv}>Export CSV</button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-3">
        <h6 className="mb-3">Gesamtmenge (Zeitraum)</h6>
        <LineChart
          labels={lineData.labels}
          datasets={[
            { label: 'Gesamt', data: lineData.total, color: moss },
            { label: 'U21', data: lineData.u21, color: beigeDark },
            { label: 'm', data: lineData.mwdM, color: '#4a7a54' },
            { label: 'w', data: lineData.mwdW, color: '#7aa47a' },
            { label: 'd', data: lineData.mwdD, color: '#a9c1a1' },
          ]}
        />
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="glass-panel p-3">
            <h6 className="mb-3">Durchschnitt je Wochentag</h6>
            <BarChart labels={weekdays as unknown as string[]} values={weekdayAverages} color={moss} />
          </div>
        </div>

        <div className="col-md-6">
          <div className="glass-panel p-3">
            <h6 className="mb-3">Heutige Ausgaben</h6>
            <SimpleTable
              data={mockToday}
              columns={columns}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatistikPage
