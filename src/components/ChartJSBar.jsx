import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale)

// data: [{ date: Date, count: number, revenue: number }, ...]
export default function ChartJSBar({ data = [] , height = 160 }) {
  const chartData = useMemo(() => {
    const labels = data.map(d => {
      const date = d.date instanceof Date ? d.date : new Date(d.date)
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    })
    const counts = data.map(d => Number(d.count) || 0)
    return {
      labels,
      datasets: [
        {
          label: 'Bookings',
          data: counts,
          backgroundColor: '#4f46e5',
          borderRadius: 6,
          barThickness: 'flex'
        }
      ]
    }
  }, [data])

  const options = useMemo(() => ({
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} bookings`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280' }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { color: '#6b7280', precision:0 }
      }
    }
  }), [])

  return (
    <div style={{ height }}>
      <Bar options={options} data={chartData} />
    </div>
  )
}
