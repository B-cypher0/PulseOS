import { useState, useEffect, useRef } from 'react'

const COLORS = {
  bg: '#0a0e1a', card: '#111827', border: '#1f2937',
  purple: '#7c3aed', purpleLight: '#a78bfa',
  green: '#10b981', greenLight: '#6ee7b7',
  red: '#ef4444', redLight: '#fca5a5',
  amber: '#f59e0b', amberLight: '#fcd34d',
  blue: '#3b82f6', blueLight: '#93c5fd',
  text: '#f9fafb', textMuted: '#6b7280', textSub: '#9ca3af',
}

const css = `
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  .pulse { animation: pulse 1.5s infinite; }
  .fadein { animation: fadeIn 0.4s ease; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0e1a; color: #f9fafb; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #111827; }
  ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
`

function StatCard({ value, label, delta, deltaColor }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '14px 16px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 26, fontWeight: 600, color: COLORS.text }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{label}</div>
      {delta && <div style={{ fontSize: 10, color: deltaColor || COLORS.green, marginTop: 5 }}>{delta}</div>}
    </div>
  )
}

function AlertItem({ color, title, sub, time, pulse }) {
  return (
    <div className="fadein" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: `${color}11`, border: `1px solid ${color}33`, borderRadius: 8, marginBottom: 5 }}>
      <div className={pulse ? 'pulse' : ''} style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color }}>{title}</div>
        <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 10, color: COLORS.textMuted, flexShrink: 0 }}>{time}</div>
    </div>
  )
}

function StaffRow({ initials, name, role, hr, color }) {
  const pct = Math.min(100, (hr / 160) * 100)
  const hrColor = hr > 110 ? COLORS.red : hr > 90 ? COLORS.amber : COLORS.green
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: '#ffffff08', borderRadius: 8, marginBottom: 4 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${color}22`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 10, color: COLORS.textMuted }}>{role}</div>
      </div>
      <div style={{ width: 40, height: 4, background: '#ffffff15', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: hrColor, borderRadius: 2, transition: 'width 1.5s ease' }} />
      </div>
      <div style={{ fontSize: 10, color: hrColor, width: 24, textAlign: 'right', flexShrink: 0 }}>{hr}</div>
    </div>
  )
}

function VitalRow({ name, bed, hr, spo2, flag }) {
  const flagColor = flag === 'critical' ? COLORS.red : flag === 'warning' ? COLORS.amber : COLORS.green
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: '#ffffff05', border: `1px solid ${COLORS.border}`, borderRadius: 8, marginBottom: 4 }}>
      <div className={flag === 'critical' ? 'pulse' : ''} style={{ width: 7, height: 7, borderRadius: '50%', background: flagColor, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 10, color: COLORS.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bed} — {name}</div>
      <div style={{ fontSize: 11, fontWeight: 500, color: flagColor, minWidth: 32, textAlign: 'right' }}>{hr}</div>
      <div style={{ fontSize: 10, color: COLORS.textMuted, minWidth: 30, textAlign: 'right' }}>{spo2}%</div>
    </div>
  )
}

function AmbRow({ unit, status, info, hr, eta, progress, color }) {
  return (
    <div style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 10, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14 }}>🚑</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.text }}>{unit} — {status}</div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color }}>{hr}</div>
          <div style={{ fontSize: 10, color: COLORS.textMuted }}>{eta}</div>
        </div>
      </div>
      {progress > 0 && (
        <div style={{ marginTop: 6, height: 3, background: '#ffffff10', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: color, borderRadius: 2, transition: 'width 2s linear' }} />
        </div>
      )}
    </div>
  )
}

function FloorMap({ dots }) {
  const wards = [
    { label: 'Emergency', x: 8, y: 8, w: 120, h: 80, color: COLORS.purple },
    { label: 'ICU', x: 136, y: 8, w: 100, h: 80, color: COLORS.green },
    { label: 'General A', x: 244, y: 8, w: 110, h: 80, color: COLORS.amber },
    { label: 'Trauma', x: 8, y: 96, w: 120, h: 76, color: COLORS.red },
    { label: 'Maternity', x: 136, y: 96, w: 100, h: 76, color: COLORS.purple },
    { label: 'General B', x: 244, y: 96, w: 110, h: 76, color: COLORS.blue },
  ]
  return (
    <div style={{ position: 'relative', height: 180, background: '#ffffff03', border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' }}>
      {wards.map((w, i) => (
        <div key={i} style={{ position: 'absolute', left: w.x, top: w.y, width: w.w, height: w.h, border: `1px solid ${w.color}44`, borderRadius: 6, background: `${w.color}08` }}>
          <span style={{ fontSize: 9, color: `${w.color}99`, padding: '4px 6px', display: 'block' }}>{w.label}</span>
        </div>
      ))}
      {dots.map((d, i) => (
        <div key={i} style={{ position: 'absolute', left: d.x, top: d.y, width: 10, height: 10, borderRadius: '50%', background: d.color, boxShadow: `0 0 5px ${d.color}88`, transition: 'left 2s ease, top 2s ease' }} />
      ))}
    </div>
  )
}

const SLabel = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>{children}</div>
)

export default function LiveDashboard() {
  const [time, setTime] = useState(new Date())
  const [mode, setMode] = useState('demo')
  const [dots, setDots] = useState([])
  const [alerts, setAlerts] = useState([
    { id: 1, color: COLORS.red, title: 'SpO2 critical — Bed 7', sub: '89% · Nurse Dlamini notified', time: 'now', pulse: true },
    { id: 2, color: COLORS.amber, title: 'Task overdue — Meds Bay 3', sub: '14 min overdue · Escalated', time: '2m', pulse: false },
    { id: 3, color: COLORS.purple, title: 'Ambulance incoming — ETA 6m', sub: 'Trauma Bay 2 prepped', time: '3m', pulse: false },
    { id: 4, color: COLORS.green, title: 'Patient discharged — Bed 12', sub: 'Cleaning task sent', time: '5m', pulse: false },
  ])
  const [staff, setStaff] = useState([
    { initials: 'NK', name: 'N. Khumalo', role: 'Doctor · Emergency', hr: 72, color: COLORS.purple },
    { initials: 'SD', name: 'S. Dlamini', role: 'Nurse · ICU', hr: 89, color: COLORS.green },
    { initials: 'TM', name: 'T. Mthembu', role: 'Nurse · General A', hr: 68, color: COLORS.red },
    { initials: 'LP', name: 'L. Pillay', role: 'Receptionist', hr: 64, color: COLORS.amber },
  ])
  const [vitals, setVitals] = useState([
    { name: 'J. Nzama', bed: 'Bed 7', hr: 138, spo2: 89, flag: 'critical' },
    { name: 'M. Okonkwo', bed: 'Bed 3', hr: 108, spo2: 96, flag: 'warning' },
    { name: 'A. Botha', bed: 'Bed 11', hr: 74, spo2: 98, flag: 'normal' },
    { name: 'R. Sithole', bed: 'Bed 15', hr: 82, spo2: 97, flag: 'normal' },
  ])
  const [amb1Progress, setAmb1Progress] = useState(65)
  const [amb1ETA, setAmb1ETA] = useState(6)
  const alertIdx = useRef(0)

  const alertPool = [
    { color: COLORS.red, title: 'Fall detected — Ward B', sub: 'Guard notified', pulse: true },
    { color: COLORS.purple, title: 'Lab results ready — Bed 3', sub: 'Dr Khumalo alerted', pulse: false },
    { color: COLORS.amber, title: 'Blood bank low — O-neg', sub: '2 units remaining', pulse: false },
    { color: COLORS.green, title: 'Theatre 2 ready', sub: 'Surgeon en route', pulse: false },
  ]

  const wardBounds = [
    { x: [18, 118], y: [18, 78] }, { x: [146, 226], y: [18, 78] }, { x: [254, 344], y: [18, 78] },
    { x: [18, 118], y: [106, 162] }, { x: [146, 226], y: [106, 162] }, { x: [254, 344], y: [106, 162] },
  ]
  const dotColors = [COLORS.purple, COLORS.green, COLORS.red, COLORS.amber, COLORS.blue, COLORS.purpleLight, COLORS.greenLight]

  useEffect(() => {
    setDots(Array.from({ length: 12 }, (_, i) => {
      const w = wardBounds[i % 6]
      return { x: w.x[0] + Math.random() * (w.x[1] - w.x[0]), y: w.y[0] + Math.random() * (w.y[1] - w.y[0]), color: dotColors[i % dotColors.length], ward: i % 6 }
    }))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setStaff(prev => prev.map(s => ({ ...s, hr: Math.max(50, Math.min(140, s.hr + Math.round((Math.random() - .5) * 6))) })))
      setVitals(prev => prev.map(v => ({ ...v, hr: Math.max(40, Math.min(160, v.hr + Math.round((Math.random() - .5) * 5))), spo2: Math.max(85, Math.min(100, v.spo2 + Math.round((Math.random() - .3) * 1))) })))
      setAmb1Progress(p => Math.min(100, p + Math.random() * 2))
      setAmb1ETA(p => Math.max(0, p - .1))
    }, 1800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setDots(prev => prev.map(d => {
        if (Math.random() < .3) {
          const w = wardBounds[d.ward]
          return { ...d, x: w.x[0] + Math.random() * (w.x[1] - w.x[0]), y: w.y[0] + Math.random() * (w.y[1] - w.y[0]) }
        }
        return d
      }))
    }, 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      const a = alertPool[alertIdx.current % alertPool.length]
      alertIdx.current++
      setAlerts(prev => [{ ...a, id: Date.now(), time: 'now' }, ...prev.slice(0, 4)])
    }, 8000)
    return () => clearInterval(t)
  }, [])

  const pad = n => String(n).padStart(2, '0')
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`

  return (
    <>
      <style>{css}</style>
      <div style={{ background: COLORS.bg, minHeight: '100vh', color: COLORS.text }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}`, background: '#0d1117' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.green }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>PulseOS</span>
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>Admin Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 3, background: '#ffffff08', borderRadius: 8, padding: 3 }}>
              {['demo', 'live'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{ padding: '3px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, background: mode === m ? '#ffffff18' : 'none', color: mode === m ? COLORS.text : COLORS.textMuted }}>
                  {m === 'demo' ? 'Demo mode' : 'Live mode'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${COLORS.green}18`, border: `1px solid ${COLORS.green}44`, borderRadius: 20, padding: '3px 10px', fontSize: 10, color: COLORS.greenLight }}>
              <div className="pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.green }} />
              {mode === 'demo' ? 'Animating' : 'Supabase connected'}
            </div>
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace' }}>{timeStr}</span>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', height: 'calc(100vh - 49px)' }}>

          {/* Left */}
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <StatCard value="18" label="Staff clocked in" delta="↑ 3 since 06:00" deltaColor={COLORS.green} />
              <StatCard value="47" label="Active patients" delta="⚠ 4 critical" deltaColor={COLORS.red} />
              <StatCard value="12" label="Open tasks" delta="⚠ 3 overdue" deltaColor={COLORS.amber} />
              <StatCard value="9" label="Beds available" delta="◆ 2 cleaning" deltaColor={COLORS.purpleLight} />
            </div>
            <div>
              <SLabel>Live floor map</SLabel>
              <FloorMap dots={dots} />
            </div>
            <div>
              <SLabel>Ambulances</SLabel>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '10px 12px' }}>
                <AmbRow unit="Unit 1" status="En route" info="Male 54 · Chest pain · Trauma Bay 2" hr={`HR ${Math.round(138 + Math.random() * 4)}`} eta={`ETA ${Math.round(amb1ETA)} min`} progress={amb1Progress} color={COLORS.red} />
                <AmbRow unit="Unit 2" status="On scene" info="Female 31 · RTA · Loading patient" hr="HR 98" eta="ETA 18 min" progress={20} color={COLORS.purple} />
                <AmbRow unit="Unit 3" status="Available" info="Standby · Station 4" hr="Ready" eta="Parked" progress={0} color={COLORS.green} />
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ borderLeft: `1px solid ${COLORS.border}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            <div>
              <SLabel>Live alerts</SLabel>
              {alerts.map(a => <AlertItem key={a.id} {...a} />)}
            </div>
            <div>
              <SLabel>Staff on duty</SLabel>
              {staff.map((s, i) => <StaffRow key={i} {...s} />)}
            </div>
            <div>
              <SLabel>Patient vitals</SLabel>
              {vitals.map((v, i) => <VitalRow key={i} {...v} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}