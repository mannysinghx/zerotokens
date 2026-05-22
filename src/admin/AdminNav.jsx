/**
 * AdminNav.jsx
 * Sidebar navigation for the admin panel.
 */
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/admin',            icon: '📊', label: 'Dashboard'  },
  { to: '/admin/companies',  icon: '🏢', label: 'Companies'  },
  { to: '/admin/employees',  icon: '👥', label: 'Employees'  },
  { to: '/admin/questions',  icon: '📚', label: 'Questions'  },
  { to: '/admin/responses',  icon: '📋', label: 'Responses'  },
]

export default function AdminNav({ onLogout }) {
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
        <div className="text-xs text-slate-600 font-mono mt-0.5">Admin Panel</div>
      </div>

      {/* Nav links */}
      <div className="flex-1 py-4 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-colors ${
                isActive
                  ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
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
