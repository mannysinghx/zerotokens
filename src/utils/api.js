/**
 * src/utils/api.js
 * Frontend HTTP client for all Neon database + auth operations.
 * All DB work goes through /api serverless functions — the browser
 * never touches the database directly.
 */

const BASE = '/api'

async function request(path, options = {}) {
  const { headers: extraHeaders = {}, ...rest } = options
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    ...rest,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

function adminHeaders(password) {
  return { 'x-admin-password': password }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/** Register a new individual user. Returns { message } — no session until email is verified. */
export async function apiRegister(username, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body:   JSON.stringify({ username, email, password }),
  })
}

/** Log in with email + password. Returns { user, sessionToken }. */
export async function apiLogin(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  })
}

/** Invalidate the current session. */
export async function apiLogout(sessionToken) {
  return request('/auth/logout', {
    method:  'POST',
    headers: authHeaders(sessionToken),
  })
}

/** Validate a session token and return the current user. */
export async function apiMe(sessionToken) {
  return request('/auth/me', { headers: authHeaders(sessionToken) })
}

// ── Game progress ─────────────────────────────────────────────────────────────

/** Persist the full game state JSON to the server for the logged-in user. */
export async function apiSaveProgress(sessionToken, gameState) {
  return request('/game/progress', {
    method:  'POST',
    headers: authHeaders(sessionToken),
    body:    JSON.stringify({ gameState }),
  })
}

// ── Assignment ────────────────────────────────────────────────────────────────

/** Fetch the active field assignment for the logged-in user. */
export async function fetchAssignment(sessionToken) {
  return request('/employees/assignment', { headers: authHeaders(sessionToken) })
}

// ── Questions ─────────────────────────────────────────────────────────────────

/** Fetch `count` randomly-shuffled field questions for a category. */
export async function fetchFieldQuestions(categoryId, count = 15) {
  return request(`/questions/field?categoryId=${encodeURIComponent(categoryId)}&count=${count}`)
}

// ── Responses (field training) ────────────────────────────────────────────────

/** Save a completed question response (auth required). */
export async function saveResponse(sessionToken, payload) {
  return request('/responses/save', {
    method:  'POST',
    headers: authHeaders(sessionToken),
    body:    JSON.stringify(payload),
  })
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function adminFetchStats(password) {
  return request('/admin/stats', { headers: adminHeaders(password) })
}

export async function adminFetchEmployees(password) {
  return request('/admin/employees', { headers: adminHeaders(password) })
}

export async function adminAssignEmployee(password, { userId, categoryId, subFunction, role }) {
  return request('/admin/assign', {
    method:  'POST',
    headers: adminHeaders(password),
    body:    JSON.stringify({ userId, categoryId, subFunction, role }),
  })
}

export async function adminFetchResponses(password, { userId, categoryId, limit } = {}) {
  const params = new URLSearchParams()
  if (userId)     params.set('userId',     userId)
  if (categoryId) params.set('categoryId', categoryId)
  if (limit)      params.set('limit',      limit)
  return request(`/admin/responses?${params}`, { headers: adminHeaders(password) })
}

export async function adminFetchCompanies(password) {
  return request('/admin/companies', { headers: adminHeaders(password) })
}

export async function adminCreateCompany(password, { name, domain = null }) {
  return request('/admin/companies', {
    method:  'POST',
    headers: adminHeaders(password),
    body:    JSON.stringify({ name, domain }),
  })
}

export async function adminInviteEmployee(password, { email, username, companyId }) {
  return request('/admin/invite', {
    method:  'POST',
    headers: adminHeaders(password),
    body:    JSON.stringify({ email, username, companyId }),
  })
}

export async function adminFetchIndividuals(password) {
  return request('/admin/individuals', { headers: adminHeaders(password) })
}

export async function adminManageUser(password, { userId, action, newPassword }) {
  return request('/admin/user-manage', {
    method:  'PATCH',
    headers: adminHeaders(password),
    body:    JSON.stringify({ userId, action, newPassword }),
  })
}

// ── Company Admin ─────────────────────────────────────────────────────────────

function coAdminHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export async function coAdminMe(token) {
  return request('/company-admin/me', { headers: coAdminHeaders(token) })
}

export async function coAdminFetchEmployees(token) {
  return request('/company-admin/employees', { headers: coAdminHeaders(token) })
}

export async function coAdminInviteEmployee(token, { email, username }) {
  return request('/company-admin/invite', {
    method: 'POST',
    headers: coAdminHeaders(token),
    body:   JSON.stringify({ email, username }),
  })
}

export async function coAdminManageUser(token, { userId, action, newPassword }) {
  return request('/company-admin/user-manage', {
    method:  'PATCH',
    headers: coAdminHeaders(token),
    body:    JSON.stringify({ userId, action, newPassword }),
  })
}

// ── Legacy (kept for backward compat, no-op on server) ───────────────────────
export async function upsertEmployee() {
  return { success: true }
}
