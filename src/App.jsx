import './App.css'
import { AuthProvider } from './context/AuthContext'
import AppRouter from './routes/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <AppRouter />
      </div>
    </AuthProvider>
  )
}
