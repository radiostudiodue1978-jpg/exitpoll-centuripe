import { useState } from 'react'
import { useRouter } from 'next/router'

const API_BASE = 'https://exitpoll-worker.francesco-statello88.workers.dev'

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#eef2f7',
    fontFamily: 'Arial, sans-serif',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'white',
    borderRadius: 18,
    padding: 24,
    boxShadow: '0 12px 30px rgba(15,23,42,0.10)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 18,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'white',
    margin: '0 auto 12px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 14px rgba(15,23,42,0.08)',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  logo: {
    width: '88%',
    height: '88%',
    objectFit: 'contain',
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 900,
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 6,
    color: '#475569',
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1.35,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontWeight: 700,
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid #cbd5e1',
    fontSize: 16,
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 12,
    border: 'none',
    background: '#2563eb',
    color: 'white',
    fontWeight: 900,
    fontSize: 17,
    cursor: 'pointer',
    marginTop: 4,
  },
  error: {
    marginTop: 12,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: 10,
    borderRadius: 10,
    fontWeight: 700,
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
  },
}

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setErrorMsg('')

    const cleanUsername = username.trim()
    const cleanPassword = password.trim()

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Inserisci username e password')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result?.ok || !result?.user) {
        setErrorMsg(result?.error || 'Credenziali non valide')
        setLoading(false)
        return
      }

      const authPayload = {
        id: result.user.id,
        username: result.user.username,
        role: result.user.role,
        access: result.user.access,
      }

      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('auth', JSON.stringify(authPayload))

      setLoading(false)

      if (result.user.access === 'admin') {
        router.push('/admin')
        return
      }

      if (result.user.access === 'tablet1' || result.user.access === 'tablet2') {
        router.push('/tablet')
        return
      }

      setErrorMsg('Accesso non riconosciuto')
    } catch (err) {
      console.error('Eccezione login:', err)
      setLoading(false)
      setErrorMsg('Errore caricamento')
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoWrap}>
            <img src="/logo.png" alt="Radio StudioDue" style={styles.logo} />
          </div>
          <h1 style={styles.title}>Exit Poll</h1>
          <div style={styles.subtitle}>Elezioni Amministrative Centuripe 2026</div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        {errorMsg ? <div style={styles.error}>{errorMsg}</div> : null}
      </div>
    </div>
  )
}