import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export type PieChartProps = {
  labels: readonly string[]
  values: readonly number[]
  colors: readonly string[]
}

export const PieChart: React.FC<PieChartProps> = ({ labels, values, colors }) => {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = new Chart(ref.current, {
      type: 'pie',
      data: {
        labels: [...labels],
        datasets: [
          {
            data: [...values],
            backgroundColor: [...colors],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    })
    return () => chart.destroy()
  }, [labels, values, colors])

  return <canvas ref={ref} height={160} />
}
