import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    const publicPages = ['/login']
    const path = router.pathname

    if (!publicPages.includes(path)) {
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      if (!isLoggedIn) {
        router.replace('/login')
      }
    }
  }, [router])

  return <Component {...pageProps} />
}