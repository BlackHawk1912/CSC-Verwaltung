import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export type BarChartProps = {
  labels: readonly string[]
  values: readonly number[]
  color: string
}

export const BarChart: React.FC<BarChartProps> = ({ labels, values, color }) => {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: [...labels],
        datasets: [
          {
            label: 'Menge (g)',
            data: [...values],
            backgroundColor: color,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    })
    return () => chart.destroy()
  }, [labels, values, color])

  return <canvas ref={ref} height={160} />
}
