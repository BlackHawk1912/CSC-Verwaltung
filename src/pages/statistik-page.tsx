import React, { useMemo, useState } from 'react'
import { PieChart } from '../components/charts/pie-chart'
import { LineChart } from '../components/charts/line-chart'
import { BarChart } from '../components/charts/bar-chart'
import type { ColumnDef } from '@tanstack/react-table'
import { SimpleTable } from '../components/table/simple-table'
import type { Disbursement, Gender } from '../types/domain'

const moss = '#355E3B'
const mossLight = '#6f8f77'
const beigeDark = '#bfae94'

const mockToday: readonly Disbursement[] = (() => {
  const strains = ['Mooswald Indica', 'Beige Sativa', 'Hybrid Classic', 'Alpen Haze', 'Stadtpark Kush'] as const
  const genders: Gender[] = ['m', 'w', 'd']
  const rows: Disbursement[] = []
  for (let i = 1; i <= 18; i++) {
    const s = strains[i % strains.length]
    const g = genders[i % genders.length]
    const grams = Number(((i * 0.37) % 3 + 0.3).toFixed(2))
    rows.push({
      id: String(i),
      strainId: `s-${(i % strains.length) + 1}`,
      strainName: s,
      grams,
      over21: i % 5 !== 0,
      gender: g,
      dateIso: '2025-08-26',
    })
  }
  return rows
})()

const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const

export const StatistikPage: React.FC = () => {
  const [range, setRange] = useState<'24h' | '7d' | '4w'>('24h')
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
    if (range === '24h') {
      const labels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`)
      const total = labels.map((_, i) => Math.round(2 + 3 * Math.sin(i / 3) + (i % 5)))
      const u21 = labels.map((_, i) => Math.max(0, Math.round(total[i] * 0.2 + (i % 2))))
      const mwdM = labels.map((_, i) => Math.max(0, Math.round(total[i] * 0.45 + (i % 3))))
      const mwdW = labels.map((_, i) => Math.max(0, Math.round(total[i] * 0.45 - (i % 2))))
      const mwdD = labels.map((_, i) => Math.max(0, Math.round(total[i] * 0.1)))
      return { labels, total, u21, mwdM, mwdW, mwdD }
    }
    if (range === '7d') {
      const labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
      const total = [12, 14, 16, 13, 22, 28, 18]
      const u21 = [2, 3, 3, 2, 4, 6, 3]
      const mwdM = [6, 7, 8, 6, 11, 14, 9]
      const mwdW = [5, 6, 7, 6, 10, 12, 8]
      const mwdD = [1, 1, 1, 1, 1, 2, 1]
      return { labels, total, u21, mwdM, mwdW, mwdD }
    }
    const labels = ['KW29', 'KW30', 'KW31', 'KW32']
    const total = [60, 72, 68, 80]
    const u21 = [12, 13, 11, 15]
    const mwdM = [28, 34, 30, 37]
    const mwdW = [26, 31, 29, 35]
    const mwdD = [6, 7, 7, 8]
    return { labels, total, u21, mwdM, mwdW, mwdD }
  }, [range])

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
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Statistik</h5>
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm w-auto"
            value={range}
            onChange={(e) => setRange(e.target.value as '24h' | '7d' | '4w')}
          >
            <option value="24h">Letzte 24h</option>
            <option value="7d">7 Tage</option>
            <option value="4w">4 Wochen</option>
          </select>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>Drucken</button>
          <button className="btn btn-success btn-sm" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

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
            <h6 className="mb-3">Ü21 / U21 (100%)</h6>
            <div className="progress" role="progressbar" aria-label="Ü21/U21">
              <div className="progress-bar" style={{ width: `${over21.yesPct}%`, backgroundColor: moss }}>Ü21 {over21.yesPct}%</div>
              <div className="progress-bar" style={{ width: `${over21.noPct}%`, backgroundColor: beigeDark, color: '#1a1a1a' }}>U21 {over21.noPct}%</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-panel p-3 h-100 d-flex flex-column">
            <h6 className="mb-3">Hinweise</h6>
            <p className="small mb-0 text-secondary">Zeitraum kann oben angepasst werden. Export gilt für gesamte Seite.</p>
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
        <div className="col-lg-4">
          <div className="glass-panel p-3">
            <h6 className="mb-3">Durchschnitt je Wochentag</h6>
            <BarChart labels={weekdays as unknown as string[]} values={weekdayAverages} color={moss} />
          </div>
        </div>

        <div className="col-lg-8">
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
