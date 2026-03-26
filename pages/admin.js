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

const STUDY_TARGETS = {
  tablet1: {
    'Licenza media o inferiore': 80,
    Diploma: 100,
    'Laurea o superiore': 40,
    Altro: 10,
  },
  tablet2: {
    'Licenza media o inferiore': 42,
    Diploma: 52,
    'Laurea o superiore': 21,
    Altro: 5,
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

const ACCESS_OPTIONS = ['admin', 'tablet1', 'tablet2']
const MAX_USERS = 5
const WORKER_BASE = 'https://exitpoll-worker.francesco-statello88.workers.dev'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    fontFamily: 'Arial, sans-serif',
    color: '#0f172a',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    minHeight: '100vh',
  },
  sidebar: {
    background: '#111827',
    color: 'white',
    padding: 18,
    boxSizing: 'border-box',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '86%',
    height: '86%',
    objectFit: 'contain',
  },
  brandTitle: {
    fontWeight: 900,
    fontSize: 22,
    lineHeight: 1.05,
  },
  brandSub: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 16,
  },
  navBtn: {
    textAlign: 'left',
    padding: '12px 14px',
    borderRadius: 12,
    border: 'none',
    background: 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 15,
  },
  navBtnActive: {
    background: '#2563eb',
  },
  contentWrap: {
    padding: 20,
    boxSizing: 'border-box',
  },
  topbar: {
    background: 'white',
    borderRadius: 18,
    padding: '16px 18px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  topbarTitle: {
    margin: 0,
    fontSize: 30,
    fontWeight: 900,
  },
  topbarSub: {
    margin: '4px 0 0 0',
    color: '#475569',
    fontWeight: 700,
  },
  topbarRight: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userTag: {
    background: '#e2e8f0',
    padding: '9px 12px',
    borderRadius: 10,
    fontWeight: 700,
  },
  logoutBtn: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 10,
    fontWeight: 700,
    cursor: 'pointer',
  },
  section: {
    background: 'white',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
  },
  sectionTitle: {
    margin: '0 0 14px 0',
    fontSize: 24,
    fontWeight: 900,
  },
  cardTitleBlue: {
    margin: '0 0 12px 0',
    fontSize: 18,
    fontWeight: 900,
    color: '#1d4ed8',
  },
  cardTitlePurple: {
    margin: '0 0 12px 0',
    fontSize: 18,
    fontWeight: 900,
    color: '#7c3aed',
  },
  cardTitleGreen: {
    margin: '0 0 12px 0',
    fontSize: 18,
    fontWeight: 900,
    color: '#15803d',
  },
  cardTitleOrange: {
    margin: '0 0 12px 0',
    fontSize: 18,
    fontWeight: 900,
    color: '#c2410c',
  },
  actionsRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  btn: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    background: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  },
  btnPrimary: {
    padding: '10px 14px',
    borderRadius: 10,
    border: 'none',
    background: '#2563eb',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  },
  btnDanger: {
    padding: '10px 14px',
    borderRadius: 10,
    border: 'none',
    background: '#b91c1c',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  },
  btnMuted: {
    padding: '10px 14px',
    borderRadius: 10,
    border: 'none',
    background: '#64748b',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  },
  statsGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 18,
  },
  statBox: {
    borderRadius: 16,
    padding: 18,
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 900,
    lineHeight: 1,
  },
  statSub: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 6,
    opacity: 0.95,
  },
  qualityCard: {
    borderRadius: 16,
    padding: 18,
    color: 'white',
  },
  qualityScore: {
    fontSize: 44,
    fontWeight: 900,
    lineHeight: 1,
    marginBottom: 8,
  },
  qualityText: {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 10,
  },
  reasonList: {
    margin: 0,
    paddingLeft: 18,
    lineHeight: 1.5,
  },
  miniInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
  },
  miniInfoCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: 12,
    background: '#fff',
    textAlign: 'center',
  },
  miniInfoLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#475569',
    marginBottom: 6,
  },
  miniInfoValue: {
    fontSize: 24,
    fontWeight: 900,
  },
  alignedList: {
    marginTop: 8,
  },
  alignedRow3: {
    display: 'grid',
    gridTemplateColumns: '1fr 120px 90px',
    gap: 12,
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  alignedRow2: {
    display: 'grid',
    gridTemplateColumns: '1fr 160px',
    gap: 12,
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  leftText: {
    fontWeight: 700,
    color: '#0f172a',
  },
  rightNumber: {
    textAlign: 'right',
    fontWeight: 900,
    color: '#111827',
  },
  rightPercent: {
    textAlign: 'right',
    fontWeight: 900,
    color: '#2563eb',
  },
  resultHighlightGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.9fr',
    gap: 18,
    marginBottom: 18,
  },
  resultPanel: {
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 16,
    background: '#fff',
  },
  infoStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
    marginBottom: 12,
  },
  infoPill: {
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: 12,
    background: '#fff',
    textAlign: 'center',
  },
  infoPillLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 700,
    marginBottom: 6,
  },
  infoPillValue: {
    fontSize: 24,
    fontWeight: 900,
  },
  leadCard: {
    borderRadius: 16,
    padding: 18,
    color: 'white',
  },
  leadTitle: {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: 8,
  },
  leadValue: {
    fontSize: 36,
    fontWeight: 900,
    lineHeight: 1,
    marginBottom: 8,
  },
  leadSub: {
    fontSize: 14,
    fontWeight: 700,
    opacity: 0.96,
  },
  sideNoteCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 16,
    background: '#fff',
  },
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 10,
  },
  slotCard: {
    borderRadius: 14,
    padding: 12,
    color: 'white',
    textAlign: 'center',
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 6,
  },
  slotBig: {
    fontSize: 26,
    fontWeight: 900,
    lineHeight: 1,
    marginBottom: 4,
  },
  slotSub: {
    fontSize: 12,
    fontWeight: 700,
    opacity: 0.95,
  },
  tableWrap: {
    overflowX: 'auto',
  },
  simpleTable: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
  },
  th: {
    border: '1px solid #cbd5e1',
    padding: 8,
    background: '#eff6ff',
    textAlign: 'left',
    fontSize: 14,
  },
  td: {
    border: '1px solid #cbd5e1',
    padding: 8,
    fontSize: 14,
    verticalAlign: 'top',
  },
  listCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  itemMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  itemName: {
    fontWeight: 900,
    fontSize: 17,
  },
  itemSub: {
    color: '#475569',
    fontSize: 14,
  },
  formRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  input: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    minWidth: 160,
    background: 'white',
  },
  select: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    minWidth: 160,
    background: 'white',
  },
  smallBtn: {
    padding: '6px 10px',
    borderRadius: 8,
    border: 'none',
    background: '#dc2626',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  },
  editBtn: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: 'white',
    cursor: 'pointer',
    fontWeight: 700,
    marginRight: 8,
  },
  tagGreen: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: 999,
    background: '#dcfce7',
    color: '#166534',
    fontWeight: 800,
    fontSize: 12,
  },
  tagRed: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: 999,
    background: '#fee2e2',
    color: '#991b1b',
    fontWeight: 800,
    fontSize: 12,
  },
  hintBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    background: '#eff6ff',
    color: '#1e3a8a',
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

function normalizeStudy(value) {
  if (!value) return 'Altro'
  if (value === 'Licenza media o inferiore') return value
  if (value === 'Diploma') return value
  if (value === 'Laurea o superiore') return value
  return 'Altro'
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

function isNoAnswerValue(value) {
  return value === 'Non si esprime' || value === 'Non risponde'
}

function isWhiteValue(value) {
  return value === 'Scheda bianca'
}

function normalizeDisplayValue(value) {
  if (isNoAnswerValue(value)) return 'Non si esprime'
  return value || '-'
}

function calculateResults(rows) {
  const mayorCounts = {}
  const listCounts = {}
  const councilCounts = {}
  let white = 0
  let noAnswer = 0

  rows.forEach((r) => {
    if (isWhiteValue(r.sindaco)) {
      white += 1
    } else if (isNoAnswerValue(r.sindaco)) {
      noAnswer += 1
    } else if (r.sindaco) {
      mayorCounts[r.sindaco] = (mayorCounts[r.sindaco] || 0) + 1
    }

    if (r.lista && !isWhiteValue(r.lista) && !isNoAnswerValue(r.lista)) {
      listCounts[r.lista] = (listCounts[r.lista] || 0) + 1
    }

    if (r.consigliere1 && r.consigliere1 !== 'Nessuno') {
      councilCounts[r.consigliere1] = (councilCounts[r.consigliere1] || 0) + 1
    }
    if (r.consigliere2 && r.consigliere2 !== 'Nessuno') {
      councilCounts[r.consigliere2] = (councilCounts[r.consigliere2] || 0) + 1
    }
  })

  const totalMayorVotes = Object.values(mayorCounts).reduce((a, b) => a + b, 0) + white
  const mayorPercentages = {}
  Object.keys(mayorCounts).forEach((name) => {
    mayorPercentages[name] =
      totalMayorVotes > 0 ? ((mayorCounts[name] / totalMayorVotes) * 100).toFixed(1) : '0.0'
  })

  const whitePercentage = totalMayorVotes > 0 ? ((white / totalMayorVotes) * 100).toFixed(1) : '0.0'

  const totalListVotes = Object.values(listCounts).reduce((a, b) => a + b, 0)
  const listPercentages = {}
  Object.keys(listCounts).forEach((name) => {
    listPercentages[name] =
      totalListVotes > 0 ? ((listCounts[name] / totalListVotes) * 100).toFixed(1) : '0.0'
  })

  return {
    mayorCounts,
    mayorPercentages,
    listCounts,
    listPercentages,
    councilCounts,
    white,
    whitePercentage,
    noAnswer,
    totalMayorVotes,
    totalListVotes,
  }
}

function computeTabletStats(rows, tabletKey) {
  const target = TABLET_TARGETS[tabletKey]
  const studyTarget = STUDY_TARGETS[tabletKey]
  const tabletRows = rows.filter((r) => r.tablet === tabletKey)

  const genderDone = {
    M: tabletRows.filter((r) => r.sesso === 'Uomo').length,
    F: tabletRows.filter((r) => r.sesso === 'Donna').length,
  }

  const ageDone = { '18-29': 0, '30-44': 0, '45-64': 0, '65+': 0 }
  const slotDone = {
    sun_09_12: 0,
    sun_12_15: 0,
    sun_15_19: 0,
    sun_19_23: 0,
    mon_07_09: 0,
    mon_09_12: 0,
  }
  const studyDone = {
    'Licenza media o inferiore': 0,
    Diploma: 0,
    'Laurea o superiore': 0,
    Altro: 0,
  }

  tabletRows.forEach((r) => {
    const ageKey = mapStoredAgeToQuota(r.eta)
    if (ageKey) ageDone[ageKey] += 1

    const slotKey = classifyTimeSlot(r.created_at)
    if (slotKey) slotDone[slotKey] += 1

    const studyKey = normalizeStudy(r.titolo_studio)
    studyDone[studyKey] += 1
  })

  const studyMissing = {}
  Object.keys(studyTarget).forEach((k) => {
    studyMissing[k] = Math.max(studyTarget[k] - studyDone[k], 0)
  })

  return {
    totalDone: tabletRows.length,
    totalTarget: target.total,
    totalMissing: Math.max(target.total - tabletRows.length, 0),
    genderDone,
    ageDone,
    slotDone,
    studyDone,
    studyMissing,
  }
}

function computeQuality(rows) {
  const t1 = computeTabletStats(rows, 'tablet1')
  const t2 = computeTabletStats(rows, 'tablet2')

  function deviationScore(done, target) {
    if (target === 0) return 1
    return Math.max(0, 1 - Math.abs(done - target) / target)
  }

  const genderScores = [
    deviationScore(t1.genderDone.M, TABLET_TARGETS.tablet1.gender.M),
    deviationScore(t1.genderDone.F, TABLET_TARGETS.tablet1.gender.F),
    deviationScore(t2.genderDone.M, TABLET_TARGETS.tablet2.gender.M),
    deviationScore(t2.genderDone.F, TABLET_TARGETS.tablet2.gender.F),
  ]

  const ageScores = []
  Object.keys(TABLET_TARGETS.tablet1.age).forEach((k) => {
    ageScores.push(deviationScore(t1.ageDone[k], TABLET_TARGETS.tablet1.age[k]))
    ageScores.push(deviationScore(t2.ageDone[k], TABLET_TARGETS.tablet2.age[k]))
  })

  const slotScores = []
  Object.keys(TABLET_TARGETS.tablet1.slots).forEach((k) => {
    slotScores.push(deviationScore(t1.slotDone[k], TABLET_TARGETS.tablet1.slots[k]))
    slotScores.push(deviationScore(t2.slotDone[k], TABLET_TARGETS.tablet2.slots[k]))
  })

  const studyScores = []
  Object.keys(STUDY_TARGETS.tablet1).forEach((k) => {
    studyScores.push(deviationScore(t1.studyDone[k], STUDY_TARGETS.tablet1[k]))
    studyScores.push(deviationScore(t2.studyDone[k], STUDY_TARGETS.tablet2[k]))
  })

  const expectedTotal = TABLET_TARGETS.tablet1.total + TABLET_TARGETS.tablet2.total
  const totalSample = rows.length

  const tabletBalanceScore = deviationScore(
    t1.totalDone / Math.max(totalSample, 1),
    TABLET_TARGETS.tablet1.total / expectedTotal
  )

  const completionScore = Math.min(totalSample / expectedTotal, 1)

  const avgGender = genderScores.reduce((a, b) => a + b, 0) / genderScores.length
  const avgAge = ageScores.reduce((a, b) => a + b, 0) / ageScores.length
  const avgSlot = slotScores.reduce((a, b) => a + b, 0) / slotScores.length
  const avgStudy = studyScores.reduce((a, b) => a + b, 0) / studyScores.length

  const score = Math.round(
    avgGender * 20 +
      avgAge * 25 +
      avgSlot * 20 +
      avgStudy * 10 +
      tabletBalanceScore * 10 +
      completionScore * 15
  )

  let label = 'Scarsa'
  let color = 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)'

  if (score >= 80) {
    label = 'Buona'
    color = 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)'
  } else if (score >= 60) {
    label = 'Discreta'
    color = 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
  }

  const reasons = []
  if (avgGender < 0.75) reasons.push('Quote sesso non perfettamente bilanciate.')
  if (avgAge < 0.75) reasons.push('Distribuzione età da migliorare.')
  if (avgSlot < 0.75) reasons.push('Copertura oraria non uniforme.')
  if (avgStudy < 0.7) reasons.push('Titolo di studio poco equilibrato.')
  if (tabletBalanceScore < 0.8) reasons.push('Bilanciamento tra tablet migliorabile.')
  if (completionScore < 0.6) reasons.push('Campione ancora parziale.')
  if (!reasons.length) reasons.push('Campione ben distribuito e coerente con i target.')

  return { score, label, color, reasons }
}

function computeLeadSummary(results, qualityScore) {
  const entries = Object.entries(results.mayorCounts).sort((a, b) => b[1] - a[1])

  if (!entries.length) {
    return {
      leader: 'Nessun dato',
      margin: '0.0',
      verdict: 'Campione insufficiente',
      color: 'linear-gradient(180deg, #64748b 0%, #475569 100%)',
      leaderPct: '0.0',
      secondName: '-',
      secondPct: '0.0',
      isTie: false,
    }
  }

  const leader = entries[0]
  const second = entries[1] || [null, 0]
  const total = results.totalMayorVotes || 0
  const leaderPct = total > 0 ? (leader[1] / total) * 100 : 0
  const secondPct = total > 0 ? (second[1] / total) * 100 : 0
  const margin = leaderPct - secondPct

  if (entries.length > 1 && leader[1] === second[1]) {
    return {
      leader: 'Parità',
      margin: '0.0',
      verdict: 'Dati in equilibrio',
      color: 'linear-gradient(180deg, #0f766e 0%, #115e59 100%)',
      leaderPct: leaderPct.toFixed(1),
      secondName: second[0] || '-',
      secondPct: secondPct.toFixed(1),
      isTie: true,
    }
  }

  let verdict = 'Dato instabile'
  let color = 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)'

  if (qualityScore >= 80 && margin >= 4) {
    verdict = 'Vantaggio solido'
    color = 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)'
  } else if (qualityScore >= 60 && margin >= 2) {
    verdict = 'Vantaggio presente'
    color = 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
  }

  return {
    leader: leader[0],
    margin: margin.toFixed(1),
    verdict,
    color,
    leaderPct: leaderPct.toFixed(1),
    secondName: second[0] || '-',
    secondPct: secondPct.toFixed(1),
    isTie: false,
  }
}

function ResultsBlock({ title, dataRows, results, styles }) {
  return (
    <div style={styles.resultPanel}>
      <h3 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h3>
      <div style={{ marginBottom: 10 }}>
        <strong>Interviste nel blocco:</strong> {dataRows.length}
      </div>

      <h4 style={styles.cardTitleBlue}>Sindaci</h4>
      <div style={styles.alignedList}>
        {Object.keys(results.mayorCounts).length === 0 ? (
          <div style={styles.alignedRow3}>
            <div style={styles.leftText}>Nessun dato</div>
            <div />
            <div />
          </div>
        ) : (
          Object.keys(results.mayorCounts).map((name) => (
            <div key={name} style={styles.alignedRow3}>
              <div style={styles.leftText}>{name}</div>
              <div style={styles.rightNumber}>{results.mayorCounts[name]} voti</div>
              <div style={styles.rightPercent}>{results.mayorPercentages[name]}%</div>
            </div>
          ))
        )}

        <div style={styles.alignedRow3}>
          <div style={styles.leftText}>Scheda bianca</div>
          <div style={styles.rightNumber}>{results.white} voti</div>
          <div style={styles.rightPercent}>{results.whitePercentage}%</div>
        </div>

        <div style={styles.alignedRow3}>
          <div style={styles.leftText}>Non si esprime</div>
          <div style={styles.rightNumber}>{results.noAnswer}</div>
          <div style={styles.rightPercent}>—</div>
        </div>
      </div>

      <h4 style={styles.cardTitlePurple}>Liste</h4>
      <div style={styles.alignedList}>
        {Object.keys(results.listCounts).length === 0 ? (
          <div style={styles.alignedRow3}>
            <div style={styles.leftText}>Nessun dato</div>
            <div />
            <div />
          </div>
        ) : (
          Object.keys(results.listCounts).map((name) => (
            <div key={name} style={styles.alignedRow3}>
              <div style={styles.leftText}>{name}</div>
              <div style={styles.rightNumber}>{results.listCounts[name]} voti</div>
              <div style={styles.rightPercent}>{results.listPercentages[name]}%</div>
            </div>
          ))
        )}
      </div>

      <h4 style={styles.cardTitleGreen}>Consiglieri</h4>
      <div style={styles.alignedList}>
        {Object.keys(results.councilCounts).length === 0 ? (
          <div style={styles.alignedRow2}>
            <div style={styles.leftText}>Nessun dato</div>
            <div />
          </div>
        ) : (
          Object.keys(results.councilCounts)
            .sort((a, b) => results.councilCounts[b] - results.councilCounts[a])
            .map((name) => (
              <div key={name} style={styles.alignedRow2}>
                <div style={styles.leftText}>{name}</div>
                <div style={styles.rightNumber}>{results.councilCounts[name]} preferenze</div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

function TabletOverview({ title, stats, tabletKey, styles }) {
  const targets = TABLET_TARGETS[tabletKey]
  const studyTargets = STUDY_TARGETS[tabletKey]

  return (
    <div style={styles.section}>
      <h3 style={styles.cardTitleBlue}>{title}</h3>

      <div style={styles.miniInfoGrid}>
        <div style={styles.miniInfoCard}>
          <div style={styles.miniInfoLabel}>Raccolte</div>
          <div style={styles.miniInfoValue}>{stats.totalDone}</div>
        </div>
        <div style={styles.miniInfoCard}>
          <div style={styles.miniInfoLabel}>Target</div>
          <div style={styles.miniInfoValue}>{targets.total}</div>
        </div>
        <div style={styles.miniInfoCard}>
          <div style={styles.miniInfoLabel}>Mancanti</div>
          <div style={styles.miniInfoValue}>{stats.totalMissing}</div>
        </div>
        <div style={styles.miniInfoCard}>
          <div style={styles.miniInfoLabel}>Avanzamento</div>
          <div style={styles.miniInfoValue}>
            {targets.total > 0 ? Math.round((stats.totalDone / targets.total) * 100) : 0}%
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <h4 style={styles.cardTitlePurple}>Sesso</h4>
      <div style={styles.alignedList}>
        <div style={styles.alignedRow2}>
          <div style={styles.leftText}>Uomini</div>
          <div style={styles.rightNumber}>
            {stats.genderDone.M} / {targets.gender.M}
          </div>
        </div>
        <div style={styles.alignedRow2}>
          <div style={styles.leftText}>Donne</div>
          <div style={styles.rightNumber}>
            {stats.genderDone.F} / {targets.gender.F}
          </div>
        </div>
      </div>

      <h4 style={styles.cardTitleGreen}>Età</h4>
      <div style={styles.alignedList}>
        {Object.keys(targets.age).map((k) => (
          <div key={k} style={styles.alignedRow2}>
            <div style={styles.leftText}>{k}</div>
            <div style={styles.rightNumber}>
              {stats.ageDone[k]} / {targets.age[k]}
            </div>
          </div>
        ))}
      </div>

      <h4 style={styles.cardTitleOrange}>Titolo di studio</h4>
      <div style={styles.alignedList}>
        {Object.keys(studyTargets).map((k) => (
          <div key={k} style={styles.alignedRow2}>
            <div style={styles.leftText}>{k}</div>
            <div style={styles.rightNumber}>
              {stats.studyDone[k]} / {studyTargets[k]}
            </div>
          </div>
        ))}
      </div>

      <h4 style={styles.cardTitleBlue}>Fasce orarie</h4>
      <div style={styles.slotGrid}>
        {Object.keys(targets.slots).map((k) => (
          <div key={k} style={{ ...styles.slotCard, background: getSlotColor(stats.slotDone[k], targets.slots[k]) }}>
            <div style={styles.slotLabel}>{SLOT_LABELS[k]}</div>
            <div style={styles.slotBig}>{Math.max(targets.slots[k] - stats.slotDone[k], 0)}</div>
            <div style={styles.slotSub}>
              {stats.slotDone[k]} / {targets.slots[k]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Admin() {
  const router = useRouter()

  const [authReady, setAuthReady] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [mayors, setMayors] = useState([])
  const [lists, setLists] = useState([])
  const [councilCandidates, setCouncilCandidates] = useState([])
  const [users, setUsers] = useState([])
  const [publishedItems, setPublishedItems] = useState([])
  const [publishingLabel, setPublishingLabel] = useState('')

  const [newMayor, setNewMayor] = useState({ nome: '', foto_url: '', ordine: 1 })
  const [newList, setNewList] = useState({ nome: '', simbolo_url: '', sindaco_nome: '', ordine: 1 })
  const [newCouncil, setNewCouncil] = useState({ lista_id: '', nome: '', genere: 'M', ordine: 1 })

  const [editingListId, setEditingListId] = useState(null)
  const [editingList, setEditingList] = useState({ nome: '', simbolo_url: '', sindaco_nome: '', ordine: 1 })

  const [editingCouncilId, setEditingCouncilId] = useState(null)
  const [editingCouncil, setEditingCouncil] = useState({ lista_id: '', nome: '', genere: 'M', ordine: 1 })

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'intervistatore',
    access: 'tablet1',
    active: true,
  })
  const [editingUserId, setEditingUserId] = useState(null)
  const [editingUser, setEditingUser] = useState({
    username: '',
    password: '',
    role: 'intervistatore',
    access: 'tablet1',
    active: true,
  })

  useEffect(() => {
    let auth = null
    try {
      auth = JSON.parse(localStorage.getItem('auth'))
    } catch (e) {
      auth = null
    }

    if (!auth || auth.access !== 'admin') {
      router.replace('/login')
      return
    }

    setAuthUser(auth)
    setAuthReady(true)
  }, [router])

  useEffect(() => {
    if (!authReady) return
    loadAll()
  }, [authReady])

  async function loadAll() {
    setLoading(true)

    const [
      { data: interviewsData },
      { data: mayorsData },
      { data: listsData },
      { data: councilData },
      { data: usersData },
      { data: publicationsData },
    ] = await Promise.all([
      supabase.from('interviews').select('*').order('created_at', { ascending: true }),
      supabase.from('mayor_candidates').select('*').order('ordine', { ascending: true }),
      supabase.from('election_lists').select('*').order('ordine', { ascending: true }),
      supabase.from('council_candidates').select('*').order('ordine', { ascending: true }),
      supabase.from('users').select('*').order('created_at', { ascending: true }),
      supabase.from('exitpoll_publications').select('*').order('created_at', { ascending: false }),
    ])

    setRows(interviewsData || [])
    setMayors(mayorsData || [])
    setLists(listsData || [])
    setCouncilCandidates(councilData || [])
    setUsers(usersData || [])
    setPublishedItems(publicationsData || [])
    setLoading(false)
  }

  const tablet1Stats = useMemo(() => computeTabletStats(rows, 'tablet1'), [rows])
  const tablet2Stats = useMemo(() => computeTabletStats(rows, 'tablet2'), [rows])
  const quality = useMemo(() => computeQuality(rows), [rows])
  const resultsTotal = useMemo(() => calculateResults(rows), [rows])
  const leadSummary = useMemo(
    () => computeLeadSummary(resultsTotal, quality.score),
    [resultsTotal, quality.score]
  )
  const totalNoAnswer = rows.filter((r) => isNoAnswerValue(r.sindaco)).length
  const totalWhite = rows.filter((r) => isWhiteValue(r.sindaco)).length

  function buildPublishedPayload(tipo) {
    const sindaci = Object.keys(resultsTotal.mayorCounts)
      .map((nome) => ({
        nome,
        voti: resultsTotal.mayorCounts[nome],
        percentuale: Number(resultsTotal.mayorPercentages[nome]),
      }))
      .sort((a, b) => b.voti - a.voti)

    const liste = Object.keys(resultsTotal.listCounts)
      .map((nome) => ({
        nome,
        voti: resultsTotal.listCounts[nome],
        percentuale: Number(resultsTotal.listPercentages[nome]),
      }))
      .sort((a, b) => b.voti - a.voti)

    const consiglieri = Object.keys(resultsTotal.councilCounts)
      .map((nome) => ({
        nome,
        preferenze: resultsTotal.councilCounts[nome],
      }))
      .sort((a, b) => b.preferenze - a.preferenze)

    return {
      tipo,
      pubblicato_il: new Date().toISOString(),
      totale_interviste: rows.length,
      qualita_campione: quality.score,
      etichetta_qualita: quality.label,
      leader: leadSummary.leader,
      vantaggio: leadSummary.verdict,
      margine: leadSummary.margin,
      sindaci,
      liste,
      consiglieri,
      schede_bianche: resultsTotal.white,
      non_si_esprime: resultsTotal.noAnswer,
    }
  }

  async function publishExitPoll(tipo) {
    if (!rows.length) {
      alert('Non ci sono dati da pubblicare.')
      return
    }

    try {
      setPublishingLabel(tipo)

      const payload = buildPublishedPayload(tipo)

      const response = await fetch(`${WORKER_BASE}/api/pubblica`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          payload,
          dati: payload,
        }),
      })

      const text = await response.text()

      if (!response.ok) {
        console.error('Errore worker:', text)
        throw new Error('Errore worker')
      }

      await loadAll()
      alert(`Pubblicazione completata: Exit Poll ${tipo}`)
    } catch (err) {
      console.error(err)
      alert('Errore pubblicazione snapshot')
    } finally {
      setPublishingLabel('')
    }
  }

  function handleLogout() {
    localStorage.removeItem('auth')
    router.replace('/login')
  }

  function getListName(listaId) {
    const found = lists.find((l) => String(l.id) === String(listaId))
    return found ? found.nome : 'Lista non trovata'
  }

  function downloadCSV() {
    if (!rows.length) {
      alert('Nessun dato da scaricare')
      return
    }

    const headers = [
      'id',
      'created_at',
      'tablet',
      'eta',
      'sesso',
      'titolo_studio',
      'fascia_oraria',
      'sindaco',
      'lista',
      'consigliere1',
      'consigliere2',
    ]

    const csvRows = [
      headers.join(';'),
      ...rows.map((r) => {
        const rowData = {
          ...r,
          fascia_oraria: classifyTimeSlot(r.created_at) || '',
          sindaco: normalizeDisplayValue(r.sindaco),
          lista: isWhiteValue(r.lista) || isNoAnswerValue(r.lista) ? '-' : r.lista || '-',
        }
        return headers
          .map((h) => `"${String(rowData[h] ?? '').replace(/"/g, '""')}"`)
          .join(';')
      }),
    ]

    const csvContent = '\uFEFF' + csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exitpoll-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function deleteInterview(id) {
    if (!confirm('Vuoi davvero eliminare questa intervista?')) return
    const { error } = await supabase.from('interviews').delete().eq('id', id)
    if (error) return alert('Errore eliminazione: ' + error.message)
    loadAll()
  }

  async function deleteAllInterviews() {
    if (!confirm('Vuoi davvero cancellare TUTTE le interviste?')) return
    const { error } = await supabase.from('interviews').delete().not('id', 'is', null)
    if (error) return alert('Errore eliminazione totale: ' + error.message)
    loadAll()
  }

  async function addMayor() {
    if (!newMayor.nome.trim()) return alert('Inserisci il nome del sindaco')

    const { error } = await supabase.from('mayor_candidates').insert([
      {
        nome: newMayor.nome.trim(),
        foto_url: newMayor.foto_url,
        ordine: Number(newMayor.ordine) || 1,
        attivo: true,
      },
    ])

    if (error) return alert('Errore inserimento sindaco: ' + error.message)
    setNewMayor({ nome: '', foto_url: '', ordine: 1 })
    loadAll()
  }

  async function deleteMayor(id) {
    if (!confirm('Vuoi eliminare questo sindaco?')) return
    const { error } = await supabase.from('mayor_candidates').delete().eq('id', id)
    if (error) return alert('Errore eliminazione sindaco: ' + error.message)
    loadAll()
  }

  async function addList() {
    if (!newList.nome.trim()) return alert('Inserisci il nome della lista')

    const { error } = await supabase.from('election_lists').insert([
      {
        nome: newList.nome.trim(),
        simbolo_url: newList.simbolo_url,
        sindaco_nome: newList.sindaco_nome || null,
        ordine: Number(newList.ordine) || 1,
        attivo: true,
      },
    ])

    if (error) return alert('Errore inserimento lista: ' + error.message)
    setNewList({ nome: '', simbolo_url: '', sindaco_nome: '', ordine: 1 })
    loadAll()
  }

  function startEditList(list) {
    setEditingListId(list.id)
    setEditingList({
      nome: list.nome || '',
      simbolo_url: list.simbolo_url || '',
      sindaco_nome: list.sindaco_nome || '',
      ordine: list.ordine || 1,
    })
  }

  function cancelEditList() {
    setEditingListId(null)
    setEditingList({ nome: '', simbolo_url: '', sindaco_nome: '', ordine: 1 })
  }

  async function saveEditList() {
    if (!editingList.nome.trim()) return alert('Inserisci il nome della lista')

    const { error } = await supabase
      .from('election_lists')
      .update({
        nome: editingList.nome.trim(),
        simbolo_url: editingList.simbolo_url,
        sindaco_nome: editingList.sindaco_nome || null,
        ordine: Number(editingList.ordine) || 1,
      })
      .eq('id', editingListId)

    if (error) return alert('Errore modifica lista: ' + error.message)
    cancelEditList()
    loadAll()
  }

  async function deleteList(id) {
    if (!confirm('Vuoi eliminare questa lista?')) return
    const { error } = await supabase.from('election_lists').delete().eq('id', id)
    if (error) return alert('Errore eliminazione lista: ' + error.message)
    loadAll()
  }

  async function addCouncilCandidate() {
    if (!newCouncil.lista_id) return alert('Seleziona una lista')
    if (!newCouncil.nome.trim()) return alert('Inserisci il nome del consigliere')

    const { error } = await supabase.from('council_candidates').insert([
      {
        lista_id: newCouncil.lista_id,
        nome: newCouncil.nome.trim(),
        genere: newCouncil.genere,
        ordine: Number(newCouncil.ordine) || 1,
        attivo: true,
      },
    ])

    if (error) return alert('Errore inserimento consigliere: ' + error.message)

    setNewCouncil({ lista_id: '', nome: '', genere: 'M', ordine: 1 })
    loadAll()
  }

  function startEditCouncil(c) {
    setEditingCouncilId(c.id)
    setEditingCouncil({
      lista_id: c.lista_id || '',
      nome: c.nome || '',
      genere: c.genere || 'M',
      ordine: c.ordine || 1,
    })
  }

  function cancelEditCouncil() {
    setEditingCouncilId(null)
    setEditingCouncil({ lista_id: '', nome: '', genere: 'M', ordine: 1 })
  }

  async function saveEditCouncil() {
    if (!editingCouncil.lista_id) return alert('Seleziona una lista')
    if (!editingCouncil.nome.trim()) return alert('Inserisci il nome del consigliere')

    const { error } = await supabase
      .from('council_candidates')
      .update({
        lista_id: editingCouncil.lista_id,
        nome: editingCouncil.nome.trim(),
        genere: editingCouncil.genere,
        ordine: Number(editingCouncil.ordine) || 1,
      })
      .eq('id', editingCouncilId)

    if (error) return alert('Errore modifica consigliere: ' + error.message)
    cancelEditCouncil()
    loadAll()
  }

  async function deleteCouncilCandidate(id) {
    if (!confirm('Vuoi eliminare questo consigliere?')) return
    const { error } = await supabase.from('council_candidates').delete().eq('id', id)
    if (error) return alert('Errore eliminazione consigliere: ' + error.message)
    loadAll()
  }

  function startEditUser(u) {
    setEditingUserId(u.id)
    setEditingUser({
      username: u.username || '',
      password: u.password || '',
      role: u.role || 'intervistatore',
      access: u.access || 'tablet1',
      active: u.active ?? true,
    })
  }

  function cancelEditUser() {
    setEditingUserId(null)
    setEditingUser({
      username: '',
      password: '',
      role: 'intervistatore',
      access: 'tablet1',
      active: true,
    })
  }

  async function addUser() {
    if (users.length >= MAX_USERS) return alert('Hai raggiunto il limite massimo di 5 utenti.')
    if (!newUser.username.trim() || !newUser.password.trim()) return alert('Inserisci username e password')
    if (!ACCESS_OPTIONS.includes(newUser.access)) return alert('Accesso non valido')

    const { error } = await supabase.from('users').insert([
      {
        username: newUser.username.trim(),
        password: newUser.password,
        role: newUser.role,
        access: newUser.access,
        active: newUser.active,
      },
    ])

    if (error) return alert('Errore inserimento utente: ' + error.message)

    setNewUser({
      username: '',
      password: '',
      role: 'intervistatore',
      access: 'tablet1',
      active: true,
    })
    loadAll()
  }

  async function saveUser() {
    if (!editingUser.username.trim() || !editingUser.password.trim()) {
      return alert('Inserisci username e password')
    }
    if (!ACCESS_OPTIONS.includes(editingUser.access)) return alert('Accesso non valido')

    const { error } = await supabase
      .from('users')
      .update({
        username: editingUser.username.trim(),
        password: editingUser.password,
        role: editingUser.role,
        access: editingUser.access,
        active: editingUser.active,
      })
      .eq('id', editingUserId)

    if (error) return alert('Errore modifica utente: ' + error.message)

    cancelEditUser()
    loadAll()
  }

  async function deleteUser(id, username) {
    if (username === 'admin') return alert('L’utente admin principale non può essere eliminato.')
    if (!confirm('Vuoi eliminare questo utente?')) return
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) return alert('Errore eliminazione utente: ' + error.message)
    loadAll()
  }

  async function toggleUserActive(id, currentValue, username) {
    if (username === 'admin' && currentValue === true) {
      return alert('L’utente admin principale deve restare attivo.')
    }
    const { error } = await supabase.from('users').update({ active: !currentValue }).eq('id', id)
    if (error) return alert('Errore aggiornamento utente: ' + error.message)
    loadAll()
  }

  function renderDashboard() {
    return (
      <>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Dashboard</h2>
          <div style={styles.statsGrid4}>
            <div style={{ ...styles.statBox, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              <div style={styles.statLabel}>Totale raccolto</div>
              <div style={styles.statValue}>{rows.length}</div>
              <div style={styles.statSub}>Target generale 350</div>
            </div>
            <div style={{ ...styles.statBox, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <div style={styles.statLabel}>Tablet 1</div>
              <div style={styles.statValue}>{tablet1Stats.totalDone}</div>
              <div style={styles.statSub}>su 230</div>
            </div>
            <div style={{ ...styles.statBox, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <div style={styles.statLabel}>Tablet 2</div>
              <div style={styles.statValue}>{tablet2Stats.totalDone}</div>
              <div style={styles.statSub}>su 120</div>
            </div>
            <div style={{ ...styles.statBox, background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
              <div style={styles.statLabel}>Interviste con voto espresso sindaco</div>
              <div style={styles.statValue}>{Math.max(rows.length - totalNoAnswer, 0)}</div>
              <div style={styles.statSub}>Schede bianche: {totalWhite}</div>
            </div>
          </div>
        </div>

        <div style={styles.twoCol}>
          <div style={styles.section}>
            <h3 style={styles.cardTitleOrange}>Azioni rapide</h3>
            <div style={styles.actionsRow}>
              <button onClick={downloadCSV} style={styles.btnPrimary}>SCARICA BACKUP CSV</button>
              <button onClick={loadAll} style={styles.btn}>AGGIORNA</button>
              <button onClick={deleteAllInterviews} style={styles.btnDanger}>CANCELLA TUTTE LE INTERVISTE</button>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.cardTitleBlue}>Qualità rilevazione</h3>
            <div style={{ ...styles.qualityCard, background: quality.color }}>
              <div style={styles.qualityScore}>{quality.score}/100</div>
              <div style={styles.qualityText}>{quality.label}</div>
              <ul style={styles.reasonList}>
                {quality.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div style={styles.twoCol}>
          <TabletOverview title="Controllo Tablet 1" stats={tablet1Stats} tabletKey="tablet1" styles={styles} />
          <TabletOverview title="Controllo Tablet 2" stats={tablet2Stats} tabletKey="tablet2" styles={styles} />
        </div>
      </>
    )
  }

  function renderResults() {
    return (
      <div style={styles.resultHighlightGrid}>
        <div>
          <div style={styles.section}>
            <h3 style={styles.cardTitleBlue}>Quadro generale</h3>

            <div style={styles.infoStrip}>
              <div style={styles.infoPill}>
                <div style={styles.infoPillLabel}>Totale interviste</div>
                <div style={styles.infoPillValue}>{rows.length}</div>
              </div>
              <div style={styles.infoPill}>
                <div style={styles.infoPillLabel}>Schede bianche</div>
                <div style={styles.infoPillValue}>{resultsTotal.white}</div>
              </div>
              <div style={styles.infoPill}>
                <div style={styles.infoPillLabel}>Non si esprime</div>
                <div style={styles.infoPillValue}>{resultsTotal.noAnswer}</div>
              </div>
              <div style={styles.infoPill}>
                <div style={styles.infoPillLabel}>Qualità campione</div>
                <div style={styles.infoPillValue}>{quality.score}</div>
              </div>
            </div>

            <ResultsBlock title="Totale generale" dataRows={rows} results={resultsTotal} styles={styles} />
          </div>
        </div>

        <div>
          <div style={{ ...styles.leadCard, background: leadSummary.color }}>
            <div style={styles.leadTitle}>Lettura del vantaggio</div>
            <div style={styles.leadValue}>{leadSummary.leader}</div>
            <div style={styles.leadSub}>
              {leadSummary.verdict}
              {leadSummary.isTie ? '' : ` · margine +${leadSummary.margin}%`}
            </div>
            <div style={{ height: 10 }} />
            <div style={styles.leadSub}>
              1° {leadSummary.leaderPct}% · 2° {leadSummary.secondName} {leadSummary.secondPct}%
            </div>
          </div>

          <div style={{ height: 18 }} />

          <div style={styles.sideNoteCard}>
            <h3 style={styles.cardTitlePurple}>Lettura tecnica</h3>
            <div style={{ lineHeight: 1.6, color: '#334155', fontWeight: 700 }}>
              <div>• “Non si esprime” raccoglie anche gli eventuali vecchi record salvati come “Non risponde”.</div>
              <div>• Le liste mostrano solo voti utili, senza schede bianche e senza non espressi.</div>
              <div>• In caso di parità perfetta il sistema non assegna un vantaggio fittizio.</div>
            </div>
          </div>

          <div style={{ height: 18 }} />

          <div style={styles.sideNoteCard}>
            <h3 style={styles.cardTitleBlue}>Pubblicazione exit poll</h3>

            <div style={styles.actionsRow}>
              <button
                onClick={() => publishExitPoll('15:00')}
                style={styles.btnPrimary}
                disabled={publishingLabel !== ''}
              >
                {publishingLabel === '15:00' ? 'Pubblicazione...' : 'Pubblica Exit Poll 15:00'}
              </button>

              <button
                onClick={() => publishExitPoll('15:20')}
                style={styles.btn}
                disabled={publishingLabel !== ''}
              >
                {publishingLabel === '15:20' ? 'Pubblicazione...' : 'Pubblica Exit Poll 15:20'}
              </button>
            </div>

            <div style={{ height: 12 }} />

            {publishedItems.length ? (
              <div style={{ lineHeight: 1.6, color: '#334155', fontWeight: 700 }}>
                <div><strong>Ultima pubblicazione:</strong> {publishedItems[0].tipo || '-'}</div>
                <div><strong>Data:</strong> {publishedItems[0].created_at || '-'}</div>
                <div><strong>Attiva:</strong> {publishedItems[0].active ? 'Sì' : 'No'}</div>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontWeight: 700 }}>
                Nessuna pubblicazione ancora effettuata.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function renderInterviews() {
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Interviste raccolte</h2>
        {loading ? <p>Caricamento...</p> : <p>Interviste totali: <strong>{rows.length}</strong></p>}

        <div style={styles.tableWrap}>
          <table style={styles.simpleTable}>
            <thead>
              <tr>
                <th style={styles.th}>Data</th>
                <th style={styles.th}>Tablet</th>
                <th style={styles.th}>Età</th>
                <th style={styles.th}>Sesso</th>
                <th style={styles.th}>Titolo studio</th>
                <th style={styles.th}>Fascia oraria</th>
                <th style={styles.th}>Sindaco</th>
                <th style={styles.th}>Lista</th>
                <th style={styles.th}>Cons. 1</th>
                <th style={styles.th}>Cons. 2</th>
                <th style={styles.th}>Azione</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={styles.td}>{r.created_at}</td>
                  <td style={styles.td}>{r.tablet}</td>
                  <td style={styles.td}>{r.eta}</td>
                  <td style={styles.td}>{r.sesso}</td>
                  <td style={styles.td}>{r.titolo_studio}</td>
                  <td style={styles.td}>{classifyTimeSlot(r.created_at) || '-'}</td>
                  <td style={styles.td}>{normalizeDisplayValue(r.sindaco)}</td>
                  <td style={styles.td}>
                    {isWhiteValue(r.lista) || isNoAnswerValue(r.lista) ? '-' : r.lista || '-'}
                  </td>
                  <td style={styles.td}>{r.consigliere1}</td>
                  <td style={styles.td}>{r.consigliere2}</td>
                  <td style={styles.td}>
                    <button onClick={() => deleteInterview(r.id)} style={styles.smallBtn}>Elimina</button>
                  </td>
                </tr>
              ))}
              {!rows.length && !loading ? (
                <tr>
                  <td style={styles.td} colSpan="11">Nessuna intervista presente</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  function renderMayors() {
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Sindaci</h2>

        {mayors.map((m) => (
          <div key={m.id} style={styles.listCard}>
            <div style={styles.itemMeta}>
              <div style={styles.itemName}>{m.nome}</div>
              <div style={styles.itemSub}>Ordine: <strong>{m.ordine ?? '-'}</strong></div>
              <div style={styles.itemSub}>Foto URL: {m.foto_url || '-'}</div>
            </div>
            <button onClick={() => deleteMayor(m.id)} style={styles.smallBtn}>Elimina</button>
          </div>
        ))}

        <h3 style={styles.cardTitleBlue}>Aggiungi sindaco</h3>
        <div style={styles.formRow}>
          <input
            style={styles.input}
            placeholder="Nome sindaco"
            value={newMayor.nome}
            onChange={(e) => setNewMayor({ ...newMayor, nome: e.target.value })}
          />
          <input
            style={{ ...styles.input, minWidth: 260 }}
            placeholder="URL foto"
            value={newMayor.foto_url}
            onChange={(e) => setNewMayor({ ...newMayor, foto_url: e.target.value })}
          />
          <input
            style={{ ...styles.input, width: 100 }}
            type="number"
            placeholder="Ordine"
            value={newMayor.ordine}
            onChange={(e) => setNewMayor({ ...newMayor, ordine: Number(e.target.value) })}
          />
          <button onClick={addMayor} style={styles.btnPrimary}>Aggiungi Sindaco</button>
        </div>
      </div>
    )
  }

  function renderLists() {
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Liste</h2>

        {lists.map((l) => (
          <div key={l.id} style={styles.listCard}>
            {editingListId === l.id ? (
              <div style={{ width: '100%' }}>
                <h3 style={styles.cardTitleOrange}>Modifica lista</h3>
                <div style={styles.formRow}>
                  <input
                    style={styles.input}
                    placeholder="Nome lista"
                    value={editingList.nome}
                    onChange={(e) => setEditingList({ ...editingList, nome: e.target.value })}
                  />
                  <input
                    style={{ ...styles.input, minWidth: 260 }}
                    placeholder="URL simbolo"
                    value={editingList.simbolo_url}
                    onChange={(e) => setEditingList({ ...editingList, simbolo_url: e.target.value })}
                  />
                  <select
                    style={styles.select}
                    value={editingList.sindaco_nome}
                    onChange={(e) => setEditingList({ ...editingList, sindaco_nome: e.target.value })}
                  >
                    <option value="">Nessun sindaco collegato</option>
                    {mayors.map((m) => (
                      <option key={m.id} value={m.nome}>{m.nome}</option>
                    ))}
                  </select>
                  <input
                    style={{ ...styles.input, width: 100 }}
                    type="number"
                    placeholder="Ordine"
                    value={editingList.ordine}
                    onChange={(e) => setEditingList({ ...editingList, ordine: Number(e.target.value) })}
                  />
                </div>
                <div style={styles.formRow}>
                  <button onClick={saveEditList} style={styles.btnPrimary}>Salva</button>
                  <button onClick={cancelEditList} style={styles.btn}>Annulla</button>
                </div>
              </div>
            ) : (
              <>
                <div style={styles.itemMeta}>
                  <div style={styles.itemName}>{l.nome}</div>
                  <div style={styles.itemSub}>Ordine: <strong>{l.ordine ?? '-'}</strong></div>
                  <div style={styles.itemSub}>Simbolo URL: {l.simbolo_url || '-'}</div>
                  <div style={styles.itemSub}>Sindaco collegato: <strong>{l.sindaco_nome || '-'}</strong></div>
                </div>
                <div>
                  <button onClick={() => startEditList(l)} style={styles.editBtn}>Modifica</button>
                  <button onClick={() => deleteList(l.id)} style={styles.smallBtn}>Elimina</button>
                </div>
              </>
            )}
          </div>
        ))}

        <h3 style={styles.cardTitlePurple}>Aggiungi lista</h3>
        <div style={styles.formRow}>
          <input
            style={styles.input}
            placeholder="Nome lista"
            value={newList.nome}
            onChange={(e) => setNewList({ ...newList, nome: e.target.value })}
          />
          <input
            style={{ ...styles.input, minWidth: 260 }}
            placeholder="URL simbolo"
            value={newList.simbolo_url}
            onChange={(e) => setNewList({ ...newList, simbolo_url: e.target.value })}
          />
          <select
            style={styles.select}
            value={newList.sindaco_nome}
            onChange={(e) => setNewList({ ...newList, sindaco_nome: e.target.value })}
          >
            <option value="">Sindaco collegato</option>
            {mayors.map((m) => (
              <option key={m.id} value={m.nome}>{m.nome}</option>
            ))}
          </select>
          <input
            style={{ ...styles.input, width: 100 }}
            type="number"
            placeholder="Ordine"
            value={newList.ordine}
            onChange={(e) => setNewList({ ...newList, ordine: Number(e.target.value) })}
          />
          <button onClick={addList} style={styles.btnPrimary}>Aggiungi Lista</button>
        </div>
      </div>
    )
  }

  function renderCouncillors() {
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Consiglieri</h2>

        {councilCandidates.map((c) => (
          <div key={c.id} style={styles.listCard}>
            {editingCouncilId === c.id ? (
              <div style={{ width: '100%' }}>
                <h3 style={styles.cardTitleOrange}>Modifica consigliere</h3>
                <div style={styles.formRow}>
                  <select
                    style={styles.select}
                    value={editingCouncil.lista_id}
                    onChange={(e) => setEditingCouncil({ ...editingCouncil, lista_id: e.target.value })}
                  >
                    <option value="">Seleziona lista</option>
                    {lists.map((l) => (
                      <option key={l.id} value={l.id}>{l.nome}</option>
                    ))}
                  </select>
                  <input
                    style={styles.input}
                    placeholder="Nome consigliere"
                    value={editingCouncil.nome}
                    onChange={(e) => setEditingCouncil({ ...editingCouncil, nome: e.target.value })}
                  />
                  <select
                    style={styles.select}
                    value={editingCouncil.genere}
                    onChange={(e) => setEditingCouncil({ ...editingCouncil, genere: e.target.value })}
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                  <input
                    style={{ ...styles.input, width: 100 }}
                    type="number"
                    placeholder="Ordine"
                    value={editingCouncil.ordine}
                    onChange={(e) => setEditingCouncil({ ...editingCouncil, ordine: Number(e.target.value) })}
                  />
                </div>
                <div style={styles.formRow}>
                  <button onClick={saveEditCouncil} style={styles.btnPrimary}>Salva</button>
                  <button onClick={cancelEditCouncil} style={styles.btn}>Annulla</button>
                </div>
              </div>
            ) : (
              <>
                <div style={styles.itemMeta}>
                  <div style={styles.itemName}>{c.nome}</div>
                  <div style={styles.itemSub}>Lista: <strong>{getListName(c.lista_id)}</strong></div>
                  <div style={styles.itemSub}>Genere: <strong>{c.genere}</strong></div>
                  <div style={styles.itemSub}>Ordine: <strong>{c.ordine ?? '-'}</strong></div>
                </div>
                <div>
                  <button onClick={() => startEditCouncil(c)} style={styles.editBtn}>Modifica</button>
                  <button onClick={() => deleteCouncilCandidate(c.id)} style={styles.smallBtn}>Elimina</button>
                </div>
              </>
            )}
          </div>
        ))}

        <h3 style={styles.cardTitleGreen}>Aggiungi consigliere</h3>
        <div style={styles.formRow}>
          <select
            style={styles.select}
            value={newCouncil.lista_id}
            onChange={(e) => setNewCouncil({ ...newCouncil, lista_id: e.target.value })}
          >
            <option value="">Seleziona lista</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>
          <input
            style={styles.input}
            placeholder="Nome consigliere"
            value={newCouncil.nome}
            onChange={(e) => setNewCouncil({ ...newCouncil, nome: e.target.value })}
          />
          <select
            style={styles.select}
            value={newCouncil.genere}
            onChange={(e) => setNewCouncil({ ...newCouncil, genere: e.target.value })}
          >
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
          <input
            style={{ ...styles.input, width: 100 }}
            type="number"
            placeholder="Ordine"
            value={newCouncil.ordine}
            onChange={(e) => setNewCouncil({ ...newCouncil, ordine: Number(e.target.value) })}
          />
          <button onClick={addCouncilCandidate} style={styles.btnPrimary}>Aggiungi Consigliere</button>
        </div>
      </div>
    )
  }

  function renderUsers() {
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Accessi</h2>

        <div style={styles.infoStrip}>
          <div style={styles.infoPill}>
            <div style={styles.infoPillLabel}>Utenti totali</div>
            <div style={styles.infoPillValue}>{users.length}</div>
          </div>
          <div style={styles.infoPill}>
            <div style={styles.infoPillLabel}>Limite massimo</div>
            <div style={styles.infoPillValue}>{MAX_USERS}</div>
          </div>
          <div style={styles.infoPill}>
            <div style={styles.infoPillLabel}>Attivi</div>
            <div style={styles.infoPillValue}>{users.filter((u) => u.active).length}</div>
          </div>
          <div style={styles.infoPill}>
            <div style={styles.infoPillLabel}>Disattivi</div>
            <div style={styles.infoPillValue}>{users.filter((u) => !u.active).length}</div>
          </div>
        </div>

        <div style={styles.hintBox}>
          Da qui puoi aggiungere utenti, cambiare password, scegliere l’accesso e attivare o disattivare gli account. Limite massimo: 5 utenti.
        </div>

        <div style={{ height: 18 }} />

        {users.map((u) => (
          <div key={u.id} style={styles.listCard}>
            {editingUserId === u.id ? (
              <div style={{ width: '100%' }}>
                <h3 style={styles.cardTitleOrange}>Modifica utente</h3>
                <div style={styles.formRow}>
                  <input
                    style={styles.input}
                    placeholder="Username"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  />
                  <input
                    style={styles.input}
                    placeholder="Password"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  />
                  <input
                    style={styles.input}
                    placeholder="Ruolo"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  />
                  <select
                    style={styles.select}
                    value={editingUser.access}
                    onChange={(e) => setEditingUser({ ...editingUser, access: e.target.value })}
                  >
                    {ACCESS_OPTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <select
                    style={styles.select}
                    value={editingUser.active ? 'true' : 'false'}
                    onChange={(e) => setEditingUser({ ...editingUser, active: e.target.value === 'true' })}
                  >
                    <option value="true">Attivo</option>
                    <option value="false">Disattivo</option>
                  </select>
                </div>
                <div style={styles.formRow}>
                  <button onClick={saveUser} style={styles.btnPrimary}>Salva utente</button>
                  <button onClick={cancelEditUser} style={styles.btn}>Annulla</button>
                </div>
              </div>
            ) : (
              <>
                <div style={styles.itemMeta}>
                  <div style={styles.itemName}>{u.username}</div>
                  <div style={styles.itemSub}>Ruolo: <strong>{u.role}</strong></div>
                  <div style={styles.itemSub}>Accesso: <strong>{u.access}</strong></div>
                  <div style={styles.itemSub}>Password: <strong>{u.password}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={u.active ? styles.tagGreen : styles.tagRed}>
                    {u.active ? 'Attivo' : 'Disattivo'}
                  </span>
                  <button onClick={() => startEditUser(u)} style={styles.editBtn}>Modifica</button>
                  <button onClick={() => toggleUserActive(u.id, u.active, u.username)} style={styles.btnMuted}>
                    {u.active ? 'Disattiva' : 'Attiva'}
                  </button>
                  <button onClick={() => deleteUser(u.id, u.username)} style={styles.smallBtn}>Elimina</button>
                </div>
              </>
            )}
          </div>
        ))}

        <h3 style={styles.cardTitleBlue}>Aggiungi utente</h3>
        <div style={styles.formRow}>
          <input
            style={styles.input}
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Ruolo"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          />
          <select
            style={styles.select}
            value={newUser.access}
            onChange={(e) => setNewUser({ ...newUser, access: e.target.value })}
          >
            {ACCESS_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            style={styles.select}
            value={newUser.active ? 'true' : 'false'}
            onChange={(e) => setNewUser({ ...newUser, active: e.target.value === 'true' })}
          >
            <option value="true">Attivo</option>
            <option value="false">Disattivo</option>
          </select>
          <button onClick={addUser} style={styles.btnPrimary} disabled={users.length >= MAX_USERS}>
            Aggiungi utente
          </button>
        </div>
      </div>
    )
  }

  function renderExport() {
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Export dati</h2>
        <div style={styles.actionsRow}>
          <button onClick={downloadCSV} style={styles.btnPrimary}>SCARICA BACKUP CSV</button>
          <button onClick={loadAll} style={styles.btn}>AGGIORNA DATI</button>
        </div>
      </div>
    )
  }

  function renderContent() {
    if (activeTab === 'dashboard') return renderDashboard()
    if (activeTab === 'results') return renderResults()
    if (activeTab === 'interviews') return renderInterviews()
    if (activeTab === 'mayors') return renderMayors()
    if (activeTab === 'lists') return renderLists()
    if (activeTab === 'councillors') return renderCouncillors()
    if (activeTab === 'users') return renderUsers()
    if (activeTab === 'export') return renderExport()
    return renderDashboard()
  }

  if (!authReady) return null

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'results', label: 'Risultati' },
    { key: 'interviews', label: 'Interviste' },
    { key: 'mayors', label: 'Sindaci' },
    { key: 'lists', label: 'Liste' },
    { key: 'councillors', label: 'Consiglieri' },
    { key: 'users', label: 'Accessi' },
    { key: 'export', label: 'Export dati' },
  ]

  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.brand}>
            <div style={styles.logoWrap}>
              <img src="/logo.png" alt="Radio StudioDue" style={styles.logo} />
            </div>
            <div>
              <div style={styles.brandTitle}>Admin</div>
              <div style={styles.brandSub}>Radio StudioDue</div>
            </div>
          </div>

          <div style={styles.nav}>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{ ...styles.navBtn, ...(activeTab === item.key ? styles.navBtnActive : {}) }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main style={styles.contentWrap}>
          <div style={styles.topbar}>
            <div>
              <h1 style={styles.topbarTitle}>Exit Poll Admin</h1>
              <p style={styles.topbarSub}>Elezioni Amministrative Centuripe 2026</p>
            </div>

            <div style={styles.topbarRight}>
              <div style={styles.userTag}>Utente: {authUser ? authUser.username : '-'}</div>
              <button onClick={handleLogout} style={styles.logoutBtn}>Esci</button>
            </div>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  )
}