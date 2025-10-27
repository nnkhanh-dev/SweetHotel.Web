import AdminLayout from '../../components/layout/AdminLayout'

const stats = [
  { id: 1, name: 'Total Bookings', value: '1,254', delta: '+8%' },
  { id: 2, name: 'Active Guests', value: '342', delta: '-2%' },
  { id: 3, name: 'Rooms Available', value: '42', delta: '+5%' },
  { id: 4, name: 'Revenue (7d)', value: '$12,430', delta: '+12%' },
]

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.id} className="p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{s.name}</div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                </div>
                <div className={`text-sm font-medium ${s.delta.startsWith('+') ? 'text-green-600' : 'text-rose-600'}`}>
                  {s.delta}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">Bookings Overview</h3>
              <div className="h-56 bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-400">Chart placeholder</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">Recent Bookings</h3>
              <ul className="divide-y">
                <li className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-xs text-gray-500">Deluxe · 2 nights</div>
                  </div>
                  <div className="text-sm text-gray-500">Today</div>
                </li>
                <li className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Alice Smith</div>
                    <div className="text-xs text-gray-500">Standard · 1 night</div>
                  </div>
                  <div className="text-sm text-gray-500">Yesterday</div>
                </li>
              </ul>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h4 className="text-sm font-semibold mb-2">Today's Summary</h4>
              <div className="text-sm text-gray-700">Check-ins: <span className="font-medium">24</span></div>
              <div className="text-sm text-gray-700">Check-outs: <span className="font-medium">8</span></div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h4 className="text-sm font-semibold mb-2">Notifications</h4>
              <ul className="text-sm text-gray-600">
                <li>- Low inventory in Room 204</li>
                <li>- New review pending approval</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  )
}
