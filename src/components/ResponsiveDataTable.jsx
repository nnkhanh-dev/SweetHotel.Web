import React, { useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'

// Responsive wrapper around react-data-table-component.
// - on wide screens: render DataTable (keeps built-in pagination/search features)
// - on small screens: render stacked cards with simple client-side pagination
export default function ResponsiveDataTable({ columns = [], data = [], loading = false, pageSize = 10, customStyles, noHeader }) {
  const [isMobile, setIsMobile] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(pageSize)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = (e) => setIsMobile(e.matches)
    onChange(mq)
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange)
    return () => { mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange) }
  }, [])

  useEffect(() => { setCurrentPage(1) }, [data, perPage])

  const total = Array.isArray(data) ? data.length : 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const pageItems = useMemo(() => {
    if (!Array.isArray(data)) return []
    const start = (currentPage - 1) * perPage
    return data.slice(start, start + perPage)
  }, [data, currentPage, perPage])

  // render value cell: prefer column.cell (render function), then column.selector if function, else fallback
  function renderCell(col, row) {
    try {
      if (typeof col.cell === 'function') return col.cell(row)
      if (typeof col.selector === 'function') return col.selector(row)
      if (typeof col.selector === 'string') return row[col.selector]
      return row[col.selector] ?? '-'
    } catch (err) {
      return '-'
    }
  }

  if (!isMobile) {
    return (
      <div className="datatable-wrapper">
        <DataTable
          columns={columns}
          data={data}
          progressPending={loading}
          pagination
          responsive
          persistTableHead
          highlightOnHover
          customStyles={customStyles}
          noHeader={noHeader}
        />
      </div>
    )
  }

  // Mobile (card) layout
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {pageItems.map((row, idx) => (
          <div key={row.id ?? idx} className="bg-white border rounded-lg p-3 shadow-sm">
            <div className="flex flex-col gap-2">
              {columns.map((col, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div className="text-xs text-gray-500 w-20 sm:w-28">{col.name}</div>
                  <div className="text-sm text-gray-800 flex-1">
                    {renderCell(col, row)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* pagination controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border rounded disabled:opacity-50" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>Prev</button>
          <div className="text-sm">Page {currentPage} / {totalPages}</div>
          <button className="px-2 py-1 border rounded disabled:opacity-50" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Next</button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Per page</label>
          <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value || 10))} className="border px-2 py-1 rounded text-sm">
            {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
