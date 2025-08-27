import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export type LineDataset = {
  label: string
  data: readonly number[]
  color: string
}

export type LineChartProps = {
  labels: readonly string[]
  datasets: readonly LineDataset[]
}

export const LineChart: React.FC<LineChartProps> = ({ labels, datasets }) => {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: [...labels],
        datasets: datasets.map((d) => ({
          label: d.label,
          data: [...d.data],
          borderColor: d.color,
          backgroundColor: d.color + '33',
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 7,
          pointHitRadius: 20,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        interaction: { mode: 'nearest', intersect: false },
        scales: { y: { beginAtZero: true } },
      },
    })
    return () => chart.destroy()
  }, [labels, datasets])

  return <canvas ref={ref} style={{ height: '100%', width: '100%' }} />
}
