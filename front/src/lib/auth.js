const AUTH_KEY = 'golden-eagle-auth-session'

export function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('golden-eagle-auth-change'))
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY)
  window.dispatchEvent(new Event('golden-eagle-auth-change'))
}

export function isLoggedIn() {
  return !!getSession()?.token
}

export function getCurrentUser() {
  return getSession()?.user || null
}

export function getAuthHeaders() {
  const session = getSession()
  if (session?.token) {
    return {
      'Authorization': `Bearer ${session.token}`,
      'Content-Type': 'application/json'
    }
  }
  return {
    'Content-Type': 'application/json'
  }
}

export async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Помилка входу')
  }

  saveSession(data)
  return data
}

export async function register(username, password) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Помилка реєстрації')
  }

  return data
}
