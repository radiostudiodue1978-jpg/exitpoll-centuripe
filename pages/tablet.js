import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const TABLET_TARGETS = {
  tablet1: {
    total: 230,
    gender: { M: 115, F: 115 },
    age: { '18-29': 34, '30-44': 57, '45-64': 80, '65+': 59 },
    slots: {
      sun_09_12: 34,
      sun_12_15: 34,
      sun_15_19: 51,
      sun_19_23: 51,
      mon_07_09: 24,
      mon_09_12: 36,
    },
  },
  tablet2: {
    total: 120,
    gender: { M: 60, F: 60 },
    age: { '18-29': 18, '30-44': 30, '45-64': 42, '65+': 30 },
    slots: {
      sun_09_12: 18,
      sun_12_15: 18,
      sun_15_19: 27,
      sun_19_23: 27,
      mon_07_09: 12,
      mon_09_12: 18,
    },
  },
}

const SLOT_LABELS = {
  sun_09_12: 'Dom 09-12',
  sun_12_15: 'Dom 12-15',
  sun_15_19: 'Dom 15-19',
  sun_19_23: 'Dom 19-23',
  mon_07_09: 'Lun 07-09',
  mon_09_12: 'Lun 09-12',
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#edf2f7',
    fontFamily: 'Arial, sans-serif',
    color: '#0f172a',
    padding: 10,
    boxSizing: 'border-box',
  },
  shell: { maxWidth: 1080, margin: '0 auto' },

  header: {
    background: 'linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 100%)',
    color: 'white',
    borderRadius: 14,
    padding: '10px 14px',
    marginBottom: 12,
    boxShadow: '0 8px 18px rgba(15,23,42,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
    flex: 1,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
    flexShrink: 0,
  },
  logo: { width: '88%', height: '88%', objectFit: 'contain' },
  headerTextWrap: { minWidth: 0 },
  title: {
    margin: 0,
    fontSize: 'clamp(20px, 2.2vw, 28px)',
    fontWeight: 900,
    lineHeight: 1.05,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 'clamp(11px, 1.2vw, 15px)',
    fontWeight: 700,
    lineHeight: 1.1,
    opacity: 0.98,
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  userTag: {
    background: 'rgba(255,255,255,0.16)',
    borderRadius: 10,
    padding: '7px 10px',
    fontSize: 13,
    fontWeight: 700,
  },
  logoutBtn: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    padding: '8px 12px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  homeTopGrid: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 1fr 1fr',
    gap: 10,
    marginBottom: 10,
  },
  compactTopGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.3fr',
    gap: 10,
    marginBottom: 10,
  },

  totalCard: {
    background: 'linear-gradient(180deg, #1d4ed8 0%, #1e3a8a 100%)',
    color: 'white',
    borderRadius: 16,
    padding: 14,
    textAlign: 'center',
    boxShadow: '0 8px 18px rgba(15,23,42,0.12)',
  },
  totalIcon: { fontSize: 22, marginBottom: 4 },
  totalLabel: { fontSize: 13, fontWeight: 700, marginBottom: 6, opacity: 0.95 },
  totalValue: { fontSize: 'clamp(30px, 3.5vw, 42px)', fontWeight: 900, lineHeight: 1 },

  statCard: {
    background: 'white',
    borderRadius: 14,
    padding: 12,
    textAlign: 'center',
    border: '1px solid #dbe4f0',
    boxShadow: '0 6px 14px rgba(15,23,42,0.06)',
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statLabel: { fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 },
  statValue: { fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 900, lineHeight: 1 },
  statSub: { marginTop: 5, fontSize: 11, color: '#64748b', fontWeight: 700 },

  section: {
    background: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    boxShadow: '0 6px 16px rgba(15,23,42,0.06)',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 'clamp(18px, 1.8vw, 24px)',
    fontWeight: 900,
    margin: '0 0 10px 0',
    color: '#173c72',
  },
  helper: {
    textAlign: 'center',
    fontSize: 14,
    color: '#475569',
    marginBottom: 10,
    fontWeight: 700,
    lineHeight: 1.35,
  },

  compactGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  compactGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 8,
  },
  compactCard: {
    background: '#fff',
    border: '1px solid #dbe4f0',
    borderRadius: 12,
    padding: 8,
    textAlign: 'center',
    minHeight: 76,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  compactEmoji: { fontSize: 15, marginBottom: 2 },
  compactLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 1.15,
  },
  compactValue: {
    fontSize: 'clamp(18px, 2vw, 26px)',
    fontWeight: 900,
    lineHeight: 1,
  },

 slotsGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
  gap: 6,
},
slotCard: {
  borderRadius: 10,
  padding: 6,
  textAlign: 'center',
  color: 'white',
  boxShadow: '0 6px 14px rgba(15,23,42,0.08)',
},
slotLabel: {
  fontSize: 10,
  fontWeight: 800,
  marginBottom: 2,
},
slotValue: {
  fontSize: 18,
  fontWeight: 900,
  lineHeight: 1,
  marginBottom: 1,
},
slotBigText: {
  fontSize: 9,
  fontWeight: 800,
  marginBottom: 1,
},
slotSub: {
  fontSize: 9,
  fontWeight: 700,
  opacity: 0.96,
},
  bigStartBtn: {
    width: '100%',
    padding: '15px 20px',
    border: 'none',
    borderRadius: 14,
    background: 'linear-gradient(180deg, #65a30d 0%, #4d7c0f 100%)',
    color: 'white',
    fontWeight: 900,
    fontSize: 'clamp(22px, 2.1vw, 28px)',
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(101,163,13,0.25)',
  },

  footerButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  cancelBtn: {
    minWidth: 130,
    padding: '12px 18px',
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(180deg, #e5e7eb 0%, #cbd5e1 100%)',
    color: '#0f172a',
    fontWeight: 800,
    fontSize: 16,
    cursor: 'pointer',
  },
  saveBtn: {
    minWidth: 200,
    padding: '14px 20px',
    border: 'none',
    borderRadius: 12,
    background: 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)',
    color: 'white',
    fontWeight: 900,
    fontSize: 20,
    cursor: 'pointer',
  },
  secondaryActionBtn: {
    minWidth: 220,
    padding: '12px 18px',
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(180deg, #0f766e 0%, #115e59 100%)',
    color: 'white',
    fontWeight: 800,
    fontSize: 16,
    cursor: 'pointer',
  },
  nextBtn: {
    minWidth: 160,
    padding: '12px 18px',
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(180deg, #65a30d 0%, #4d7c0f 100%)',
    color: 'white',
    fontWeight: 800,
    fontSize: 18,
    cursor: 'pointer',
  },

  optionGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
  },
  optionGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  optionBtn: {
    minHeight: 84,
    borderRadius: 12,
    border: '2px solid #cbd5e1',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    color: '#1e3a8a',
    fontWeight: 900,
    fontSize: 'clamp(18px, 1.8vw, 28px)',
    cursor: 'pointer',
    padding: '10px 12px',
  },

  genderCard: {
    minHeight: 130,
    borderRadius: 14,
    border: 'none',
    color: 'white',
    fontWeight: 900,
    fontSize: 'clamp(22px, 2vw, 28px)',
    cursor: 'pointer',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 8px 16px rgba(15,23,42,0.12)',
  },
  genderIcon: { fontSize: 48, lineHeight: 1 },

  mayorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 14,
  },
  mayorCard: {
    borderRadius: 16,
    border: '2px solid #cbd5e1',
    background: '#ffffff',
    padding: 12,
    cursor: 'pointer',
    boxShadow: '0 6px 14px rgba(15,23,42,0.06)',
  },
  mayorImageBox: {
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mayorImage: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  cardLabelBar: {
    background: 'linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 100%)',
    color: 'white',
    borderRadius: 10,
    padding: '10px 12px',
    textAlign: 'center',
    fontWeight: 900,
    fontSize: 'clamp(18px, 1.8vw, 24px)',
  },

  specialGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    marginTop: 14,
  },
  specialCard: {
    minHeight: 96,
    borderRadius: 14,
    border: '2px dashed #cbd5e1',
    background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    color: '#0f172a',
    fontWeight: 900,
    fontSize: 'clamp(20px, 1.8vw, 24px)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '10px 12px',
  },

  listGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  listCard: {
    borderRadius: 16,
    border: '2px solid #cbd5e1',
    background: '#ffffff',
    padding: 16,
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(15,23,42,0.08)',
  },
  listCircle: {
    width: 190,
    height: 190,
    borderRadius: '50%',
    margin: '0 auto 12px auto',
    border: '4px solid #1d4ed8',
    background: 'white',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 14px rgba(15,23,42,0.10)',
  },
  listImage: { width: '100%', height: '100%', objectFit: 'contain' },

  councillorGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  councillorColTitle: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: 'clamp(20px, 1.8vw, 26px)',
    marginBottom: 10,
    color: '#1e3a8a',
  },
  councillorBtn: {
    width: '100%',
    minHeight: 68,
    borderRadius: 12,
    border: '2px solid #cbd5e1',
    background: '#ffffff',
    fontWeight: 800,
    fontSize: 'clamp(16px, 1.4vw, 20px)',
    cursor: 'pointer',
    padding: '10px 12px',
    marginBottom: 8,
  },
  groupCard: {
    border: '1px solid #dbe4f0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    background: '#fafcff',
  },
  groupTitle: {
    fontWeight: 900,
    fontSize: 20,
    color: '#1e3a8a',
    marginBottom: 10,
    textAlign: 'center',
  },

  selectedBox: {
    background: '#ecfdf5',
    border: '1px solid #86efac',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    textAlign: 'center',
    fontWeight: 700,
  },
  errorBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    fontWeight: 700,
    textAlign: 'center',
  },
  infoBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    background: '#ecfeff',
    border: '1px solid #a5f3fc',
    color: '#0f172a',
    fontWeight: 700,
    textAlign: 'center',
  },

  successWrap: {
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCard: {
    background: 'white',
    borderRadius: 22,
    padding: '30px 24px',
    width: '100%',
    maxWidth: 760,
    boxShadow: '0 12px 28px rgba(15,23,42,0.10)',
    textAlign: 'center',
  },
  successIcon: { fontSize: 64, lineHeight: 1, marginBottom: 12 },
  successTitle: {
    fontSize: 'clamp(28px, 2.8vw, 42px)',
    fontWeight: 900,
    color: '#15803d',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 'clamp(22px, 2vw, 30px)',
    fontWeight: 900,
    marginBottom: 12,
  },
  successText: {
    color: '#475569',
    fontSize: 'clamp(14px, 1.4vw, 18px)',
    marginBottom: 18,
    fontWeight: 700,
  },
}

function mapStoredAgeToQuota(age) {
  if (!age) return null
  if (age === '18-29') return '18-29'
  if (age === '30-44') return '30-44'
  if (age === '45-64') return '45-64'
  if (age === '65+') return '65+'
  if (age === '18-24' || age === '25-34') return '18-29'
  if (age === '35-49') return '30-44'
  if (age === '50-64') return '45-64'
  return null
}

function classifyTimeSlot(createdAt) {
  if (!createdAt) return null
  const d = new Date(createdAt)
  const day = d.getDay()
  const hour = d.getHours()

  if (day === 0) {
    if (hour >= 9 && hour < 12) return 'sun_09_12'
    if (hour >= 12 && hour < 15) return 'sun_12_15'
    if (hour >= 15 && hour < 19) return 'sun_15_19'
    if (hour >= 19 && hour < 23) return 'sun_19_23'
  }

  if (day === 1) {
    if (hour >= 7 && hour < 9) return 'mon_07_09'
    if (hour >= 9 && hour < 12) return 'mon_09_12'
  }

  return null
}

function getSlotColor(done, target) {
  const ratio = target > 0 ? done / target : 0
  if (ratio >= 1) return 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)'
  if (ratio >= 0.6) return 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
  return 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)'
}

function Header({ authUser, onLogout }) {
  return (
    <div style={styles.header}>
      <div style={styles.headerLeft}>
        <div style={styles.logoWrap}>
          <img src="/logo.png" alt="Radio StudioDue" style={styles.logo} />
        </div>
        <div style={styles.headerTextWrap}>
          <h1 style={styles.title}>Exit Poll</h1>
          <div style={styles.subtitle}>Elezioni Amministrative Centuripe 2026</div>
        </div>
      </div>
      <div style={styles.headerRight}>
        <div style={styles.userTag}>Utente: {authUser ? authUser.username : '-'}</div>
        <button onClick={onLogout} style={styles.logoutBtn}>Esci</button>
      </div>
    </div>
  )
}

function SafeImage({ src, alt, style, fallbackStyle }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <div style={fallbackStyle}>{alt}</div>
  return <img src={src} alt={alt} style={style} onError={() => setFailed(true)} />
}

export default function Tablet() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const [tabletKey, setTabletKey] = useState('tablet1')
  const [step, setStep] = useState(0)
  const [stats, setStats] = useState({
    totalGlobal: 0,
    inProgress: 0,
    tabletCount: 0,
    genderDone: { M: 0, F: 0 },
    ageDone: { '18-29': 0, '30-44': 0, '45-64': 0, '65+': 0 },
    slotDone: {
      sun_09_12: 0,
      sun_12_15: 0,
      sun_15_19: 0,
      sun_19_23: 0,
      mon_07_09: 0,
      mon_09_12: 0,
    },
  })
  const [mayors, setMayors] = useState([])
  const [lists, setLists] = useState([])
  const [councilCandidates, setCouncilCandidates] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [data, setData] = useState({
    tablet: 'tablet1',
    eta: '',
    sesso: '',
    titolo_studio: '',
    sindaco: '',
    lista: '',
    lista_id: '',
    consigliere1: '',
    consigliere2: '',
  })

  useEffect(() => {
    let auth = null
    try {
      auth = JSON.parse(localStorage.getItem('auth'))
    } catch (e) {
      auth = null
    }

    if (!auth) {
      router.replace('/login')
      return
    }

    if (auth.access !== 'tablet1' && auth.access !== 'tablet2') {
      router.replace('/login')
      return
    }

    setAuthUser(auth)
    setTabletKey(auth.access)
    setData((prev) => ({ ...prev, tablet: auth.access }))
    setAuthReady(true)
  }, [router])

  useEffect(() => {
    if (!authReady) return
    loadConfig()
    loadStats()
  }, [authReady, tabletKey])

  useEffect(() => {
    if (step === 8) {
      playSuccessSound()
      const timer = setTimeout(() => resetToHome(), 4000)
      return () => clearTimeout(timer)
    }
  }, [step])

  async function loadConfig() {
    const [{ data: mayorsData }, { data: listsData }, { data: councilData }] = await Promise.all([
      supabase.from('mayor_candidates').select('*').eq('attivo', true).order('ordine', { ascending: true }),
      supabase.from('election_lists').select('*').eq('attivo', true).order('ordine', { ascending: true }),
      supabase.from('council_candidates').select('*').eq('attivo', true).order('ordine', { ascending: true }),
    ])

    setMayors(mayorsData || [])
    setLists(listsData || [])
    setCouncilCandidates(councilData || [])
  }

  async function loadStats() {
    const { data: rows } = await supabase.from('interviews').select('eta, sesso, tablet, created_at')
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()

    const { data: sessions } = await supabase
      .from('interview_sessions')
      .select('id')
      .eq('stato', 'in_corso')
      .eq('tablet', tabletKey)
      .gte('started_at', twoMinutesAgo)

    const tabletRows = (rows || []).filter((r) => r.tablet === tabletKey)
    const ageDone = { '18-29': 0, '30-44': 0, '45-64': 0, '65+': 0 }
    const slotDone = {
      sun_09_12: 0,
      sun_12_15: 0,
      sun_15_19: 0,
      sun_19_23: 0,
      mon_07_09: 0,
      mon_09_12: 0,
    }

    tabletRows.forEach((r) => {
      const mapped = mapStoredAgeToQuota(r.eta)
      if (mapped) ageDone[mapped] += 1

      const slotKey = classifyTimeSlot(r.created_at)
      if (slotKey) slotDone[slotKey] += 1
    })

    setStats({
      totalGlobal: (rows || []).length,
      inProgress: (sessions || []).length,
      tabletCount: tabletRows.length,
      genderDone: {
        M: tabletRows.filter((r) => r.sesso === 'Uomo').length,
        F: tabletRows.filter((r) => r.sesso === 'Donna').length,
      },
      ageDone,
      slotDone,
    })
  }

  function playSuccessSound() {
    try {
      const audio = new Audio('/success.mp3')
      audio.play().catch(() => {})
    } catch (e) {}
  }

  function handleLogout() {
    localStorage.removeItem('auth')
    router.replace('/login')
  }

  async function startInterview() {
    setMessage('')
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .insert([{ tablet: tabletKey, stato: 'in_corso' }])
      .select()
      .single()

    if (error) {
      setMessage('Errore avvio intervista: ' + error.message)
      return
    }

    setCurrentSessionId(session.id)
    await loadStats()
    setStep(1)
  }

  async function closeSession(status = 'annullata') {
    if (currentSessionId) {
      await supabase.from('interview_sessions').update({ stato: status }).eq('id', currentSessionId)
    }
  }

  async function cancelInterview() {
    await closeSession('annullata')
    resetToHome()
  }

  function resetToHome() {
    setCurrentSessionId(null)
    setSaving(false)
    setMessage('')
    setStep(0)
    setData({
      tablet: tabletKey,
      eta: '',
      sesso: '',
      titolo_studio: '',
      sindaco: '',
      lista: '',
      lista_id: '',
      consigliere1: '',
      consigliere2: '',
    })
    loadStats()
  }

  function next(field, value) {
    setData((prev) => ({ ...prev, [field]: value }))
    setStep((prev) => prev + 1)
  }

  function getMayorById(id) {
    return mayors.find((m) => String(m.id) === String(id)) || null
  }

  function getListById(id) {
    return lists.find((l) => String(l.id) === String(id)) || null
  }

  function getCandidateByName(name) {
    return councilCandidates.find((c) => c.nome === name) || null
  }

  function getCandidateListId(candidate) {
    return candidate ? String(candidate.lista_id || '') : ''
  }

  function findLinkedMayorNameForList(listObj) {
    if (!listObj) return ''

    const mayorIdFields = ['mayor_id', 'sindaco_id', 'candidate_mayor_id', 'candidato_sindaco_id']
    for (const field of mayorIdFields) {
      if (listObj[field]) {
        const mayor = getMayorById(listObj[field])
        if (mayor?.nome) return mayor.nome
      }
    }

    const mayorNameFields = ['mayor_name', 'sindaco_nome', 'candidato_sindaco', 'linked_mayor_name', 'collegato_sindaco']
    for (const field of mayorNameFields) {
      if (listObj[field]) return String(listObj[field])
    }

    return ''
  }

  async function saveWhiteBallot() {
    setSaving(true)
    setMessage('')

    const { error } = await supabase.from('interviews').insert([
      {
        tablet: tabletKey,
        eta: data.eta,
        sesso: data.sesso,
        titolo_studio: data.titolo_studio,
        sindaco: 'Scheda bianca',
        lista: 'Scheda bianca',
        consigliere1: 'Nessuno',
        consigliere2: 'Nessuno',
      },
    ])

    setSaving(false)
    if (error) {
      setMessage('Errore salvataggio: ' + error.message)
      return
    }

    await closeSession('completata')
    setCurrentSessionId(null)
    setStep(8)
    await loadStats()
  }

  function handleMayorChoice(name) {
    if (name === 'Scheda bianca') {
      setData((prev) => ({ ...prev, sindaco: 'Scheda bianca' }))
      saveWhiteBallot()
      return
    }

    next('sindaco', name)
  }

  function handleListChoice(listObj) {
    setData((prev) => ({
      ...prev,
      lista: listObj.nome,
      lista_id: String(listObj.id),
      consigliere1: '',
      consigliere2: '',
    }))
    setStep(6)
  }

  function handleListNoAnswer() {
    setData((prev) => ({
      ...prev,
      lista: 'Non si esprime',
      lista_id: '',
      consigliere1: '',
      consigliere2: '',
    }))
    setStep(6)
  }

  function toggleCouncillor(name) {
    if (data.consigliere1 === name) {
      setData((prev) => ({ ...prev, consigliere1: '' }))
      return
    }

    if (data.consigliere2 === name) {
      setData((prev) => ({ ...prev, consigliere2: '' }))
      return
    }

    if (!data.consigliere1) {
      setData((prev) => ({ ...prev, consigliere1: name }))
      return
    }

    if (!data.consigliere2) {
      setData((prev) => ({ ...prev, consigliere2: name }))
    }
  }

  function getSelectedCandidates() {
    return [data.consigliere1, data.consigliere2]
      .filter(Boolean)
      .map((name) => getCandidateByName(name))
      .filter(Boolean)
  }

  function resolveDerivedList() {
    if (data.lista_id) {
      const fixedList = getListById(data.lista_id)
      return fixedList ? { id: String(fixedList.id), nome: fixedList.nome, obj: fixedList } : null
    }

    const selected = getSelectedCandidates()
    if (!selected.length) return null

    const firstListId = getCandidateListId(selected[0])
    if (!firstListId) return null

    const listObj = getListById(firstListId)
    if (!listObj) return null

    return { id: String(listObj.id), nome: listObj.nome, obj: listObj }
  }

  function validationMessage() {
    const selected = getSelectedCandidates()

    if (selected.length === 2) {
      const listIds = [...new Set(selected.map((c) => getCandidateListId(c)).filter(Boolean))]
      if (listIds.length > 1) return 'I due consiglieri devono appartenere alla stessa lista.'
      if (selected[0].genere === selected[1].genere) return 'Se scegli 2 consiglieri, devono essere uno uomo e una donna.'
    }

    if (data.lista_id && selected.length) {
      const invalid = selected.some((c) => String(c.lista_id) !== String(data.lista_id))
      if (invalid) return 'I consiglieri scelti devono appartenere alla lista selezionata.'
    }

    return ''
  }

  function canSave() {
    return !validationMessage()
  }

  async function saveInterview() {
    const problem = validationMessage()
    if (problem) {
      setMessage(problem)
      return
    }

    const derivedList = resolveDerivedList()
    const linkedMayor = derivedList ? findLinkedMayorNameForList(derivedList.obj) : ''

    let finalMayor = data.sindaco
    let finalList = data.lista

    if (derivedList) {
      finalList = derivedList.nome
      if (!finalMayor || finalMayor === 'Non si esprime') {
        finalMayor = linkedMayor || 'Non si esprime'
      }
    }

    if (!finalMayor) finalMayor = 'Non si esprime'
    if (!finalList) finalList = data.lista || 'Non si esprime'

    setSaving(true)
    setMessage('')

    const { error } = await supabase.from('interviews').insert([
      {
        tablet: tabletKey,
        eta: data.eta,
        sesso: data.sesso,
        titolo_studio: data.titolo_studio,
        sindaco: finalMayor,
        lista: finalList,
        consigliere1: data.consigliere1 || 'Nessuno',
        consigliere2: data.consigliere2 || 'Nessuno',
      },
    ])

    setSaving(false)
    if (error) {
      setMessage('Errore salvataggio: ' + error.message)
      return
    }

    await closeSession('completata')
    setCurrentSessionId(null)
    setStep(8)
    await loadStats()
  }

  const tabletTargets = TABLET_TARGETS[tabletKey]
  const tabletMissing = Math.max(tabletTargets.total - stats.tabletCount - stats.inProgress, 0)

  const genderMissing = {
    M: Math.max(tabletTargets.gender.M - stats.genderDone.M, 0),
    F: Math.max(tabletTargets.gender.F - stats.genderDone.F, 0),
  }

  const ageMissing = useMemo(
    () => ({
      '18-29': Math.max(tabletTargets.age['18-29'] - stats.ageDone['18-29'], 0),
      '30-44': Math.max(tabletTargets.age['30-44'] - stats.ageDone['30-44'], 0),
      '45-64': Math.max(tabletTargets.age['45-64'] - stats.ageDone['45-64'], 0),
      '65+': Math.max(tabletTargets.age['65+'] - stats.ageDone['65+'], 0),
    }),
    [stats.ageDone, tabletTargets.age]
  )

  const listChosen = data.lista_id ? getListById(data.lista_id) : null

  const groupedCouncillors = useMemo(() => {
    if (listChosen) {
      return [
        {
          id: String(listChosen.id),
          nome: listChosen.nome,
          items: councilCandidates.filter((c) => String(c.lista_id) === String(listChosen.id)),
        },
      ]
    }

    const map = {}
    councilCandidates.forEach((c) => {
      const key = String(c.lista_id || '')
      if (!map[key]) {
        const listObj = getListById(key)
        map[key] = { id: key, nome: listObj?.nome || 'Lista', items: [] }
      }
      map[key].items.push(c)
    })
    return Object.values(map)
  }, [councilCandidates, listChosen, lists])

  function wrap(content) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <Header authUser={authUser} onLogout={handleLogout} />
          {content}
        </div>
      </div>
    )
  }

  if (!authReady) return null
  if (step === 0) {
    return wrap(
      <>
        <div style={styles.homeTopGrid}>
          <div style={styles.totalCard}>
            <div style={styles.totalIcon}>📊</div>
            <div style={styles.totalLabel}>Totale generale raccolto</div>
            <div style={styles.totalValue}>{stats.totalGlobal}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏳</div>
            <div style={styles.statLabel}>In corso</div>
            <div style={styles.statValue}>{stats.inProgress}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎯</div>
            <div style={styles.statLabel}>Mancano a questo tablet</div>
            <div style={styles.statValue}>{tabletMissing}</div>
            <div style={styles.statSub}>{stats.tabletCount} / {tabletTargets.total}</div>
          </div>
        </div>

        <div style={styles.compactTopGrid}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Quote sesso mancanti</h2>
            <div style={styles.compactGrid2}>
              <div style={styles.compactCard}>
                <div style={styles.compactEmoji}>👨</div>
                <div style={styles.compactLabel}>Uomini</div>
                <div style={styles.compactValue}>{genderMissing.M}</div>
              </div>
              <div style={styles.compactCard}>
                <div style={styles.compactEmoji}>👩</div>
                <div style={styles.compactLabel}>Donne</div>
                <div style={styles.compactValue}>{genderMissing.F}</div>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Quote età mancanti</h2>
            <div style={styles.compactGrid4}>
              {Object.keys(tabletTargets.age).map((age) => (
                <div key={age} style={styles.compactCard}>
                  <div style={styles.compactEmoji}>🎂</div>
                  <div style={styles.compactLabel}>{age}</div>
                  <div style={styles.compactValue}>{ageMissing[age]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Fasce orarie mancanti</h2>
          <div style={styles.slotsGrid}>
            {Object.keys(tabletTargets.slots).map((key) => {
              const done = stats.slotDone[key]
              const target = tabletTargets.slots[key]
              const missing = Math.max(target - done, 0)

              return (
                <div key={key} style={{ ...styles.slotCard, background: getSlotColor(done, target) }}>
                  <div style={styles.slotLabel}>{SLOT_LABELS[key]}</div>
                  <div style={styles.slotValue}>{missing}</div>
                  <div style={styles.slotBigText}>mancanti</div>
                  <div style={styles.slotSub}>{done} / {target}</div>
                </div>
              )
            })}
          </div>
        </div>

        <button style={styles.bigStartBtn} onClick={startInterview}>INIZIA INTERVISTA</button>

        {message ? <div style={styles.infoBox}>{message}</div> : null}
      </>
    )
  }

  if (step === 1) {
    return wrap(
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Qual è la tua età?</h2>
        <div style={styles.optionGrid4}>
          <button style={styles.optionBtn} onClick={() => next('eta', '18-29')}>18-29</button>
          <button style={styles.optionBtn} onClick={() => next('eta', '30-44')}>30-44</button>
          <button style={styles.optionBtn} onClick={() => next('eta', '45-64')}>45-64</button>
          <button style={styles.optionBtn} onClick={() => next('eta', '65+')}>65+</button>
        </div>

        <div style={styles.footerButtons}>
          <button onClick={cancelInterview} style={styles.cancelBtn}>Annulla</button>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return wrap(
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Qual è il tuo sesso?</h2>
        <div style={styles.optionGrid2}>
          <button
            style={{ ...styles.genderCard, background: 'linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)' }}
            onClick={() => next('sesso', 'Uomo')}
          >
            <div style={styles.genderIcon}>👨</div>
            <div>Maschio</div>
          </button>

          <button
            style={{ ...styles.genderCard, background: 'linear-gradient(180deg, #f43f5e 0%, #be123c 100%)' }}
            onClick={() => next('sesso', 'Donna')}
          >
            <div style={styles.genderIcon}>👩</div>
            <div>Femmina</div>
          </button>
        </div>

        <div style={styles.footerButtons}>
          <button onClick={cancelInterview} style={styles.cancelBtn}>Annulla</button>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return wrap(
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Titolo di studio?</h2>
        <div style={styles.optionGrid2}>
          <button
            style={{
              ...styles.optionBtn,
              background: 'linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)',
              color: 'white',
              border: 'none',
            }}
            onClick={() => next('titolo_studio', 'Licenza media o inferiore')}
          >
            Licenza Media
          </button>

          <button
            style={{
              ...styles.optionBtn,
              background: 'linear-gradient(180deg, #fb923c 0%, #ea580c 100%)',
              color: 'white',
              border: 'none',
            }}
            onClick={() => next('titolo_studio', 'Diploma')}
          >
            Diploma
          </button>

          <button
            style={{
              ...styles.optionBtn,
              background: 'linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)',
              color: 'white',
              border: 'none',
            }}
            onClick={() => next('titolo_studio', 'Laurea o superiore')}
          >
            Laurea
          </button>

          <button
            style={{
              ...styles.optionBtn,
              background: 'linear-gradient(180deg, #f43f5e 0%, #be123c 100%)',
              color: 'white',
              border: 'none',
            }}
            onClick={() => next('titolo_studio', 'Altro')}
          >
            Altro
          </button>
        </div>

        <div style={styles.footerButtons}>
          <button onClick={cancelInterview} style={styles.cancelBtn}>Annulla</button>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return wrap(
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Candidati a Sindaco</h2>

        <div style={styles.mayorGrid}>
          {mayors.map((m) => (
            <button key={m.id} style={styles.mayorCard} onClick={() => handleMayorChoice(m.nome)}>
              <div style={styles.mayorImageBox}>
                <SafeImage
                  src={m.foto_url}
                  alt={m.nome}
                  style={styles.mayorImage}
                  fallbackStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: 12,
                    fontWeight: 800,
                    color: '#64748b',
                  }}
                />
              </div>
              <div style={styles.cardLabelBar}>{m.nome}</div>
            </button>
          ))}
        </div>

        <div style={styles.specialGrid}>
          <button style={styles.specialCard} onClick={() => handleMayorChoice('Scheda bianca')}>
            🗳️ Scheda bianca
          </button>

          <button style={styles.specialCard} onClick={() => handleMayorChoice('Non si esprime')}>
            ❓ Non si esprime
          </button>
        </div>

        {message ? <div style={styles.errorBox}>{message}</div> : null}

        <div style={styles.footerButtons}>
          <button onClick={cancelInterview} style={styles.cancelBtn}>Annulla</button>
        </div>
      </div>
    )
  }

  if (step === 5) {
    return wrap(
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Scegli la lista</h2>
        <div style={styles.helper}>
          Se non vuoi indicare la lista puoi premere “Non si esprime” e poi decidere se esprimere o no preferenze sui consiglieri.
        </div>

        <div style={styles.listGrid}>
          {lists.map((l) => (
            <button key={l.id} style={styles.listCard} onClick={() => handleListChoice(l)}>
              <div style={styles.listCircle}>
                <SafeImage
                  src={l.simbolo_url}
                  alt={l.nome}
                  style={styles.listImage}
                  fallbackStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: 12,
                    fontWeight: 800,
                    color: '#64748b',
                  }}
                />
              </div>
              <div style={styles.cardLabelBar}>{l.nome}</div>
            </button>
          ))}
        </div>

        <div style={styles.specialGrid}>
          <button style={styles.specialCard} onClick={handleListNoAnswer}>
            ❓ Non si esprime
          </button>

          <button style={styles.specialCard} onClick={() => setStep(6)}>
            ➡️ Vai ai consiglieri
          </button>
        </div>

        <div style={styles.footerButtons}>
          <button onClick={cancelInterview} style={styles.cancelBtn}>Annulla</button>
        </div>
      </div>
    )
  }
  if (step === 6) {
    return wrap(
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Consiglieri</h2>
        <div style={styles.helper}>
          Puoi scegliere 0, 1 oppure 2 preferenze. Se sono 2 devono essere uno uomo e una donna e appartenere alla stessa lista.
        </div>

        {groupedCouncillors.map((group) => {
          const men = group.items.filter((c) => c.genere === 'M')
          const women = group.items.filter((c) => c.genere === 'F')

          return (
            <div key={group.id} style={styles.groupCard}>
              <div style={styles.groupTitle}>{group.nome}</div>

              <div style={styles.councillorGrid}>
                <div>
                  <div style={styles.councillorColTitle}>Uomini</div>
                  {men.map((c) => {
                    const selected = data.consigliere1 === c.nome || data.consigliere2 === c.nome
                    return (
                      <button
                        key={c.id}
                        style={{
                          ...styles.councillorBtn,
                          background: selected ? '#dcfce7' : '#ffffff',
                          borderColor: selected ? '#22c55e' : '#cbd5e1',
                        }}
                        onClick={() => toggleCouncillor(c.nome)}
                      >
                        {selected ? `✓ ${c.nome}` : c.nome}
                      </button>
                    )
                  })}
                </div>

                <div>
                  <div style={styles.councillorColTitle}>Donne</div>
                  {women.map((c) => {
                    const selected = data.consigliere1 === c.nome || data.consigliere2 === c.nome
                    return (
                      <button
                        key={c.id}
                        style={{
                          ...styles.councillorBtn,
                          background: selected ? '#dcfce7' : '#ffffff',
                          borderColor: selected ? '#22c55e' : '#cbd5e1',
                        }}
                        onClick={() => toggleCouncillor(c.nome)}
                      >
                        {selected ? `✓ ${c.nome}` : c.nome}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}

        <div style={styles.selectedBox}>
          <strong>Selezionati:</strong> {data.consigliere1 || '-'}{data.consigliere2 ? `, ${data.consigliere2}` : ''}
        </div>

        {validationMessage() ? <div style={styles.errorBox}>{validationMessage()}</div> : null}
        {message ? <div style={styles.infoBox}>{message}</div> : null}

        <div style={styles.footerButtons}>
          <button onClick={cancelInterview} style={styles.cancelBtn}>
            Annulla
          </button>

          <button
            onClick={saveInterview}
            style={styles.secondaryActionBtn}
            disabled={saving}
          >
            Nessuna preferenza
          </button>

          <button
            onClick={saveInterview}
            disabled={saving || !canSave()}
            style={{
              ...styles.saveBtn,
              opacity: saving || !canSave() ? 0.6 : 1,
              cursor: saving || !canSave() ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Salvataggio...' : 'Salva intervista'}
          </button>
        </div>
      </div>
    )
  }

  return wrap(
    <div style={styles.successWrap}>
      <div style={styles.successCard}>
        <div style={styles.successIcon}>✔</div>
        <div style={styles.successTitle}>Intervista salvata correttamente</div>
        <div style={styles.successSubtitle}>Grazie da Radio StudioDue</div>
        <div style={styles.successText}>Tra pochi secondi il sistema tornerà automaticamente alla home.</div>
        <button style={styles.nextBtn} onClick={resetToHome}>
          Nuova intervista
        </button>
      </div>
    </div>
  )
}