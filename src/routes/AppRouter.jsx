import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login/Login'
import Dashboard from '../pages/Admin/Dashboard'
import Categories from '../pages/Admin/Categories'
import Rooms from '../pages/Admin/Rooms'
import Bookings from '../pages/Admin/Bookings'
import Users from '../pages/Admin/Users'
import useAuth from '../hooks/useAuth'

function PrivateRoute({ children }) {
  const auth = useAuth()
  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/rooms"
          element={
            <PrivateRoute>
              <Rooms />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
