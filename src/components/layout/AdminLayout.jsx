import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function AdminLayout({ children }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    auth.logout()
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard', to: '/admin' },
    { name: 'Categories', to: '/admin/categories' },
    { name: 'Bookings', to: '/admin/bookings' },
    { name: 'Rooms', to: '/admin/rooms' },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="text-lg font-semibold text-indigo-600">SweetHotel</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className="block py-2 px-3 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <button onClick={handleLogout} className="w-full py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700">
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileOpen(false)} />
        <aside className={`absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="text-lg font-semibold text-indigo-600">SweetHotel</div>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <a key={item.name} href={item.to} className="block py-2 px-3 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => setMobileOpen(false)}>
                {item.name}
              </a>
            ))}
          </nav>
          <div className="p-4">
            <button onClick={() => { setMobileOpen(false); handleLogout() }} className="w-full py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700">
              Logout
            </button>
          </div>
        </aside>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="text-lg font-semibold text-indigo-600 hidden md:block">Dashboard</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-56 pl-10 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">{auth.user?.name || auth.user?.email}</div>
                      <div className="text-xs text-gray-500">{auth.user?.role || 'Admin'}</div>
                    </div>
                    <img src="/src/assets/react.svg" alt="avatar" className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <section className="max-w-7xl mx-auto">{children}</section>
        </main>
      </div>
    </div>
  )
}
