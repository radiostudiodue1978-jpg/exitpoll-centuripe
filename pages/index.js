import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f5f9',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 18,
          padding: '28px 24px',
          boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
          textAlign: 'center',
          width: '100%',
          maxWidth: 520,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#ffffff',
            margin: '0 auto 16px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(15,23,42,0.10)',
            overflow: 'hidden',
          }}
        >
          <img
            src="/logo.png"
            alt="Radio StudioDue"
            style={{
              width: '88%',
              height: '88%',
              objectFit: 'contain',
            }}
          />
        </div>

        <h1
          style={{
            margin: '0 0 8px 0',
            fontSize: 34,
            fontWeight: 900,
            color: '#1e3a8a',
          }}
        >
          Exit Poll
        </h1>

        <p
          style={{
            margin: '0 0 18px 0',
            fontSize: 18,
            fontWeight: 700,
            color: '#334155',
          }}
        >
          Elezioni Amministrative Centuripe 2026
        </p>

        <p
          style={{
            margin: 0,
            fontSize: 15,
            color: '#64748b',
            fontWeight: 700,
          }}
        >
          Reindirizzamento alla pagina di accesso...
        </p>
      </div>
    </div>
  )
}