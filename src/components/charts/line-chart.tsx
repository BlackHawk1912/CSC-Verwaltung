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
        })),
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } },
      },
    })
    return () => chart.destroy()
  }, [labels, datasets])

  return <canvas ref={ref} height={200} />
}
