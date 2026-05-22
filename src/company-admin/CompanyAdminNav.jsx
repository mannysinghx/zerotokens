/**
 * CompanyAdminNav.jsx
 * Sidebar navigation for the company admin portal.
 * Violet/purple accent to distinguish from super admin (cyan).
 */
import { NavLink } from 'react-router-dom'

function NavItem({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-colors ${
          isActive
            ? 'bg-purple-900/40 text-purple-400 border border-purple-800/60'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`
      }
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

export default function CompanyAdminNav({ adminUser, onLogout }) {
  return (
    <nav
      className="w-52 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col"
      style={{ minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="font-black text-sm tracking-widest" style={{ fontFamily: 'Exo 2', color: '#00d4ff' }}>
          TOKEN<span style={{ color: '#a855f7' }}>QUEST</span>
        </div>
        <div className="text-xs font-mono mt-0.5" style={{ color: '#a855f7' }}>
          {adminUser?.company_name ?? 'Company'}
        </div>
        <div className="text-xs text-slate-600 font-mono">Admin Portal</div>
      </div>

      {/* Nav links */}
      <div className="flex-1 py-4 space-y-1 px-3">
        <NavItem to="/company-admin"           icon="📊" label="Dashboard" end />
        <NavItem to="/company-admin/employees" icon="👥" label="Employees" />
      </div>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="px-3 py-2 mb-1">
          <div className="text-xs font-mono text-slate-400 truncate">{adminUser?.username ?? ''}</div>
          <div className="text-xs font-mono text-slate-600 truncate">{adminUser?.email ?? ''}</div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <span>🚪</span>
          <span>Log out</span>
        </button>
      </div>
    </nav>
  )
}
