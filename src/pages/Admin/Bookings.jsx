import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import ResponsiveDataTable from '../../components/ResponsiveDataTable'

export default function Bookings() {
  const [items, setItems] = useState([])
  const [filterText, setFilterText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [details, setDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [errorDetails, setErrorDetails] = useState(null)
  const [editBooking, setEditBooking] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [statuses, setStatuses] = useState([])
  const [loadingStatuses, setLoadingStatuses] = useState(false)
  const [updatingBooking, setUpdatingBooking] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  async function loadDetails(id) {
    if (!id) return
    setLoadingDetails(true)
    setErrorDetails(null)
    try {
      const data = await api.request(`https://api.sweethotel.kodopo.tech/api/bookings/${id}`)
      setDetails(data)
      setShowDetails(true)
    } catch (err) {
      setErrorDetails(err?.message || 'Failed to load booking')
    } finally {
      setLoadingDetails(false)
    }
  }

  async function loadItems() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.request('https://api.sweethotel.kodopo.tech/api/bookings')
      setItems(Array.isArray(data) ? data : data?.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  async function loadStatuses() {
    setLoadingStatuses(true)
    try {
      // try to fetch enum list from backend; fallback to built-in list if it fails
      const data = await api.request('https://api.sweethotel.kodopo.tech/api/Enums/booking-statuses')
      if (Array.isArray(data) && data.length) {
        setStatuses(data)
        return data
      }
    } catch (err) {
      // ignore - we'll fallback below
    } finally {
      setLoadingStatuses(false)
    }

    // fallback values (provided by the user) - names used as status strings
    const fallback = [
      { value: 0, name: 'Pending', description: 'Chưa xác nhận' },
      { value: 1, name: 'Confirmed', description: 'Đã xác nhận' },
      { value: 2, name: 'Cancelled', description: 'Đã hủy' },
      { value: 3, name: 'CheckedIn', description: 'Đang sử dụng (đã check-in)' },
      { value: 4, name: 'Completed', description: 'Đã hoàn thành (đã check-out)' },
      { value: 5, name: 'NoShow', description: 'Không đến (No-show)' }
    ]
    setStatuses(fallback)
    return fallback
  }

  async function submitUpdate() {
    if (!editBooking) return
    setUpdatingBooking(true)
    setUpdateError(null)
    try {
      const id = editBooking.id ?? editBooking.Id
      const payload = {
        startDate: editBooking.startDate ?? editBooking.startDate,
        endDate: editBooking.endDate ?? editBooking.endDate,
        status: editBooking.status ?? editBooking.status,
        note: editBooking.note ?? '',
        totalPrice: editBooking.totalPrice ?? 0
      }
      await api.request(`https://api.sweethotel.kodopo.tech/api/Bookings/Update/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
      // refresh list
      await loadItems()
      setShowEdit(false)
      setEditBooking(null)
    } catch (err) {
      setUpdateError(err?.message || 'Failed to update booking')
    } finally {
      setUpdatingBooking(false)
    }
  }

  const columns = useMemo(() => [
    { name: 'ID', selector: r => r.id ?? '-', width: '220px' },
    { name: 'Dates', selector: r => `${new Date(r.startDate).toLocaleDateString()} → ${new Date(r.endDate).toLocaleDateString()}`, wrap: true, grow: 2 },
    { name: 'Status', selector: r => r.status || '-', width: '140px' },
    { name: 'Room', selector: r => r.room?.categoryName || r.roomId || '-', sortable: true },
    { name: 'User', selector: r => r.user?.fullName || r.user?.email || '-', wrap: true },
    { name: 'Total', selector: r => r.totalPrice ?? 0, cell: r => (r.totalPrice != null ? r.totalPrice.toLocaleString() + ' ₫' : '-'), width: '140px' },
    { name: 'Actions', ignoreRowClick: true, allowOverflow: true, button: true, width: '200px', cell: row => (
      <div className="flex items-center gap-2">
        <button onClick={() => loadDetails(row.id)} className="px-2 py-1 text-xs bg-yellow-100 rounded hover:bg-yellow-200">Details</button>
        <button onClick={() => { const booking = row; setEditBooking(booking); setShowEdit(true); if (!statuses || statuses.length === 0) loadStatuses().catch(()=>{}); }} className="px-2 py-1 text-xs bg-blue-100 rounded hover:bg-blue-200">Edit</button>
      </div>
    ) }
  ], [])

  const filtered = items.filter(row => {
    if (!filterText) return true
    return JSON.stringify(row).toLowerCase().includes(filterText.toLowerCase())
  })

  const subHeaderComponent = (
    <div className="flex items-center gap-2 w-full">
      <input type="text" placeholder="Search bookings..." value={filterText} onChange={e=>setFilterText(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full sm:w-64" />
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Bookings</h2>
            <p className="text-sm text-gray-500">Manage bookings</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow p-4">
          {subHeaderComponent}
          <ResponsiveDataTable columns={columns} data={filtered} loading={loading} customStyles={{ headCells:{style:{fontSize:'12px',fontWeight:600}}, cells:{style:{fontSize:'13px'}} }} noHeader />
          {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
          {errorDetails && <div className="mt-3 text-sm text-rose-600">{errorDetails}</div>}
        </div>

        {showDetails && details && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowDetails(false)} />
            <div className="relative w-full max-w-2xl bg-white rounded shadow-lg p-6 z-10">
              <h3 className="text-lg font-medium">Booking details</h3>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div><strong>ID:</strong> <span className="font-mono text-xs">{details.id}</span></div>
                <div>
                  <strong>Start:</strong> {details.startDate ? new Date(details.startDate).toLocaleString() : '-'}
                  <div className="text-xs text-gray-500">{details.startDate || ''}</div>
                </div>
                <div>
                  <strong>End:</strong> {details.endDate ? new Date(details.endDate).toLocaleString() : '-'}
                  <div className="text-xs text-gray-500">{details.endDate || ''}</div>
                </div>
                <div><strong>Status:</strong> {details.status || '-'}</div>
                <div><strong>Note:</strong> {details.note || '-'}</div>
                <div><strong>Total:</strong> {(details.totalPrice != null ? details.totalPrice.toLocaleString() : '0')} ₫</div>
                <div><strong>Room ID:</strong> <span className="font-mono text-xs">{details.roomId || '-'}</span></div>
                <div className="pt-2">
                  <h4 className="font-medium">Room</h4>
                  <div><strong>Room ID:</strong> {details.room?.id || '-'}</div>
                  <div><strong>Category:</strong> {details.room?.categoryName || '-'}</div>
                  <div><strong>Price:</strong> {(details.room?.price != null ? details.room.price.toLocaleString() : '0')} ₫</div>
                  <div><strong>Discount:</strong> {details.room?.discount ?? 0}%</div>
                </div>
                <div className="pt-2">
                  <h4 className="font-medium">User</h4>
                  <div><strong>User ID:</strong> <span className="font-mono text-xs">{details.userId || details.user?.id || '-'}</span></div>
                  <div className="font-medium">{details.user?.fullName || '-'}</div>
                  <div className="text-sm text-gray-500">{details.user?.email || ''} • {details.user?.phoneNumber || ''}</div>
                </div>
              </div>
              <div className="mt-6 flex justify-end"><button onClick={() => setShowDetails(false)} className="px-3 py-2 bg-gray-100 rounded">Close</button></div>
            </div>
          </div>
        )}
        {showEdit && editBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setShowEdit(false); setEditBooking(null); }} />
            <div className="relative w-full max-w-md bg-white rounded shadow-lg p-6 z-10">
              <h3 className="text-lg font-medium">Edit booking status</h3>
              <div className="mt-4 space-y-3">
                <div><strong>ID:</strong> <span className="font-mono text-xs">{editBooking.id ?? editBooking.Id}</span></div>
                <div>
                  <label className="block text-sm text-gray-700">Status</label>
                  <select value={editBooking.status ?? editBooking.status} onChange={e => setEditBooking(b => ({ ...(b||{}), status: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2 text-sm">
                    <option value="">-- select status --</option>
                    {loadingStatuses && <option disabled>Loading...</option>}
                    {statuses.map((s, i) => (
                      <option key={i} value={s.name ?? s}>{s.name ?? s.toString()}{s.description ? ` — ${s.description}` : ''}</option>
                    ))}
                  </select>
                </div>
                {updateError && <div className="text-sm text-rose-600">{updateError}</div>}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => { setShowEdit(false); setEditBooking(null); }} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
                <button onClick={submitUpdate} disabled={updatingBooking} className="px-3 py-2 bg-indigo-600 text-white rounded">{updatingBooking ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
