import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const AdminApp        = lazy(() => import('./admin/AdminApp.jsx'))
const CompanyAdminApp = lazy(() => import('./company-admin/CompanyAdminApp.jsx'))
const VerifyEmail     = lazy(() => import('./components/screens/VerifyEmailScreen.jsx'))
const AboutScreen     = lazy(() => import('./components/screens/AboutScreen.jsx'))
const ArcadeApp       = lazy(() => import('./arcade/ArcadeApp.jsx'))

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center text-slate-500 font-mono text-sm">
    Loading…
  </div>
)

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={<Suspense fallback={<Loader />}><AdminApp /></Suspense>}
        />
        <Route
          path="/company-admin/*"
          element={
            <div className="min-h-screen bg-slate-950 relative">
              <div className="scanlines" />
              <Suspense fallback={<Loader />}><CompanyAdminApp /></Suspense>
            </div>
          }
        />
        <Route
          path="/verify"
          element={
            <div className="min-h-screen bg-slate-950 relative">
              <div className="scanlines" />
              <Suspense fallback={<Loader />}><VerifyEmail /></Suspense>
            </div>
          }
        />
        <Route
          path="/about"
          element={
            <div className="min-h-screen bg-slate-950 relative">
              <Suspense fallback={<Loader />}><AboutScreen /></Suspense>
            </div>
          }
        />
        <Route
          path="/arcade"
          element={
            <div className="min-h-screen bg-black relative">
              <Suspense fallback={<Loader />}><ArcadeApp /></Suspense>
            </div>
          }
        />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
