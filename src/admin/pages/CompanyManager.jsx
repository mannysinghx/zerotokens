/**
 * CompanyManager.jsx
 * Admin page: create companies and invite employees by email.
 */
import { useState, useEffect } from 'react'
import {
  adminFetchCompanies, adminCreateCompany, adminInviteEmployee,
} from '../../utils/api.js'

export default function CompanyManager({ password }) {
  const [companies,   setCompanies]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  // New company form
  const [newName,     setNewName]     = useState('')
  const [newDomain,   setNewDomain]   = useState('')
  const [creating,    setCreating]    = useState(false)
  const [createErr,   setCreateErr]   = useState('')

  // Invite form
  const [invEmail,    setInvEmail]    = useState('')
  const [invName,     setInvName]     = useState('')
  const [invCompany,  setInvCompany]  = useState('')
  const [inviting,    setInviting]    = useState(false)
  const [invResult,   setInvResult]   = useState(null)   // { success, error, url? }

  async function load() {
    setLoading(true)
    try {
      const { companies: rows } = await adminFetchCompanies(password)
      setCompanies(rows)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreateCompany(e) {
    e.preventDefault()
    if (!newName.trim()) { setCreateErr('Company name is required'); return }
    setCreating(true); setCreateErr('')
    try {
      await adminCreateCompany(password, { name: newName.trim(), domain: newDomain.trim() || null })
      setNewName(''); setNewDomain('')
      await load()
    } catch (e) {
      setCreateErr(e.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    if (!invEmail.trim()) { setInvResult({ error: 'Email is required' }); return }
    if (!invName.trim())  { setInvResult({ error: 'Name is required' }); return }
    if (!invCompany)      { setInvResult({ error: 'Select a company' }); return }
    setInviting(true); setInvResult(null)
    try {
      const data = await adminInviteEmployee(password, {
        email:     invEmail.trim(),
        username:  invName.trim(),
        companyId: invCompany,
      })
      setInvResult({ success: true, url: data.inviteUrl })
      setInvEmail(''); setInvName(''); setInvCompany('')
    } catch (e) {
      setInvResult({ error: e.message })
    } finally {
      setInviting(false)
    }
  }

  const inputCls = 'w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm outline-none transition-colors placeholder:text-slate-600'
  const labelCls = 'block text-xs uppercase tracking-widest text-cyan-600 font-mono mb-1'

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-black text-slate-100" style={{ fontFamily: 'Exo 2' }}>
        🏢 Company Manager
      </h1>

      {/* ── Create Company ───────────────────────────────── */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-slate-200 font-mono mb-5">Create Company</h2>
        <form onSubmit={handleCreateCompany} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className={labelCls}>Company Name</label>
            <input className={inputCls} value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Acme Corp" />
          </div>
          <div>
            <label className={labelCls}>Domain (optional)</label>
            <input className={inputCls} value={newDomain} onChange={e => setNewDomain(e.target.value)}
              placeholder="acme.com" />
          </div>
          <button type="submit" disabled={creating || !newName.trim()}
            className="h-10 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-sm font-bold disabled:opacity-40 transition-colors">
            {creating ? 'Creating…' : '+ Add Company'}
          </button>
        </form>
        {createErr && <p className="text-red-400 text-xs font-mono mt-2">⚠ {createErr}</p>}
      </section>

      {/* ── Companies List ───────────────────────────────── */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-slate-200 font-mono mb-4">
          All Companies ({companies.length})
        </h2>
        {loading ? (
          <p className="text-slate-500 font-mono text-sm">Loading…</p>
        ) : error ? (
          <p className="text-red-400 font-mono text-sm">⚠ {error}</p>
        ) : companies.length === 0 ? (
          <p className="text-slate-600 font-mono text-sm">No companies yet. Create one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-left border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Domain</th>
                  <th className="pb-2 pr-4">Employees</th>
                  <th className="pb-2">Responses</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="py-2.5 pr-4 text-slate-200 font-bold">{c.name}</td>
                    <td className="py-2.5 pr-4 text-slate-500">{c.domain ?? '—'}</td>
                    <td className="py-2.5 pr-4">
                      <span className="text-cyan-400">{c.employee_count ?? 0}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="text-purple-400">{c.response_count ?? 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Invite Employee ──────────────────────────────── */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-slate-200 font-mono mb-2">Invite Employee</h2>
        <p className="text-slate-500 text-xs font-mono mb-5">
          Employee will receive a verification email to set their password and access Token Quest.
        </p>
        <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Employee Name</label>
            <input className={inputCls} value={invName} onChange={e => setInvName(e.target.value)}
              placeholder="Jane Smith" />
          </div>
          <div>
            <label className={labelCls}>Work Email</label>
            <input type="email" className={inputCls} value={invEmail}
              onChange={e => setInvEmail(e.target.value)} placeholder="jane@company.com" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Company</label>
            <select className={inputCls} value={invCompany} onChange={e => setInvCompany(e.target.value)}>
              <option value="">— Select a company —</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={inviting || !invEmail || !invName || !invCompany}
              className="w-full h-11 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm font-bold disabled:opacity-40 transition-colors">
              {inviting ? '📨 Sending invitation…' : '📨 Send Invitation Email'}
            </button>
          </div>
        </form>

        {invResult && (
          <div className={`mt-4 rounded-lg px-4 py-3 text-sm font-mono ${
            invResult.success ? 'bg-emerald-900/30 border border-emerald-700/40 text-emerald-300'
                              : 'bg-red-900/30 border border-red-700/40 text-red-300'
          }`}>
            {invResult.success ? (
              <>
                ✅ Invitation sent!
                {invResult.url && (
                  <div className="mt-1 text-xs text-slate-400 break-all">
                    Fallback link: <a href={invResult.url} target="_blank" rel="noreferrer"
                      className="text-cyan-400 hover:underline">{invResult.url}</a>
                  </div>
                )}
              </>
            ) : (
              <>⚠ {invResult.error}</>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
