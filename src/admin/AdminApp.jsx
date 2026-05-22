/**
 * AdminApp.jsx
 * Root of the /admin panel.
 * Checks sessionStorage for admin_token; redirects to login if absent.
 */
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './AdminLogin.jsx'
import AdminNav from './AdminNav.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CompanyManager from './pages/CompanyManager.jsx'
import EmployeeManager from './pages/EmployeeManager.jsx'
import QuestionBank from './pages/QuestionBank.jsx'
import ResponseViewer from './pages/ResponseViewer.jsx'

export default function AdminApp() {
  const [password, setPassword] = useState(() => sessionStorage.getItem('admin_token') || '')
  const isLoggedIn = Boolean(password)

  // Sync password changes to sessionStorage
  useEffect(() => {
    if (password) sessionStorage.setItem('admin_token', password)
    else          sessionStorage.removeItem('admin_token')
  }, [password])

  function handleLogout() {
    sessionStorage.removeItem('admin_token')
    setPassword('')
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={setPassword} />
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminNav onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/"            element={<AdminDashboard   password={password} />} />
          <Route path="/companies"   element={<CompanyManager   password={password} />} />
          <Route path="/employees"   element={<EmployeeManager  password={password} />} />
          <Route path="/questions"   element={<QuestionBank     password={password} />} />
          <Route path="/responses"   element={<ResponseViewer   password={password} />} />
          <Route path="*"            element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}
