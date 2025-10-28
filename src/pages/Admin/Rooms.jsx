import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import ResponsiveDataTable from '../../components/ResponsiveDataTable'

export default function Rooms() {
  const API_BASE = 'https://api.sweethotel.kodopo.tech'

  function resolveImagePath(p) {
    if (!p) return ''
    // already absolute
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('//')) return p
    // server returns root-relative path like `/uploads/...` or `/Upload/...`
    if (p.startsWith('/')) return API_BASE + p
    return p
  }
  const [items, setItems] = useState([])
  const [filterText, setFilterText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // action states
  const [showDetails, setShowDetails] = useState(false)
  const [detailsTarget, setDetailsTarget] = useState(null)
  const [detailsData, setDetailsData] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [showEdit, setShowEdit] = useState(false)
  const [editRoom, setEditRoom] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState(null)
  // edit image upload states
  const [selectedFilesEdit, setSelectedFilesEdit] = useState([])
  const [filePreviewsEdit, setFilePreviewsEdit] = useState([])

  const [showDelete, setShowDelete] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  
  // create room states
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [newRoom, setNewRoom] = useState({ status: '', amenities: '', price: 0, discount: 0, categoryId: '' })
  // file upload: selected Files and previews
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const [categories, setCategories] = useState([])
  const [statuses, setStatuses] = useState([])

  async function loadItems() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.request('https://api.sweethotel.kodopo.tech/api/Rooms')
      setItems(Array.isArray(data) ? data : data?.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  async function loadAuxData() {
    try {
      const cats = await api.request('https://api.sweethotel.kodopo.tech/api/Categories')
      setCategories(Array.isArray(cats) ? cats : [])
    } catch (err) {
      // ignore, categories optional for listing
      console.warn('Failed to load categories', err?.message)
    }

    try {
      const sts = await api.request('https://api.sweethotel.kodopo.tech/api/Enums/room-statuses')
      setStatuses(Array.isArray(sts) ? sts : [])
    } catch (err) {
      console.warn('Failed to load statuses', err?.message)
    }
  }

  useEffect(() => {
    let mounted = true
    if (mounted) {
      loadItems()
      loadAuxData()
    }
    return () => { mounted = false }
  }, [])

  function openDetails(row) {
    // load fresh details from API to ensure we have category object and full images
    const id = row?.id
    if (!id) {
      setDetailsError('Missing room id')
      setDetailsTarget(row)
      setShowDetails(true)
      return
    }
    setDetailsTarget(row)
    setDetailsLoading(true)
    setDetailsError(null)
    setDetailsData(null)
    setCurrentImageIndex(0)
    setShowDetails(true)
    api.request(`https://api.sweethotel.kodopo.tech/api/Rooms/${id}`).then(data => {
      setDetailsData(data)
    }).catch(err => {
      setDetailsError(err?.message || 'Failed to load details')
    }).finally(() => setDetailsLoading(false))
  }

  function openEdit(row) {
    setEditError(null)
    setEditRoom({ ...row, categoryId: row.categoryId || row.category?.id || '' })
    setShowEdit(true)
  }

  function openDelete(row) {
    setDeleteError(null)
    setDeleteTarget(row)
    setShowDelete(true)
  }

  const columns = useMemo(() => [
    { name: 'ID', selector: r => r.id ?? '-', width: '200px' },
    { name: 'Category', selector: r => r.categoryName || '-'},
    { name: 'Status', selector: r => r.status || '-', width: '120px' },
    {
      name: 'Price',
      selector: r => r.price ?? 0,
      cell: r => (r.price != null ? r.price.toLocaleString() + ' ₫' : '-') ,
      sortable: true,
      width: '140px'
    },
    { name: 'Discount', selector: r => (r.discount != null ? `${r.discount}%` : '-'), sortable: true, width: '110px' },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openDetails(row)} className="px-2 py-1 text-xs bg-yellow-100 rounded hover:bg-yellow-200">Details</button>
          <button onClick={() => openEdit(row)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">Edit</button>
          <button onClick={() => openDelete(row)} className="px-2 py-1 text-xs bg-rose-600 text-white rounded hover:bg-rose-700">Delete</button>
        </div>
      ), ignoreRowClick: true, allowOverflow: true, button: true, width: '190px'
    }
  ], [])

  const filteredItems = items.filter(row => {
    if (!filterText) return true
    const raw = JSON.stringify(row).toLowerCase()
    return raw.includes(filterText.toLowerCase())
  })

  const subHeaderComponent = (
    <div className="flex items-center gap-2 w-full">
      <input
        type="text"
        placeholder="Search rooms..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full sm:w-64"
      />
    </div>
  )

  const customStyles = {
    headCells: { style: { fontSize: '12px', fontWeight: 600 } },
    cells: { style: { fontSize: '13px' } },
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Rooms</h2>
            <p className="text-sm text-gray-500">Manage rooms</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowCreate(true); setCreateError(null); setNewRoom({ status: statuses?.[0]?.name || 'Available', amenities: '', price: 0, discount: 0, categoryId: categories?.[0]?.id || '' }); setSelectedFiles([]); setFilePreviews([]) }} className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm">+ New Room</button>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow p-4">
          <div className="datatable-wrapper">
            {subHeaderComponent}
            <ResponsiveDataTable columns={columns} data={filteredItems} loading={loading} customStyles={customStyles} noHeader />
          </div>
          {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
        </div>

          {/* Create modal */}
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => !creating && setShowCreate(false)} />
              <div className="relative w-full max-w-lg bg-white rounded shadow-lg p-6 z-10">
                <h3 className="text-lg font-medium">Create Room</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select value={newRoom.categoryId} onChange={(e) => setNewRoom({ ...newRoom, categoryId: e.target.value })} className="w-full border px-3 py-2 rounded">
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select value={newRoom.status} onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })} className="w-full border px-3 py-2 rounded">
                      <option value="">Select status</option>
                      {statuses.map(s => <option key={s.name || s.value} value={s.name || s.value}>{s.name || s.value}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amenities</label>
                    <textarea value={newRoom.amenities} onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })} className="w-full border px-3 py-2 rounded" rows={3} />
                  </div>
                  <div className="flex gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price</label>
                      <input type="number" value={newRoom.price} onChange={(e) => setNewRoom({ ...newRoom, price: Number(e.target.value || 0) })} className="w-36 border px-3 py-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Discount (%)</label>
                      <input type="number" value={newRoom.discount} onChange={(e) => setNewRoom({ ...newRoom, discount: Number(e.target.value || 0) })} className="w-24 border px-3 py-2 rounded" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Images (upload files)</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setSelectedFiles(files)
                      // create previews
                      const previews = files.map(f => URL.createObjectURL(f))
                      // revoke old previews
                      filePreviews.forEach(url => URL.revokeObjectURL(url))
                      setFilePreviews(previews)
                    }} className="w-full text-sm" />
                    {filePreviews.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto">
                        {filePreviews.map((p, i) => (
                          <div key={i} className="w-20 h-14 rounded overflow-hidden border">
                            <img src={p} alt={`preview-${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {createError && <div className="text-sm text-rose-600">{createError}</div>}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => !creating && setShowCreate(false)} className="px-3 py-2 rounded border">Cancel</button>
                  <button onClick={async () => {
                    if (creating) return
                    // basic validation
                    if (!newRoom.categoryId) return setCreateError('Category is required')
                    if (!newRoom.status) return setCreateError('Status is required')
                    setCreating(true)
                    setCreateError(null)
                    try {
                      const payload = {
                        status: newRoom.status,
                        amenities: newRoom.amenities,
                        price: Number(newRoom.price) || 0,
                        discount: Number(newRoom.discount) || 0,
                        categoryId: newRoom.categoryId
                      }
                      const created = await api.request('https://api.sweethotel.kodopo.tech/api/Rooms', { method: 'POST', body: JSON.stringify(payload) })
                      const roomId = created?.id || created
                      // attach images if any
                      // upload selected files as multipart/form-data to /api/RoomImages
                      // ASSUMPTION: backend accepts multipart/form-data with fields 'file' and 'roomId'.
                      if (selectedFiles && selectedFiles.length > 0) {
                        try {
                          const form = new FormData()
                          form.append('roomId', roomId)
                          // append each file with the key 'files' so backend binds to List<IFormFile> files
                          for (const file of selectedFiles) form.append('files', file)
                          // call Upload endpoint which expects [FromForm] string roomId, [FromForm] List<IFormFile> files
                          const uploaded = await api.request('https://api.sweethotel.kodopo.tech/api/RoomImages/Upload', { method: 'POST', body: form })
                          // uploaded is expected to be array of saved images; you can use it if needed
                        } catch (imgErr) {
                          console.warn('Failed to upload image files', imgErr?.message)
                        }
                      }
                      // revoke previews after upload
                      filePreviews.forEach(url => URL.revokeObjectURL(url))
                      setFilePreviews([])
                      setSelectedFiles([])
                      await loadItems()
                      setShowCreate(false)
                    } catch (err) {
                      setCreateError(err.message || 'Failed to create room')
                    } finally {
                      setCreating(false)
                    }
                  }} className="px-3 py-2 rounded bg-emerald-600 text-white">{creating ? 'Creating...' : 'Create'}</button>
                </div>
              </div>
            </div>
          )}

        {/* Details modal (fetches /api/Rooms/{id}) */}
        {showDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setShowDetails(false); setDetailsData(null); setDetailsError(null); setCurrentImageIndex(0) }} />
            <div className="relative w-full max-w-3xl bg-white rounded shadow-lg p-6 z-10">
              <h3 className="text-lg font-medium">Room details</h3>

              {detailsLoading ? (
                <div className="mt-6 text-sm text-gray-600">Loading...</div>
              ) : detailsError ? (
                <div className="mt-6 text-sm text-rose-600">{detailsError}</div>
              ) : detailsData ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    {/* Image slider */}
                    <div className="relative bg-gray-100 rounded overflow-hidden">
                      {detailsData.images && detailsData.images.length > 0 ? (
                        <>
                          <img src={resolveImagePath(detailsData.images[currentImageIndex].path)} alt={`room-${currentImageIndex}`} className="w-full h-56 object-cover" />
                          {/* prev/next buttons */}
                          <button onClick={() => setCurrentImageIndex(i => (i - 1 + detailsData.images.length) % detailsData.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full">
                            ‹
                          </button>
                          <button onClick={() => setCurrentImageIndex(i => (i + 1) % detailsData.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full">
                            ›
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-56 flex items-center justify-center text-sm text-gray-400">No images</div>
                      )}
                      {/* thumbnails */}
                      {detailsData.images && detailsData.images.length > 1 && (
                        <div className="flex gap-2 p-2 overflow-x-auto">
                          {detailsData.images.map((img, idx) => (
                            <button key={img.id || idx} onClick={() => setCurrentImageIndex(idx)} className={`w-16 h-12 flex-shrink-0 rounded overflow-hidden border ${idx === currentImageIndex ? 'ring-2 ring-indigo-500' : 'ring-0'}`}>
                              <img src={resolveImagePath(img.path)} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-600">ID</div>
                    <div className="font-mono text-xs text-gray-800 break-all">{detailsData.id}</div>

                    <div className="mt-3 text-sm text-gray-600">Category</div>
                    <div className="text-sm">{detailsData.category?.name || detailsData.categoryName || '-'}</div>

                    <div className="mt-3 text-sm text-gray-600">Status</div>
                    <div className="text-sm">{detailsData.status}</div>

                    <div className="mt-3 text-sm text-gray-600">Amenities</div>
                    <div className="text-sm">{detailsData.amenities}</div>

                    <div className="mt-3 flex gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Price</div>
                        <div className="text-sm">{detailsData.price?.toLocaleString()} ₫</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Discount</div>
                        <div className="text-sm">{detailsData.discount ?? 0}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Max people</div>
                        <div className="text-sm">{detailsData.category?.maxPeople ?? '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-sm text-gray-600">No details available.</div>
              )}

              <div className="mt-6 flex justify-end">
                <button onClick={() => { setShowDetails(false); setDetailsData(null); setDetailsError(null); setCurrentImageIndex(0) }} className="px-3 py-2 bg-gray-100 rounded">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete modal */}
        {showDelete && deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !deleting && setShowDelete(false)} />
            <div className="relative w-full max-w-md bg-white rounded shadow-lg p-6 z-10">
              <h3 className="text-lg font-medium">Delete Room</h3>
              <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete <strong>{deleteTarget.id}</strong>?</p>
              {deleteError && <div className="mt-3 text-sm text-rose-600">{deleteError}</div>}
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => !deleting && setShowDelete(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button onClick={async () => {
                  if (deleting) return
                  setDeleting(true)
                  setDeleteError(null)
                  try {
                    const id = deleteTarget.id
                    if (!id) throw new Error('Missing room id')
                    // POST delete because hosting blocks DELETE/PUT/PATCH
                    await api.request(`https://api.sweethotel.kodopo.tech/api/Rooms/Delete/${id}`, { method: 'POST' })
                    // remove from local list to reflect change immediately
                    setItems(prev => prev.filter(i => i.id !== id))
                    setShowDelete(false)
                    setDeleteTarget(null)
                  } catch (err) {
                    setDeleteError(err.message || 'Failed to delete')
                  } finally {
                    setDeleting(false)
                  }
                }} className="px-3 py-2 rounded bg-rose-600 text-white">{deleting ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {showEdit && editRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !editing && setShowEdit(false)} />
            <div className="relative w-full max-w-lg bg-white rounded shadow-lg p-6 z-10">
              <h3 className="text-lg font-medium">Edit Room</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={editRoom.status || ''} onChange={(e) => setEditRoom({ ...editRoom, status: e.target.value })} className="w-full border px-3 py-2 rounded">
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={editRoom.categoryId || editRoom.category?.id || ''} onChange={(e) => setEditRoom({ ...editRoom, categoryId: e.target.value })} className="w-full border px-3 py-2 rounded">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amenities</label>
                  <textarea value={editRoom.amenities || ''} onChange={(e) => setEditRoom({ ...editRoom, amenities: e.target.value })} className="w-full border px-3 py-2 rounded" rows={3} />
                </div>
                <div className="flex gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input type="number" value={editRoom.price ?? 0} onChange={(e) => setEditRoom({ ...editRoom, price: Number(e.target.value || 0) })} className="w-32 border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount (%)</label>
                    <input type="number" value={editRoom.discount ?? 0} onChange={(e) => setEditRoom({ ...editRoom, discount: Number(e.target.value || 0) })} className="w-24 border px-3 py-2 rounded" />
                  </div>
                </div>
                {/* Existing images with delete */}
                <div>
                  <label className="block text-sm font-medium mb-1">Existing images</label>
                  <div className="flex gap-2 overflow-x-auto">
                    {(editRoom.images || []).map(img => (
                      <div key={img.id} className="relative w-28 h-20 rounded overflow-hidden border">
                        <img src={resolveImagePath(img.path)} alt={img.id} className="w-full h-full object-cover" />
                        <button onClick={async () => {
                          if (!img.id) return
                          if (!confirm('Delete this image?')) return
                          try {
                            await api.request(`https://api.sweethotel.kodopo.tech/api/RoomImages/Delete/${img.id}`, { method: 'POST' })
                            // remove from editRoom.images
                            setEditRoom(er => ({ ...er, images: (er.images || []).filter(i => i.id !== img.id) }))
                          } catch (err) {
                            alert(err?.message || 'Failed to delete image')
                          }
                        }} className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload new images for edit */}
                <div>
                  <label className="block text-sm font-medium mb-1">Add images</label>
                  <input type="file" accept="image/*" multiple onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setSelectedFilesEdit(files)
                    // create previews
                    const previews = files.map(f => URL.createObjectURL(f))
                    // revoke previous edit previews
                    filePreviewsEdit.forEach(url => URL.revokeObjectURL(url))
                    setFilePreviewsEdit(previews)
                  }} className="w-full text-sm" />
                  {filePreviewsEdit.length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto">
                      {filePreviewsEdit.map((p, i) => (
                        <div key={i} className="w-20 h-14 rounded overflow-hidden border">
                          <img src={p} alt={`preview-edit-${i}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {editError && <div className="text-sm text-rose-600">{editError}</div>}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => !editing && setShowEdit(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button onClick={async () => {
                  if (editing) return
                  setEditing(true)
                  setEditError(null)
                  try {
                    const id = editRoom.id
                    if (!id) throw new Error('Missing room id')
                    await api.request(`https://api.sweethotel.kodopo.tech/api/Rooms/Update/${id}`, {
                      method: 'POST',
                      body: JSON.stringify({
                        status: editRoom.status,
                        amenities: editRoom.amenities,
                        price: Number(editRoom.price) || 0,
                        discount: Number(editRoom.discount) || 0,
                        categoryId: editRoom.categoryId || editRoom.category?.id || ''
                      })
                    })
                      // If user selected new images, delete all existing images first, then upload new ones
                      if (selectedFilesEdit && selectedFilesEdit.length > 0) {
                        try {
                          // delete existing images (POST Delete because hosting blocks DELETE)
                          const existing = editRoom.images || []
                          for (const img of existing) {
                            try {
                              if (img?.id) {
                                await api.request(`https://api.sweethotel.kodopo.tech/api/RoomImages/Delete/${img.id}`, { method: 'POST' })
                              }
                            } catch (delErr) {
                              console.warn('Failed to delete existing image', delErr?.message)
                              // continue deleting others
                            }
                          }
                          // upload new files
                          const form = new FormData()
                          form.append('roomId', id)
                          for (const file of selectedFilesEdit) form.append('files', file)
                          const uploaded = await api.request('https://api.sweethotel.kodopo.tech/api/RoomImages/Upload', { method: 'POST', body: form })
                          // replace editRoom.images with uploaded results (if provided)
                          if (Array.isArray(uploaded)) {
                            setEditRoom(er => ({ ...er, images: uploaded }))
                          } else if (uploaded) {
                            // sometimes server returns single object
                            setEditRoom(er => ({ ...er, images: [...(er.images || []), uploaded] }))
                          } else {
                            setEditRoom(er => ({ ...er, images: [] }))
                          }
                        } catch (imgErr) {
                          console.warn('Failed to replace edit image files', imgErr?.message)
                        }
                        filePreviewsEdit.forEach(url => URL.revokeObjectURL(url))
                        setFilePreviewsEdit([])
                        setSelectedFilesEdit([])
                      }
                    await loadItems()
                    setShowEdit(false)
                  } catch (err) {
                    setEditError(err.message || 'Failed to update')
                  } finally {
                    setEditing(false)
                  }
                }} className="px-3 py-2 rounded bg-indigo-600 text-white">{editing ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
