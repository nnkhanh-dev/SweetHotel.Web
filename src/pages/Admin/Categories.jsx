import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../services/api'
import DataTable from 'react-data-table-component'

export default function Categories() {
  const [items, setItems] = useState([])
  const [filterText, setFilterText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '', description: '', maxPeople: 1 })
  const [showEdit, setShowEdit] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState(null)
  const [editCategory, setEditCategory] = useState(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Make loader reusable so we can refresh after creating
  async function loadItems() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.request('https://api.sweethotel.kodopo.tech/api/Categories')
      setItems(Array.isArray(data) ? data : data?.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    if (mounted) loadItems()
    return () => { mounted = false }
  }, [])


  function openEdit(row) {
    setEditError(null)
    setEditCategory({ ...row })
    setShowEdit(true)
  }

  function openDelete(row) {
    setDeleteError(null)
    setDeleteTarget(row)
    setShowDelete(true)
  }

  const columns = useMemo(() => [
    { name: 'ID', selector: row => row.id ?? '-', width: '90px' },
    { name: 'Name', selector: row => row.name || row.title || '-', sortable: true, wrap: true },
    { name: 'Description', selector: row => row.description || row.desc || '-', wrap: true, grow: 2 },
    {
      name: 'Actions', cell: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Edit</button>
          <button onClick={() => openDelete(row)} className="px-3 py-1 text-sm bg-rose-600 text-white rounded hover:bg-rose-700">Delete</button>
        </div>
      ), ignoreRowClick: true, allowOverflow: true, button: true, width: '160px'
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
        placeholder="Search categories..."
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
            <h2 className="text-xl font-semibold">Categories</h2>
            <p className="text-sm text-gray-500">Manage your categories</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowCreate(true); setCreateError(null); setNewCategory({ name: '', description: '', maxPeople: 1 }) }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
            >
              + New Category
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow p-4">
          {/* Wrapper to allow horizontal scrolling on small screens (like Bootstrap's .table-responsive) */}
          <div className="overflow-x-auto">
            <DataTable
              className="min-w-[700px]"
              columns={columns}
              data={filteredItems}
              progressPending={loading}
              pagination
              responsive
              persistTableHead
              subHeader
              subHeaderComponent={subHeaderComponent}
              highlightOnHover
              customStyles={customStyles}
              noHeader
            />
          </div>
          {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !creating && setShowCreate(false)} />
            <div className="relative w-full max-w-lg bg-white rounded shadow-lg p-6 z-10">
              <h3 className="text-lg font-medium">Create Category</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    rows={3}
                    placeholder="Description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max People</label>
                  <input
                    type="number"
                    min={1}
                    value={newCategory.maxPeople}
                    onChange={(e) => setNewCategory({ ...newCategory, maxPeople: Number(e.target.value || 0) })}
                    className="w-32 border px-3 py-2 rounded"
                  />
                </div>
                {createError && <div className="text-sm text-rose-600">{createError}</div>}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => !creating && setShowCreate(false)}
                  className="px-3 py-2 rounded border bg-white text-sm"
                >Cancel</button>
                <button
                  onClick={async () => {
                    // basic validation
                    if (!newCategory.name || creating) return setCreateError('Name is required')
                    setCreating(true)
                    setCreateError(null)
                    try {
                      await api.request('https://api.sweethotel.kodopo.tech/api/Categories', {
                        method: 'POST',
                        body: JSON.stringify({
                          name: newCategory.name,
                          description: newCategory.description,
                          maxPeople: Number(newCategory.maxPeople) || 0
                        })
                      })
                      // refresh list
                      await loadItems()
                      setShowCreate(false)
                    } catch (err) {
                      setCreateError(err.message || 'Failed to create category')
                    } finally {
                      setCreating(false)
                    }
                  }}
                  className="px-3 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                >{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </div>
          </div>
        )}
        {/* Delete confirmation modal */}
        {showDelete && deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !deleting && setShowDelete(false)} />
            <div className="relative w-full max-w-md bg-white rounded shadow-lg p-6 z-10">
              <h3 className="text-lg font-medium">Delete Category</h3>
              <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete <strong>{deleteTarget.name || deleteTarget.title || 'this category'}</strong>? This action cannot be undone.</p>
              {deleteError && <div className="mt-3 text-sm text-rose-600">{deleteError}</div>}
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => !deleting && setShowDelete(false)} className="px-3 py-2 rounded border bg-white text-sm">Cancel</button>
                <button
                  onClick={async () => {
                    if (deleting) return
                    setDeleting(true)
                    setDeleteError(null)
                    try {
                      const id = deleteTarget.id || deleteTarget.categoryId || deleteTarget.Id
                      if (!id) throw new Error('Missing category id')
                      // API expects POST to Delete/{id}
                      await api.request(`https://api.sweethotel.kodopo.tech/api/Categories/Delete/${id}`, {
                        method: 'POST'
                      })
                      await loadItems()
                      setShowDelete(false)
                    } catch (err) {
                      setDeleteError(err.message || 'Failed to delete')
                    } finally {
                      setDeleting(false)
                    }
                  }}
                  className="px-3 py-2 rounded bg-rose-600 text-white text-sm hover:bg-rose-700"
                >{deleting ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        )}
        {/* Edit modal */}
        {showEdit && editCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !editing && setShowEdit(false)} />
            <div className="relative w-full max-w-lg bg-white rounded shadow-lg p-6 z-10">
              <h3 className="text-lg font-medium">Edit Category</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editCategory.name || ''}
                    onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editCategory.description || ''}
                    onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    rows={3}
                    placeholder="Description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max People</label>
                  <input
                    type="number"
                    min={1}
                    value={editCategory.maxPeople ?? 1}
                    onChange={(e) => setEditCategory({ ...editCategory, maxPeople: Number(e.target.value || 0) })}
                    className="w-32 border px-3 py-2 rounded"
                  />
                </div>
                {editError && <div className="text-sm text-rose-600">{editError}</div>}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => !editing && setShowEdit(false)}
                  className="px-3 py-2 rounded border bg-white text-sm"
                >Cancel</button>
                <button
                  onClick={async () => {
                    if (!editCategory?.name || editing) return setEditError('Name is required')
                    setEditing(true)
                    setEditError(null)
                    try {
                      const id = editCategory.id || editCategory.categoryId || editCategory.Id
                      if (!id) throw new Error('Missing category id')
                      // Hosting blocks PUT/PATCH/DELETE — use POST to Update endpoint instead
                      await api.request(`https://api.sweethotel.kodopo.tech/api/Categories/Update/${id}`, {
                        method: 'POST',
                        body: JSON.stringify({
                          name: editCategory.name,
                          description: editCategory.description,
                          maxPeople: Number(editCategory.maxPeople) || 0
                        })
                      })
                      await loadItems()
                      setShowEdit(false)
                    } catch (err) {
                      setEditError(err.message || 'Failed to update category')
                    } finally {
                      setEditing(false)
                    }
                  }}
                  className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >{editing ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
