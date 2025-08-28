import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import type { Plugin, Chart as ChartJS, ArcElement } from 'chart.js'

export type PieChartProps = {
  labels: readonly string[]
  values: readonly number[]
  colors: readonly string[]
}

export const PieChart: React.FC<PieChartProps> = ({ labels, values, colors }) => {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const valueLabels: Plugin<'pie'> = {
      id: 'valueLabels',
      afterDatasetsDraw(chart: ChartJS) {
        const { ctx, data } = chart
        const meta = chart.getDatasetMeta(0)
        const raw = ((data.datasets[0]?.data as number[]) ?? [])
        const total = raw.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0)
        if (!total) return
        ctx.save()
        ctx.fillStyle = '#1a1a1a'
        ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        meta.data.forEach((arc: ArcElement | unknown, i: number) => {
          const val = Number(raw[i] || 0)
          if (!val || !Number.isFinite(val)) return
          const { x, y } = (arc as ArcElement).tooltipPosition(true)
          const text = `${Math.round((val / total) * 100)}%`

          // Measure text and draw rounded background
          const metrics = ctx.measureText(text)
          const textW = metrics.width
          const textH = (metrics.actualBoundingBoxAscent ?? 8) + (metrics.actualBoundingBoxDescent ?? 3)
          const padX = 6
          const padY = 4
          const boxW = Math.ceil(textW + padX * 2)
          const boxH = Math.ceil(textH + padY * 2)
          const left = x - boxW / 2
          const top = y - boxH / 2
          let r = 6
          r = Math.min(r, boxW / 2, boxH / 2)

          // Background
          ctx.beginPath()
          ctx.moveTo(left + r, top)
          ctx.lineTo(left + boxW - r, top)
          ctx.quadraticCurveTo(left + boxW, top, left + boxW, top + r)
          ctx.lineTo(left + boxW, top + boxH - r)
          ctx.quadraticCurveTo(left + boxW, top + boxH, left + boxW - r, top + boxH)
          ctx.lineTo(left + r, top + boxH)
          ctx.quadraticCurveTo(left, top + boxH, left, top + boxH - r)
          ctx.lineTo(left, top + r)
          ctx.quadraticCurveTo(left, top, left + r, top)
          ctx.closePath()
          ctx.fillStyle = '#ffffff'
          ctx.strokeStyle = '#d0d0d0'
          ctx.lineWidth = 1
          ctx.fill()
          ctx.stroke()

          // Text
          ctx.fillStyle = '#1a1a1a'
          ctx.fillText(text, x, y)
        })
        ctx.restore()
      },
    }

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
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
      plugins: [valueLabels],
    })
    return () => chart.destroy()
  }, [labels, values, colors])

  return <canvas ref={ref} style={{ height: '100%', width: '100%' }} />
}

