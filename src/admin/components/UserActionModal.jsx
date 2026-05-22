/**
 * UserActionModal.jsx
 * Shared modal for user admin actions: disable/enable/delete/set-password.
 *
 * Props:
 *   user              — { id, username, email, is_active }
 *   action            — 'disable' | 'enable' | 'delete' | 'set-password'
 *   password          — admin password (not required when onConfirmAction is provided)
 *   onClose           — called on cancel or after success
 *   onSuccess         — called after a successful action
 *   onConfirmAction   — optional; if provided, called with { userId, action, newPassword? }
 *                       instead of adminManageUser. Makes the modal reusable for company admin.
 */
import { useState } from 'react'
import { adminManageUser } from '../../utils/api.js'

const ACTION_META = {
  disable: {
    title:   'Disable Account',
    message: (u) => `${u.username} will be immediately logged out and blocked from signing in. You can re-enable the account at any time.`,
    confirm: 'Disable Account',
    color:   'bg-amber-600 hover:bg-amber-500',
    icon:    '🔒',
  },
  enable: {
    title:   'Enable Account',
    message: (u) => `Re-enable ${u.username}'s account so they can sign in again.`,
    confirm: 'Enable Account',
    color:   'bg-emerald-600 hover:bg-emerald-500',
    icon:    '✅',
  },
  delete: {
    title:   'Delete Account',
    message: (u) => `Permanently delete ${u.username} (${u.email}). This removes all their sessions, responses, and assignments. This cannot be undone.`,
    confirm: 'Delete Permanently',
    color:   'bg-red-600 hover:bg-red-500',
    icon:    '🗑',
  },
  'set-password': {
    title:   'Change Password',
    message: (u) => `Set a new password for ${u.username}. They will be logged out of all devices.`,
    confirm: 'Set Password',
    color:   'bg-cyan-600 hover:bg-cyan-500',
    icon:    '🔑',
  },
}

export default function UserActionModal({ user, action, password, onClose, onSuccess, onConfirmAction }) {
  const [newPassword, setNewPassword] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const meta = ACTION_META[action]
  if (!meta) return null

  async function handleConfirm() {
    if (action === 'set-password' && newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    setError('')
    try {
      const params = {
        userId:      user.id,
        action,
        newPassword: action === 'set-password' ? newPassword : undefined,
      }
      if (onConfirmAction) {
        await onConfirmAction(params)
      } else {
        await adminManageUser(password, params)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <h2 className="text-lg font-black text-slate-100">{meta.title}</h2>
            <p className="text-xs text-slate-500 font-mono">{user.username} · {user.email}</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-slate-400 font-mono leading-relaxed mb-5">
          {meta.message(user)}
        </p>

        {/* Password input (set-password only) */}
        {action === 'set-password' && (
          <div className="mb-5">
            <label className="block text-xs uppercase tracking-widest text-cyan-600 font-mono mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              autoFocus
              className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm outline-none transition-colors"
            />
          </div>
        )}

        {error && (
          <p className="text-red-400 text-xs font-mono mb-4">⚠ {error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={saving || (action === 'set-password' && newPassword.length < 8)}
            className={`flex-1 ${meta.color} disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-colors`}
          >
            {saving ? 'Working…' : meta.confirm}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-sm font-mono text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
