/**
 * CompanyAdminApp.jsx
 * Root of the /company-admin panel.
 * Checks sessionStorage for co_admin_token; shows login if absent.
 */
import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CompanyAdminLogin from './CompanyAdminLogin.jsx'
import CompanyAdminNav from './CompanyAdminNav.jsx'
import CoDashboard from './pages/CoDashboard.jsx'
import CoEmployees from './pages/CoEmployees.jsx'
import IdleWarningModal from '../components/ui/IdleWarningModal.jsx'
import { useIdleTimer } from '../hooks/useIdleTimer.js'
import { coAdminMe, apiLogin } from '../utils/api.js'

export default function CompanyAdminApp() {
  const [token,     setToken]     = useState(null)
  const [adminUser, setAdminUser] = useState(null)
  const [checking,  setChecking]  = useState(true)
  const [loginErr,  setLoginErr]  = useState('')

  // On mount: check for saved token and validate it
  useEffect(() => {
    const saved = sessionStorage.getItem('co_admin_token')
    if (!saved) {
      setChecking(false)
      return
    }
    coAdminMe(saved)
      .then(data => {
        setToken(saved)
        setAdminUser(data.user)
      })
      .catch(() => {
        sessionStorage.removeItem('co_admin_token')
      })
      .finally(() => setChecking(false))
  }, [])

  async function handleLogin(email, password) {
    setLoginErr('')
    // First log in to get a session token
    const loginData = await apiLogin(email, password)
    const sessionToken = loginData.sessionToken
    // Confirm company admin status
    const meData = await coAdminMe(sessionToken)
    // If we get here without throwing, it's a valid company admin
    sessionStorage.setItem('co_admin_token', sessionToken)
    setToken(sessionToken)
    setAdminUser(meData.user)
  }

  function handleLogout() {
    sessionStorage.removeItem('co_admin_token')
    setToken(null)
    setAdminUser(null)
  }

  // ── Idle logout timer ──────────────────────────────────────────────────────
  const handleIdleLogout = useCallback(() => { handleLogout() }, [])
  const { showWarning, secondsLeft, keepAlive } = useIdleTimer({
    onLogout: handleIdleLogout,
    enabled:  Boolean(token && adminUser),
  })

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-mono text-sm">
        Checking session…
      </div>
    )
  }

  if (!token || !adminUser) {
    return (
      <CompanyAdminLogin
        onLogin={handleLogin}
        externalError={loginErr}
      />
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {showWarning && (
        <IdleWarningModal
          secondsLeft={secondsLeft}
          username={adminUser?.username}
          onKeepAlive={keepAlive}
          onLogout={handleLogout}
        />
      )}
      <CompanyAdminNav adminUser={adminUser} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/"          element={<CoDashboard token={token} adminUser={adminUser} />} />
          <Route path="/employees" element={<CoEmployees token={token} adminUser={adminUser} />} />
          <Route path="*"          element={<Navigate to="/company-admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}
