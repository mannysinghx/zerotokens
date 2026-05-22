/**
 * src/utils/api.js
 * Frontend HTTP client for all Neon database operations.
 * All DB work goes through /api serverless functions — the browser
 * never touches the database directly.
 */

const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data
}

// ── Employee ──────────────────────────────────────────────────────────────────

/**
 * Sync a localStorage save to the employees table.
 * @param {{ id: string, username: string, team?: string, company?: string }} save
 */
export async function upsertEmployee(save) {
  return request('/employees/upsert', {
    method: 'POST',
    body: JSON.stringify({
      id:       save.employeeId,
      username: save.username,
      team:     save.team    ?? null,
      company:  save.company ?? null,
    }),
  })
}

/**
 * Fetch the active assignment for an employee.
 * @param {string} employeeId
 * @returns {{ assignment: object|null }}
 */
export async function fetchAssignment(employeeId) {
  return request(`/employees/assignment?employeeId=${encodeURIComponent(employeeId)}`)
}

// ── Questions ─────────────────────────────────────────────────────────────────

/**
 * Fetch `count` randomly-shuffled field questions for a category.
 * @param {string} categoryId
 * @param {number} [count=15]
 * @returns {{ questions: object[] }}
 */
export async function fetchFieldQuestions(categoryId, count = 15) {
  return request(`/questions/field?categoryId=${encodeURIComponent(categoryId)}&count=${count}`)
}

// ── Responses ─────────────────────────────────────────────────────────────────

/**
 * Save a completed question response.
 * @param {{
 *   employeeId: string, questionId: string, categoryId: string,
 *   userAnswer: string, correctAnswer: string, isCorrect: boolean,
 *   totalScore: number, grade: string, tokensSaved: number
 * }} payload
 */
export async function saveResponse(payload) {
  return request('/responses/save', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ── Admin (requires password header) ─────────────────────────────────────────

function adminHeaders(password) {
  return { 'x-admin-password': password }
}

export async function adminFetchEmployees(password) {
  return request('/admin/employees', { headers: adminHeaders(password) })
}

export async function adminAssignEmployee(password, { employeeId, categoryId, subFunction, role }) {
  return request('/admin/assign', {
    method:  'POST',
    headers: adminHeaders(password),
    body:    JSON.stringify({ employeeId, categoryId, subFunction, role }),
  })
}

export async function adminFetchResponses(password, { employeeId, categoryId, limit } = {}) {
  const params = new URLSearchParams()
  if (employeeId) params.set('employeeId', employeeId)
  if (categoryId) params.set('categoryId', categoryId)
  if (limit)      params.set('limit',      limit)
  return request(`/admin/responses?${params}`, { headers: adminHeaders(password) })
}

export async function adminFetchStats(password) {
  return request('/admin/stats', { headers: adminHeaders(password) })
}
