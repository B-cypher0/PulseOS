import { useState, useEffect } from 'react'

const C = {
  bg: '#0a0e1a', card: '#111827', border: '#1f2937',
  purple: '#7c3aed', purpleLight: '#a78bfa',
  green: '#10b981', greenLight: '#6ee7b7',
  red: '#ef4444', redLight: '#fca5a5',
  amber: '#f59e0b', amberLight: '#fcd34d',
  blue: '#3b82f6', blueLight: '#93c5fd',
  text: '#f9fafb', muted: '#6b7280', sub: '#9ca3af',
}

const css = `
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes slideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .pulse { animation: pulse 1.5s infinite; }
  .slide { animation: slideIn 0.3s ease; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #111827; }
  ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
`

const TRIAGE_COLORS = { 1: C.red, 2: C.red, 3: C.amber, 4: C.green, 5: C.blue }
const TRIAGE_LABELS = { 1: 'Immediate', 2: 'Emergency', 3: 'Urgent', 4: 'Semi-urgent', 5: 'Non-urgent' }

const PATIENTS = [
  { id: 1, name: 'J. Nzama', age: 54, gender: 'M', bed: 'ICU-1', ward: 'ICU', triage: 1, admitted: '06:32', diagnosis: 'Cardiac arrest', hr: 138, spo2: 89, temp: 38.2, bp: '180/110', status: 'critical', nurse: 'S. Dlamini', doctor: 'Dr. K. Dube', alerts: 2 },
  { id: 2, name: 'M. Okonkwo', age: 31, gender: 'F', bed: 'ICU-2', ward: 'ICU', triage: 2, admitted: '07:15', diagnosis: 'RTA — multiple trauma', hr: 108, spo2: 96, temp: 37.8, bp: '140/90', status: 'serious', nurse: 'S. Dlamini', doctor: 'Dr. K. Dube', alerts: 1 },
  { id: 3, name: 'A. Botha', age: 67, gender: 'M', bed: 'GEN-A3', ward: 'General A', triage: 3, admitted: '08:00', diagnosis: 'Pneumonia', hr: 74, spo2: 97, temp: 37.4, bp: '130/85', status: 'stable', nurse: 'T. Mthembu', doctor: 'Dr. N. Khumalo', alerts: 0 },
  { id: 4, name: 'R. Sithole', age: 28, gender: 'F', bed: 'GEN-A7', ward: 'General A', triage: 4, admitted: '09:30', diagnosis: 'Appendicitis — post-op', hr: 82, spo2: 98, temp: 36.9, bp: '120/80', status: 'stable', nurse: 'T. Mthembu', doctor: 'Dr. N. Khumalo', alerts: 0 },
  { id: 5, name: 'T. Mahlangu', age: 72, gender: 'M', bed: 'GEN-B2', ward: 'General B', triage: 3, admitted: '07:45', diagnosis: 'Stroke — ischemic', hr: 91, spo2: 95, temp: 37.1, bp: '160/100', status: 'serious', nurse: 'Z. Mokoena', doctor: 'Dr. B. Ndlovu', alerts: 1 },
  { id: 6, name: 'N. Dlamini', age: 19, gender: 'F', bed: 'MAT-3', ward: 'Maternity', triage: 2, admitted: '05:20', diagnosis: 'Active labour', hr: 102, spo2: 99, temp: 37.0, bp: '125/82', status: 'monitoring', nurse: 'A. Ntuli', doctor: 'Dr. N. Khumalo', alerts: 0 },
  { id: 7, name: 'P. Van Wyk', age: 45, gender: 'M', bed: 'TRAUMA-1', ward: 'Trauma', triage: 1, admitted: '10:15', diagnosis: 'GSW — chest', hr: 144, spo2: 91, temp: 36.5, bp: '90/60', status: 'critical', nurse: 'S. Dlamini', doctor: 'Dr. B. Ndlovu', alerts: 3 },
  { id: 8, name: 'F. Khumalo', age: 58, gender: 'F', bed: 'GEN-B5', ward: 'General B', triage: 4, admitted: '11:00', diagnosis: 'Diabetes — glucose management', hr: 78, spo2: 97, temp: 36.8, bp: '135/88', status: 'stable', nurse: 'Z. Mokoena', doctor: 'Dr. K. Dube', alerts: 0 },
  { id: 9, name: 'S. Molefe', age: 34, gender: 'M', bed: 'EM-2', ward: 'Emergency', triage: 2, admitted: '11:30', diagnosis: 'Suspected MI', hr: 122, spo2: 93, temp: 37.6, bp: '170/105', status: 'serious', nurse: 'T. Mthembu', doctor: 'Dr. N. Khumalo', alerts: 2 },
  { id: 10, name: 'L. Pretorius', age: 81, gender: 'F', bed: 'GEN-A11', ward: 'General A', triage: 3, admitted: '08:45', diagnosis: 'Hip fracture — post-op', hr: 76, spo2: 96, temp: 37.2, bp: '128/82', status: 'stable', nurse: 'T. Mthembu', doctor: 'Dr. N. Khumalo', alerts: 0 },
  { id: 11, name: 'K. Zulu', age: 6, gender: 'M', bed: 'GEN-B8', ward: 'General B', triage: 3, admitted: '09:00', diagnosis: 'Severe dehydration', hr: 110, spo2: 98, temp: 38.5, bp: '100/65', status: 'monitoring', nurse: 'Z. Mokoena', doctor: 'Dr. K. Dube', alerts: 0 },
  { id: 12, name: 'W. Erasmus', age: 63, gender: 'M', bed: 'WAIT', ward: 'Waiting', triage: 3, admitted: '11:45', diagnosis: 'Chest pain — under assessment', hr: 98, spo2: 97, temp: 37.0, bp: '145/92', status: 'waiting', nurse: 'L. Pillay', doctor: '—', alerts: 0 },
]

const WARDS = ['All Wards', 'ICU', 'Emergency', 'Trauma', 'General A', 'General B', 'Maternity', 'Waiting']
const STATUS_FILTERS = ['All', 'critical', 'serious', 'monitoring', 'stable', 'waiting']

function VitalBadge({ label, value, alert }) {
  return (
    <div style={{ textAlign: 'center', background: alert ? `${C.red}18` : '#ffffff05', borderRadius: 6, padding: '4px 6px', border: `1px solid ${alert ? C.red + '44' : C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: alert ? C.red : C.text }}>{value}</div>
      <div style={{ fontSize: 9, color: C.muted }}>{label}</div>
    </div>
  )
}

function PatientCard({ patient, onClick }) {
  const triageColor = TRIAGE_COLORS[patient.triage]
  const statusStyles = {
    critical: { bg: `${C.red}15`, border: C.red + '66', dot: C.red, pulse: true },
    serious: { bg: `${C.amber}10`, border: C.amber + '44', dot: C.amber, pulse: false },
    monitoring: { bg: `${C.purple}10`, border: C.purple + '44', dot: C.purple, pulse: true },
    stable: { bg: '#ffffff05', border: C.border, dot: C.green, pulse: false },
    waiting: { bg: '#ffffff05', border: C.border, dot: C.sub, pulse: false },
  }
  const st = statusStyles[patient.status] || statusStyles.stable

  return (
    <div
      onClick={() => onClick(patient)}
      style={{ background: st.bg, border: `1px solid ${st.border}`, borderRadius: 12, padding: 12, cursor: 'pointer', transition: 'border-color .2s' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${triageColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: triageColor }}>T{patient.triage}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{patient.name}</span>
            <span style={{ fontSize: 10, color: C.muted }}>{patient.age}{patient.gender}</span>
            {patient.alerts > 0 && (
              <span className="pulse" style={{ fontSize: 9, background: `${C.red}22`, color: C.red, border: `1px solid ${C.red}44`, padding: '1px 5px', borderRadius: 10 }}>⚠ {patient.alerts}</span>
            )}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{patient.bed} · {patient.ward}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div className={st.pulse ? 'pulse' : ''} style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />
          <span style={{ fontSize: 10, color: st.dot, textTransform: 'capitalize' }}>{patient.status}</span>
        </div>
      </div>

      {/* Diagnosis */}
      <div style={{ fontSize: 10, color: C.sub, marginBottom: 8, padding: '4px 6px', background: '#ffffff05', borderRadius: 5 }}>{patient.diagnosis}</div>

      {/* Vitals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
        <VitalBadge label="HR" value={patient.hr} alert={patient.hr > 120 || patient.hr < 50} />
        <VitalBadge label="SpO2" value={`${patient.spo2}%`} alert={patient.spo2 < 94} />
        <VitalBadge label="Temp" value={`${patient.temp}°`} alert={patient.temp > 38} />
        <VitalBadge label="BP" value={patient.bp} alert={false} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 10, color: C.muted }}>👩‍⚕️ {patient.nurse}</span>
        <span style={{ fontSize: 10, color: C.muted }}>In: {patient.admitted}</span>
      </div>
    </div>
  )
}

function PatientDetail({ patient, onClose }) {
  if (!patient) return null
  const triageColor = TRIAGE_COLORS[patient.triage]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div className="slide" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, width: 420, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: `${triageColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: triageColor }}>T{patient.triage}</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.text }}>{patient.name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{patient.age} yrs · {patient.gender === 'M' ? 'Male' : 'Female'} · {TRIAGE_LABELS[patient.triage]}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { l: 'Bed', v: patient.bed },
            { l: 'Ward', v: patient.ward },
            { l: 'Admitted', v: patient.admitted },
            { l: 'Status', v: patient.status.toUpperCase() },
            { l: 'Doctor', v: patient.doctor },
            { l: 'Nurse', v: patient.nurse },
          ].map((r, i) => (
            <div key={i} style={{ background: '#ffffff05', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 10, color: C.muted }}>{r.l}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginTop: 2 }}>{r.v}</div>
            </div>
          ))}
        </div>

        <div style={{ background: `${C.purple}10`, border: `1px solid ${C.purple}33`, borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>Diagnosis</div>
          <div style={{ fontSize: 13, color: C.purpleLight }}>{patient.diagnosis}</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>Current vitals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { l: 'Heart rate', v: patient.hr + ' BPM', alert: patient.hr > 120 || patient.hr < 50 },
            { l: 'SpO2', v: patient.spo2 + '%', alert: patient.spo2 < 94 },
            { l: 'Temperature', v: patient.temp + '°C', alert: patient.temp > 38 },
            { l: 'Blood pressure', v: patient.bp, alert: false },
          ].map((v, i) => (
            <div key={i} style={{ background: v.alert ? `${C.red}15` : '#ffffff05', border: `1px solid ${v.alert ? C.red + '44' : C.border}`, borderRadius: 8, padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: v.alert ? C.red : C.text }}>{v.v}</div>
              <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{v.l}</div>
            </div>
          ))}
        </div>

        {patient.alerts > 0 && (
          <div style={{ background: `${C.red}10`, border: `1px solid ${C.red}33`, borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.red, marginBottom: 4 }}>⚠ {patient.alerts} active alert{patient.alerts > 1 ? 's' : ''}</div>
            <div style={{ fontSize: 11, color: C.redLight }}>Critical vitals flagged — attending nurse notified</div>
          </div>
        )}

        <button onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.muted, cursor: 'pointer', fontSize: 12 }}>Close</button>
      </div>
    </div>
  )
}

function BedMap({ patients }) {
  const bedStatus = (p) => {
    if (!p) return { bg: `${C.green}15`, border: `${C.green}44`, label: 'Available', color: C.green }
    const s = { critical: { bg: `${C.red}20`, border: `${C.red}66`, color: C.red }, serious: { bg: `${C.amber}15`, border: `${C.amber}55`, color: C.amber }, monitoring: { bg: `${C.purple}15`, border: `${C.purple}55`, color: C.purple }, stable: { bg: `${C.blue}12`, border: `${C.blue}44`, color: C.blue }, waiting: { bg: '#ffffff08', border: C.border, color: C.sub } }
    return s[p.status] || s.stable
  }

  const beds = Array.from({ length: 20 }, (_, i) => {
    const bedNum = i + 1
    const patient = patients.find(p => p.id === bedNum % patients.length + 1 && i < patients.length) || (i < patients.length ? patients[i] : null)
    return { num: bedNum, patient: i < patients.length ? patients[i] : null }
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 5 }}>
      {beds.map((b, i) => {
        const s = bedStatus(b.patient)
        return (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, padding: '5px 3px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: s.color, fontWeight: 500 }}>{b.patient ? b.patient.name.split(' ')[0] : '—'}</div>
            <div style={{ fontSize: 8, color: C.muted, marginTop: 1 }}>B{b.num}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function PatientBoard() {
  const [patients, setPatients] = useState(PATIENTS)
  const [filterWard, setFilterWard] = useState('All Wards')
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('cards')

  // Live vitals updates
  useEffect(() => {
    const t = setInterval(() => {
      setPatients(prev => prev.map(p => ({
        ...p,
        hr: Math.max(40, Math.min(160, p.hr + Math.round((Math.random() - .5) * 4))),
        spo2: Math.max(85, Math.min(100, p.spo2 + Math.round((Math.random() - .3) * 1))),
      })))
    }, 2000)
    return () => clearInterval(t)
  }, [])

  const filtered = patients.filter(p => {
    const wardMatch = filterWard === 'All Wards' || p.ward === filterWard
    const statusMatch = filterStatus === 'All' || p.status === filterStatus
    const searchMatch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.diagnosis.toLowerCase().includes(search.toLowerCase())
    return wardMatch && statusMatch && searchMatch
  })

  const critical = patients.filter(p => p.status === 'critical').length
  const serious = patients.filter(p => p.status === 'serious').length
  const stable = patients.filter(p => p.status === 'stable').length
  const alerts = patients.reduce((a, p) => a + p.alerts, 0)

  return (
    <>
      <style>{css}</style>
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: '#0d1117' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: C.red }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>PulseOS</span>
            <span style={{ fontSize: 11, color: C.muted }}>Patient Board</span>
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#ffffff08', borderRadius: 8, padding: 3 }}>
            {['cards', 'bed map'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, background: view === v ? '#ffffff18' : 'none', color: view === v ? C.text : C.muted }}>
                {v === 'cards' ? '⊞ Cards' : '⊟ Bed map'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', minHeight: 'calc(100vh - 49px)' }}>

          {/* Main */}
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[
                { val: patients.length, label: 'Total patients', color: C.text },
                { val: critical, label: 'Critical', color: C.red },
                { val: serious, label: 'Serious', color: C.amber },
                { val: alerts, label: 'Active alerts', color: C.red },
              ].map((s, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${s.color === C.text ? C.border : s.color + '44'}`, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 24, fontWeight: 600, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Triage legend */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(TRIAGE_LABELS).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.muted }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: TRIAGE_COLORS[k] }} />
                  T{k} {v}
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patient or diagnosis..."
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', color: C.text, fontSize: 12, outline: 'none', width: 220 }}
              />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {STATUS_FILTERS.map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{ fontSize: 10, padding: '4px 9px', borderRadius: 6, border: `1px solid ${filterStatus === s ? C.red : C.border}`, background: filterStatus === s ? `${C.red}18` : 'none', color: filterStatus === s ? C.redLight : C.muted, cursor: 'pointer', textTransform: 'capitalize' }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Ward filter */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {WARDS.map(w => (
                <button key={w} onClick={() => setFilterWard(w)} style={{ fontSize: 10, padding: '4px 9px', borderRadius: 6, border: `1px solid ${filterWard === w ? C.purple : C.border}`, background: filterWard === w ? `${C.purple}18` : 'none', color: filterWard === w ? C.purpleLight : C.muted, cursor: 'pointer' }}>{w}</button>
              ))}
            </div>

            {/* Content */}
            {view === 'cards' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 10 }}>
                {filtered.map(p => <PatientCard key={p.id} patient={p} onClick={setSelected} />)}
                {filtered.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: C.muted, padding: 40, fontSize: 13 }}>No patients match your filters</div>}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Bed occupancy — click a card to see patient details</div>
                <BedMap patients={filtered} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ borderLeft: `1px solid ${C.border}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

            {/* Critical alerts */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Critical alerts</div>
              {patients.filter(p => p.alerts > 0).map(p => (
                <div key={p.id} onClick={() => setSelected(p)} style={{ padding: '7px 10px', background: `${C.red}10`, border: `1px solid ${C.red}33`, borderRadius: 8, marginBottom: 5, cursor: 'pointer' }}>
                  <div className="pulse" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: C.red }}>{p.name}</span>
                    <span style={{ fontSize: 10, color: C.muted, marginLeft: 'auto' }}>{p.bed}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.redLight }}>{p.diagnosis}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>HR {p.hr} · SpO2 {p.spo2}%</div>
                </div>
              ))}
              {patients.filter(p => p.alerts > 0).length === 0 && (
                <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', padding: '12px 0' }}>✓ No active alerts</div>
              )}
            </div>

            {/* Ward breakdown */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Ward breakdown</div>
              {['ICU', 'Emergency', 'Trauma', 'General A', 'General B', 'Maternity', 'Waiting'].map(w => {
                const count = patients.filter(p => p.ward === w).length
                const crit = patients.filter(p => p.ward === w && p.status === 'critical').length
                return (
                  <div key={w} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 11, color: C.sub }}>{w}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {crit > 0 && <span style={{ fontSize: 9, color: C.red, background: `${C.red}18`, padding: '1px 5px', borderRadius: 10 }}>⚠ {crit}</span>}
                      <span style={{ fontSize: 11, fontWeight: 500, color: count > 0 ? C.text : C.muted }}>{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick stats */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Live averages</div>
              {[
                { label: 'Avg heart rate', val: Math.round(patients.reduce((a, p) => a + p.hr, 0) / patients.length) + ' BPM' },
                { label: 'Avg SpO2', val: (patients.reduce((a, p) => a + p.spo2, 0) / patients.length).toFixed(1) + '%' },
                { label: 'Patients stable', val: `${stable}/${patients.length}` },
                { label: 'Triage 1 & 2', val: patients.filter(p => p.triage <= 2).length },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selected && <PatientDetail patient={selected} onClose={() => setSelected(null)} />}
      </div>
    </>
  )
}