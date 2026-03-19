export const USERS = {
  admin: {
    password: 'Admin_2026!',
    role: 'admin',
  },
  tablet1: {
    password: 'Tablet1_2026!',
    role: 'tablet',
  },
  tablet2: {
    password: 'Tablet2_2026!',
    role: 'tablet',
  },
}

const STORAGE_KEY = 'exitpoll_auth'

export function loginUser(username, password) {
  const user = USERS[username]

  if (!user) {
    return { ok: false, message: 'Utente non trovato' }
  }

  if (user.password !== password) {
    return { ok: false, message: 'Password non corretta' }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        username,
        role: user.role,
        loggedAt: Date.now(),
      })
    )
  }

  return {
    ok: true,
    role: user.role,
    username,
  }
}

export function getAuth() {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch (error) {
    return null
  }
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function isAllowed(pathname, auth) {
  if (!auth) return false

  if (pathname.startsWith('/admin')) {
    return auth.role === 'admin'
  }

  if (pathname.startsWith('/tablet')) {
    return auth.role === 'tablet'
  }

  if (pathname.startsWith('/login')) {
    return true
  }

  return false
}