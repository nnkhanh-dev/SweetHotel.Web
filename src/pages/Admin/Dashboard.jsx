import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import SimpleBarChart from '../../components/SimpleBarChart'

function formatCurrency(n) {
  if (n == null) return '-'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    let mounted = true
    async function loadAll() {
      setLoading(true)
      setError(null)
      try {
        const [b, r, u] = await Promise.all([
          api.request('https://api.sweethotel.kodopo.tech/api/bookings'),
          api.request('https://api.sweethotel.kodopo.tech/api/rooms'),
          api.request('https://api.sweethotel.kodopo.tech/api/user')
        ])
        if (!mounted) return
        setBookings(Array.isArray(b) ? b : b?.items || [])
        setRooms(Array.isArray(r) ? r : r?.items || [])
        setUsers(Array.isArray(u) ? u : u?.items || [])
      } catch (err) {
        if (!mounted) return
        setError(err?.message || 'Failed to load dashboard data')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    loadAll()
    return () => { mounted = false }
  }, [])

  const totalBookings = bookings.length
  const roomsAvailable = rooms.filter(r => (r.status || '').toLowerCase() === 'available').length

  const now = new Date()
  const start7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const revenue7d = bookings.reduce((sum, b) => {
    const sd = b.startDate ? new Date(b.startDate) : null
    if (sd && sd >= start7) {
      return sum + (Number(b.totalPrice) || 0)
    }
    return sum
  }, 0)

  const activeGuests = bookings.filter(b => {
    const status = (b.status || '').toLowerCase()
    if (status === 'checkedin' || status === 'checked-in') return true
    const sd = b.startDate ? new Date(b.startDate) : null
    const ed = b.endDate ? new Date(b.endDate) : null
    if (sd && ed) return sd <= now && ed >= now
    return false
  }).length

  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
  }
  const checkinsToday = bookings.filter(b => b.startDate && isSameDay(new Date(b.startDate), now)).length
  const checkoutsToday = bookings.filter(b => b.endDate && isSameDay(new Date(b.endDate), now)).length

  const overview = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      days.push({ date: d, count: 0, revenue: 0 })
    }
    for (const b of bookings) {
      const sd = b.startDate ? new Date(b.startDate) : null
      if (!sd) continue
      for (const day of days) {
        if (isSameDay(sd, day.date)) {
          day.count += 1
          day.revenue += Number(b.totalPrice) || 0
          break
        }
      }
    }
    return days
  }, [bookings])

  const recent = bookings.slice().sort((a, b) => {
    const da = a.startDate ? new Date(a.startDate) : new Date(0)
    const db = b.startDate ? new Date(b.startDate) : new Date(0)
    return db - da
  }).slice(0, 6)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Bookings</div>
                <div className="text-2xl font-bold text-gray-900">{loading ? '...' : totalBookings}</div>
              </div>
              <div className={`text-sm font-medium ${totalBookings >= 0 ? 'text-green-600' : 'text-rose-600'}`}>+0%</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Active Guests</div>
                <div className="text-2xl font-bold text-gray-900">{loading ? '...' : activeGuests}</div>
              </div>
              <div className={`text-sm font-medium ${activeGuests >= 0 ? 'text-green-600' : 'text-rose-600'}`}>-</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Rooms Available</div>
                <div className="text-2xl font-bold text-gray-900">{loading ? '...' : roomsAvailable}</div>
              </div>
              <div className={`text-sm font-medium ${roomsAvailable >= 0 ? 'text-green-600' : 'text-rose-600'}`}>-</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Revenue (7d)</div>
                <div className="text-2xl font-bold text-gray-900">{loading ? '...' : formatCurrency(revenue7d)}</div>
              </div>
              <div className={`text-sm font-medium ${revenue7d >= 0 ? 'text-green-600' : 'text-rose-600'}`}>+0%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">Bookings Overview</h3>
              <SimpleBarChart data={overview.map(d => ({ date: d.date, count: d.count, revenue: d.revenue }))} height={140} />
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">Recent Bookings</h3>
              <ul className="divide-y">
                {recent.map((r) => (
                  <li key={r.id || r.Id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.user?.fullName || r.user?.email || r.guestName || r.name || 'Guest'}</div>
                      <div className="text-xs text-gray-500">{r.room?.categoryName || r.roomId || 'Room'} · {r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'}</div>
                    </div>
                    <div className="text-sm text-gray-500">{r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'}</div>
                  </li>
                ))}
                {recent.length === 0 && <li className="py-3 text-sm text-gray-500">No recent bookings</li>}
              </ul>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h4 className="text-sm font-semibold mb-2">Today's Summary</h4>
              <div className="text-sm text-gray-700">Check-ins: <span className="font-medium">{loading ? '...' : checkinsToday}</span></div>
              <div className="text-sm text-gray-700">Check-outs: <span className="font-medium">{loading ? '...' : checkoutsToday}</span></div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h4 className="text-sm font-semibold mb-2">Notifications</h4>
              <ul className="text-sm text-gray-600">
                <li>- {error ? error : 'No notifications'}</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  )
}
