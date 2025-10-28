import React from 'react'

// Simple, dependency-free SVG bar chart
// props:
// - data: [{ date: Date|string, count: number, revenue: number }, ...]
// - height: number (optional)
// - color: string (bar color)
export default function SimpleBarChart({ data = [], height = 120, color = '#4f46e5' }) {
  if (!Array.isArray(data) || data.length === 0) return (
    <div className="w-full h-32 flex items-center justify-center text-sm text-gray-500">No data</div>
  )

  const counts = data.map(d => Number(d.count) || 0)
  const max = Math.max(...counts, 1)
  const padding = 8
  const barGap = 6
  const barCount = data.length

  const vbWidth = 100
  const vbHeight = height
  const totalGap = (barCount - 1) * barGap
  const barWidth = (vbWidth - padding * 2 - totalGap) / barCount

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${vbWidth} ${vbHeight}`} preserveAspectRatio="none" style={{ width: '100%', height: height }}>
        {/* background grid lines */}
        {[0.25, 0.5, 0.75].map((t, i) => (
          <line key={i} x1="0" x2={vbWidth} y1={vbHeight * t} y2={vbHeight * t} stroke="#f3f4f6" strokeWidth="0.6" />
        ))}

        {data.map((d, i) => {
          const x = padding + i * (barWidth + barGap)
          const h = max === 0 ? 0 : (Number(d.count) || 0) / max * (vbHeight - 22)
          const y = vbHeight - h - 12
          const dateObj = d.date instanceof Date ? d.date : new Date(d.date)
          const day = dateObj.getDate()
          const revenueText = d.revenue ? ` • ${Number(d.revenue).toLocaleString()} ₫` : ''
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={h} rx="3" fill={color} />
              <title>{`${dateObj.toLocaleDateString()}: ${d.count} bookings${revenueText}`}</title>
              <text x={x + barWidth / 2} y={vbHeight - 8} fontSize="7" fontWeight="600" textAnchor="middle" fill="#111827">{day}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
