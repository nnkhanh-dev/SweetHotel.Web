import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import ResponsiveDataTable from '../../components/ResponsiveDataTable'

export default function Users() {
  const [items, setItems] = useState([])
  const [filterText, setFilterText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [details, setDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showBookings, setShowBookings] = useState(false)
  const [userBookings, setUserBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [bookingsError, setBookingsError] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  async function loadItems() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.request('https://api.sweethotel.kodopo.tech/api/User')
      setItems(Array.isArray(data) ? data : data?.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function loadDetails(id) {
    if (!id) return
    setLoadingDetails(true)
    setError(null)
    try {
      const data = await api.request(`https://api.sweethotel.kodopo.tech/api/User/${id}`)
      setDetails(data)
      setShowDetails(true)
    } catch (err) {
      setError(err?.message || 'Failed to load user')
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  const columns = useMemo(() => [
    { name: 'ID', selector: r => r.id ?? r.Id ?? '-', width: '120px' },
    { name: 'Name', selector: r => r.fullName ?? r.FullName ?? r.name ?? r.Name ?? '-', sortable: true },
    { name: 'Email', selector: r => r.email ?? r.Email ?? '-', grow: 2 },
    { name: 'Phone', selector: r => r.phoneNumber ?? r.PhoneNumber ?? '-', width: '150px' },
    { name: 'Actions', ignoreRowClick: true, allowOverflow: true, button: true, width: '180px', cell: row => (
      <div className="flex items-center gap-2">
        <button onClick={() => loadDetails(row.id ?? row.Id)} className="px-2 py-1 text-xs bg-yellow-100 rounded hover:bg-yellow-200">Details</button>
        <button onClick={() => loadUserBookings(row.id ?? row.Id, row)} className="px-2 py-1 text-xs bg-indigo-100 rounded hover:bg-indigo-200">Bookings</button>
      </div>
    ) }
  ], [])

  // columns for bookings modal
  const bookingsColumns = useMemo(() => [
    { name: 'ID', selector: r => r.id ?? r.Id ?? '-', width: '180px' },
    { name: 'Dates', selector: r => (r.startDate && r.endDate) ? `${new Date(r.startDate).toLocaleDateString()} → ${new Date(r.endDate).toLocaleDateString()}` : '-', grow: 2 },
    { name: 'Status', selector: r => r.status || '-', width: '120px' },
    { name: 'Room', selector: r => r.room?.categoryName || r.roomId || r.room?.id || '-', width: '140px' },
    { name: 'Total', selector: r => r.totalPrice ?? 0, cell: r => (r.totalPrice != null ? r.totalPrice.toLocaleString() + ' ₫' : '-'), width: '140px' }
  ], [])

  async function loadUserBookings(id, user) {
    if (!id) return
    setLoadingBookings(true)
    setBookingsError(null)
    setUserBookings([])
    try {
      const data = await api.request(`https://api.sweethotel.kodopo.tech/api/Bookings/ByUser/${id}`)
      const items = Array.isArray(data) ? data : data?.items || []
      setUserBookings(items)
      setShowBookings(true)
    } catch (err) {
      setBookingsError(err?.message || 'Failed to load bookings')
    } finally {
      setLoadingBookings(false)
    }
  }

  async function submitCreate() {
    setCreateError(null)
    // basic validation
    if (!createForm.email) {
      setCreateError('Email is required')
      return
    }
    if (!createForm.password) {
      setCreateError('Password is required')
      return
    }
    if (createForm.password !== createForm.confirmPassword) {
      setCreateError('Passwords do not match')
      return
    }

    setCreating(true)
    try {
      const payload = {
        fullName: createForm.fullName || '',
        email: createForm.email,
        password: createForm.password,
        confirmPassword: createForm.confirmPassword
      }
      await api.request('https://api.sweethotel.kodopo.tech/api/Auth/Register', { method: 'POST', body: JSON.stringify(payload) })
      // refresh list
      await loadItems()
      setShowCreate(false)
      setCreateForm({ fullName: '', email: '', password: '', confirmPassword: '' })
    } catch (err) {
      setCreateError(err?.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const filtered = items.filter(row => {
    if (!filterText) return true
    return JSON.stringify(row).toLowerCase().includes(filterText.toLowerCase())
  })

  const subHeaderComponent = (
    <div className="flex items-center gap-2 w-full">
      <input type="text" placeholder="Search users..." value={filterText} onChange={e=>setFilterText(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full sm:w-64" />
    </div>
  )

  const customStyles = { headCells:{style:{fontSize:'12px',fontWeight:600}}, cells:{style:{fontSize:'13px'}} }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Users</h2>
            <p className="text-sm text-gray-500">Manage users</p>
          </div>
          <div>
            <button onClick={() => { setShowCreate(true); setCreateForm({ fullName: '', email: '', password: '', confirmPassword: '' }); setCreateError(null); }} className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm">+ New User</button>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow p-4">
      <div className="datatable-wrapper overflow-x-auto">
        {subHeaderComponent}
        <ResponsiveDataTable columns={columns} data={filtered} loading={loading} customStyles={customStyles} noHeader />
      </div>
          
          {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
        </div>

    
        {showDetails && details && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowDetails(false)} />
            <div className="relative w-full max-w-2xl bg-white rounded shadow-lg p-6 z-10">
              <h3 className="text-lg font-medium">User details</h3>
              <div className="mt-4 grid grid-cols-1 gap-3">
                    <div><strong>ID:</strong> <span className="font-mono text-xs">{details.id ?? details.Id}</span></div>
                    <div className="flex items-center gap-3"><div><strong>Avatar:</strong></div><div>{(details.avatar || details.Avatar) ? <img src={details.avatar ?? details.Avatar} alt="avatar" className="w-20 h-20 rounded-md object-cover" /> : <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">N/A</div>}</div></div>
                    <div><strong>Name:</strong> {details.fullName ?? details.FullName ?? details.name ?? details.Name ?? '-'}</div>
                    <div><strong>Email:</strong> {details.email ?? details.Email ?? '-'}</div>
                    <div><strong>Phone:</strong> {details.phoneNumber ?? details.PhoneNumber ?? '-'}</div>
                    <div><strong>Notes:</strong> {details.note || details.description || '-'}</div>
              </div>
              <div className="mt-6 flex justify-end"><button onClick={() => setShowDetails(false)} className="px-3 py-2 bg-gray-100 rounded">Close</button></div>
            </div>
          </div>
        )}

        {showBookings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowBookings(false)} />
            <div className="relative w-full max-w-4xl bg-white rounded shadow-lg p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">Bookings for user</h3>
                  <div className="text-sm text-gray-500">Showing bookings returned by the API</div>
                </div>
                <div>
                  <button onClick={() => setShowBookings(false)} className="px-3 py-2 bg-gray-100 rounded">Close</button>
                </div>
              </div>

              <div className="mt-4">
                {bookingsError && <div className="text-sm text-rose-600 mb-3">{bookingsError}</div>}
                <ResponsiveDataTable columns={bookingsColumns} data={userBookings} loading={loadingBookings} noHeader />
              </div>
            </div>
          </div>
        )}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setShowCreate(false); setCreateError(null); }} />
            <div className="relative w-full max-w-lg bg-white rounded shadow-lg p-6 z-10">
              <h3 className="text-lg font-medium">Create user</h3>
              <div className="mt-4 space-y-3">
                {createError && <div className="text-sm text-rose-600">{createError}</div>}
                <div>
                  <label className="block text-sm text-gray-700">Full name</label>
                  <input value={createForm.fullName} onChange={e => setCreateForm(f => ({ ...f, fullName: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Email</label>
                  <input value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Password</label>
                  <input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Confirm password</label>
                  <input type="password" value={createForm.confirmPassword} onChange={e => setCreateForm(f => ({ ...f, confirmPassword: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => { setShowCreate(false); setCreateError(null); }} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
                <button onClick={submitCreate} disabled={creating} className="px-3 py-2 bg-indigo-600 text-white rounded">{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
