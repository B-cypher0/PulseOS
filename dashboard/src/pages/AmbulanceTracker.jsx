import { useState, useEffect, useRef } from 'react'

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
  @keyframes ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.5);opacity:0} }
  @keyframes drive { 0%{transform:translateX(0)} 50%{transform:translateX(3px)} 100%{transform:translateX(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .pulse { animation: pulse 1.5s infinite; }
  .ping { animation: ping 1.5s infinite; }
  .drive { animation: drive 0.8s infinite; }
  .slide { animation: slideIn 0.3s ease; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #111827; }
  ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
`

const INITIAL_UNITS = [
  {
    id: 1, unit: 'AMB-1', status: 'en_route', crew: 'P. Mahlangu + J. Dube',
    patient: { name: 'Male, 54', condition: 'Chest pain — suspected MI', hr: 142, spo2: 91, bp: '180/110', temp: 37.2 },
    destination: 'Trauma Bay 2', eta: 6, progress: 65, color: C.red,
    lat: 0.3, lng: 0.6, speed: 80, distance: '4.2 km',
  },
  {
    id: 2, unit: 'AMB-2', status: 'on_scene', crew: 'R. Nkosi + T. Cele',
    patient: { name: 'Female, 31', condition: 'RTA — multiple trauma', hr: 98, spo2: 96, bp: '140/90', temp: 36.8 },
    destination: 'Emergency Bay 1', eta: 18, progress: 15, color: C.amber,
    lat: 0.7, lng: 0.3, speed: 0, distance: '11.3 km',
  },
  {
    id: 3, unit: 'AMB-3', status: 'available', crew: 'S. Mthembu + K. Zulu',
    patient: null,
    destination: 'Station 4', eta: null, progress: 0, color: C.green,
    lat: 0.15, lng: 0.8, speed: 0, distance: '—',
  },
  {
    id: 4, unit: 'AMB-4', status: 'returning', crew: 'B. Khumalo + N. Dlamini',
    patient: null,
    destination: 'Base station', eta: 8, progress: 40, color: C.blue,
    lat: 0.85, lng: 0.55, speed: 60, distance: '6.1 km',
  },
  {
    id: 5, unit: 'AMB-5', status: 'available', crew: 'L. Pillay + A. Ntuli',
    patient: null,
    destination: 'Station 2', eta: null, progress: 0, color: C.green,
    lat: 0.5, lng: 0.15, speed: 0, distance: '—',
  },
]

const STATUS_CONFIG = {
  en_route: { label: 'En route', color: C.red, bg: `${C.red}18`, border: `${C.red}44`, pulse: true },
  on_scene: { label: 'On scene', color: C.amber, bg: `${C.amber}15`, border: `${C.amber}44`, pulse: true },
  available: { label: 'Available', color: C.green, bg: `${C.green}12`, border: `${C.green}33`, pulse: false },
  returning: { label: 'Returning', color: C.blue, bg: `${C.blue}12`, border: `${C.blue}33`, pulse: false },
}

function MapDot({ unit, selected, onClick }) {
  const sc = STATUS_CONFIG[unit.status]
  return (
    <div
      onClick={() => onClick(unit)}
      style={{ position: 'absolute', left: `${unit.lat * 100}%`, top: `${unit.lng * 100}%`, transform: 'translate(-50%,-50%)', cursor: 'pointer', zIndex: selected ? 10 : 5 }}
    >
      {/* Ping ring for active units */}
      {sc.pulse && (
        <div className="ping" style={{ position: 'absolute', inset: -6, borderRadius: '50%', background: sc.color + '33', pointerEvents: 'none' }} />
      )}
      {/* Main dot */}
      <div style={{ width: selected ? 22 : 16, height: selected ? 22 : 16, borderRadius: '50%', background: sc.color, border: `2px solid ${selected ? '#fff' : sc.color + '88'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', boxShadow: selected ? `0 0 12px ${sc.color}` : `0 0 6px ${sc.color}66` }}>
        <span style={{ fontSize: selected ? 10 : 8, fontWeight: 700, color: '#fff' }}>{unit.id}</span>
      </div>
      {/* Label */}
      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 3, fontSize: 8, color: sc.color, whiteSpace: 'nowrap', background: C.bg + 'dd', padding: '1px 4px', borderRadius: 4 }}>{unit.unit}</div>
    </div>
  )
}

function LiveMap({ units, selected, onSelect }) {
  // Road grid lines
  const hLines = [20, 40, 60, 80]
  const vLines = [25, 50, 75]

  return (
    <div style={{ position: 'relative', background: '#0d1520', borderRadius: 12, overflow: 'hidden', height: 280, border: `1px solid ${C.border}` }}>
      {/* Grid roads */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {hLines.map(y => <line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#1f2937" strokeWidth="1" />)}
        {vLines.map(x => <line key={x} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#1f2937" strokeWidth="1" />)}
        {/* Major roads */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#374151" strokeWidth="2" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#374151" strokeWidth="2" />
      </svg>

      {/* Hospital marker */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 2 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1e3a5f', border: `2px solid ${C.blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 14 }}>🏥</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 8, color: C.blue, marginTop: 2, whiteSpace: 'nowrap' }}>PulseOS Hospital</div>
      </div>

      {/* Route lines for en-route units */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {units.filter(u => u.status === 'en_route').map(u => (
          <line
            key={u.id}
            x1={`${u.lat * 100}%`} y1={`${u.lng * 100}%`}
            x2="50%" y2="50%"
            stroke={u.color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"
          />
        ))}
      </svg>

      {/* Unit dots */}
      {units.map(u => <MapDot key={u.id} unit={u} selected={selected?.id === u.id} onClick={onSelect} />)}

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 8 }}>
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: v.color }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: v.color }} />
            {v.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function VitalChip({ label, value, alert }) {
  return (
    <div style={{ background: alert ? `${C.red}18` : '#ffffff08', border: `1px solid ${alert ? C.red + '55' : C.border}`, borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: alert ? C.red : C.text }}>{value}</div>
      <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>{label}</div>
    </div>
  )
}

function UnitCard({ unit, selected, onClick }) {
  const sc = STATUS_CONFIG[unit.status]
  return (
    <div
      onClick={() => onClick(unit)}
      style={{ background: selected ? sc.bg : C.card, border: `1px solid ${selected ? sc.color + '66' : C.border}`, borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'all .2s' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div className={unit.status === 'en_route' ? 'drive' : ''} style={{ fontSize: 22 }}>🚑</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{unit.unit}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 20, padding: '2px 8px' }}>
              <div className={sc.pulse ? 'pulse' : ''} style={{ width: 5, height: 5, borderRadius: '50%', background: sc.color }} />
              <span style={{ fontSize: 10, color: sc.color }}>{sc.label}</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>👨‍⚕️ {unit.crew}</div>
        </div>
        {unit.speed > 0 && <div style={{ fontSize: 11, color: C.sub, textAlign: 'right' }}><div style={{ fontWeight: 500, color: C.text }}>{unit.speed}</div><div style={{ fontSize: 9 }}>km/h</div></div>}
      </div>

      {/* Destination & ETA */}
      <div style={{ display: 'flex', justify: 'space-between', gap: 8, marginBottom: unit.patient ? 10 : 0 }}>
        <div style={{ flex: 1, background: '#ffffff06', borderRadius: 8, padding: '6px 8px' }}>
          <div style={{ fontSize: 9, color: C.muted }}>Destination</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: C.text, marginTop: 1 }}>{unit.destination}</div>
        </div>
        {unit.eta && (
          <div style={{ background: `${sc.color}15`, border: `1px solid ${sc.color}33`, borderRadius: 8, padding: '6px 10px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: sc.color }}>{Math.round(unit.eta)}</div>
            <div style={{ fontSize: 9, color: C.muted }}>min ETA</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {unit.progress > 0 && (
        <div style={{ height: 3, background: '#ffffff0a', borderRadius: 2, overflow: 'hidden', marginBottom: unit.patient ? 10 : 0, marginTop: 6 }}>
          <div style={{ height: '100%', width: `${unit.progress}%`, background: sc.color, borderRadius: 2, transition: 'width 2s linear' }} />
        </div>
      )}

      {/* Patient vitals */}
      {unit.patient && (
        <div style={{ background: `${C.red}08`, border: `1px solid ${C.red}22`, borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: C.redLight, marginBottom: 6 }}>🧑‍🦽 {unit.patient.name}</div>
          <div style={{ fontSize: 10, color: C.sub, marginBottom: 8 }}>{unit.patient.condition}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
            <VitalChip label="HR" value={unit.patient.hr} alert={unit.patient.hr > 120 || unit.patient.hr < 50} />
            <VitalChip label="SpO2" value={`${unit.patient.spo2}%`} alert={unit.patient.spo2 < 94} />
            <VitalChip label="Temp" value={`${unit.patient.temp}°`} alert={unit.patient.temp > 38} />
            <VitalChip label="BP" value={unit.patient.bp} alert={false} />
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: C.amber, background: `${C.amber}10`, border: `1px solid ${C.amber}33`, borderRadius: 6, padding: '4px 8px' }}>
            ⚡ Doctor pre-brief active — receiving team notified
          </div>
        </div>
      )}
    </div>
  )
}

export default function AmbulanceTracker() {
  const [units, setUnits] = useState(INITIAL_UNITS)
  const [selected, setSelected] = useState(INITIAL_UNITS[0])
  const [dispatch, setDispatch] = useState([
    { id: 1, time: '10:15', unit: 'AMB-1', call: 'Chest pain — Berea Road', status: 'active' },
    { id: 2, time: '09:45', unit: 'AMB-2', call: 'RTA — N3 Southbound', status: 'active' },
    { id: 3, time: '08:30', unit: 'AMB-3', call: 'Fall — elderly patient', status: 'completed' },
    { id: 4, time: '07:55', unit: 'AMB-4', call: 'Respiratory distress', status: 'completed' },
  ])

  // Live updates
  useEffect(() => {
    const t = setInterval(() => {
      setUnits(prev => prev.map(u => {
        if (u.status === 'en_route') {
          const newProgress = Math.min(100, u.progress + Math.random() * 1.5)
          const newETA = Math.max(0, u.eta - 0.05)
          const newPatient = u.patient ? {
            ...u.patient,
            hr: Math.max(60, Math.min(180, u.patient.hr + Math.round((Math.random() - .4) * 4))),
            spo2: Math.max(85, Math.min(100, u.patient.spo2 + Math.round((Math.random() - .3) * 1))),
          } : null
          // Move dot toward hospital (0.5, 0.5)
          const newLat = u.lat + (0.5 - u.lat) * 0.02
          const newLng = u.lng + (0.5 - u.lng) * 0.02
          return { ...u, progress: newProgress, eta: newETA, patient: newPatient, lat: newLat, lng: newLng }
        }
        if (u.status === 'returning') {
          return { ...u, eta: Math.max(0, u.eta - 0.05), progress: Math.min(100, u.progress + 0.5) }
        }
        return u
      }))
    }, 1500)
    return () => clearInterval(t)
  }, [])

  // Keep selected in sync
  useEffect(() => {
    if (selected) {
      setSelected(prev => units.find(u => u.id === prev.id) || prev)
    }
  }, [units])

  const enRoute = units.filter(u => u.status === 'en_route').length
  const onScene = units.filter(u => u.status === 'on_scene').length
  const available = units.filter(u => u.status === 'available').length

  return (
    <>
      <style>{css}</style>
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: '#0d1117' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: C.red }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>PulseOS</span>
            <span style={{ fontSize: 11, color: C.muted }}>Ambulance Tracker</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[{ val: enRoute, label: 'En route', color: C.red }, { val: onScene, label: 'On scene', color: C.amber }, { val: available, label: 'Available', color: C.green }].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                <span style={{ color: s.color, fontWeight: 500 }}>{s.val}</span>
                <span style={{ color: C.muted }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 'calc(100vh - 49px)' }}>

          {/* Left */}
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

            {/* Live map */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Live GPS map</div>
              <LiveMap units={units} selected={selected} onSelect={setSelected} />
            </div>

            {/* Unit cards */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Fleet status</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 10 }}>
                {units.map(u => <UnitCard key={u.id} unit={u} selected={selected?.id === u.id} onClick={setSelected} />)}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ borderLeft: `1px solid ${C.border}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

            {/* Selected unit detail */}
            {selected && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Selected — {selected.unit}</div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
                  {[
                    { l: 'Status', v: STATUS_CONFIG[selected.status].label },
                    { l: 'Crew', v: selected.crew },
                    { l: 'Destination', v: selected.destination },
                    { l: 'ETA', v: selected.eta ? `${Math.round(selected.eta)} min` : '—' },
                    { l: 'Speed', v: selected.speed > 0 ? `${selected.speed} km/h` : 'Stationary' },
                    { l: 'Distance', v: selected.distance },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 11, color: C.muted }}>{r.l}</span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{r.v}</span>
                    </div>
                  ))}
                </div>

                {selected.patient && (
                  <div style={{ marginTop: 10, background: `${C.red}10`, border: `1px solid ${C.red}33`, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.redLight, marginBottom: 8 }}>Patient in transit</div>
                    <div style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{selected.patient.name}</div>
                    <div style={{ fontSize: 11, color: C.sub, marginBottom: 10 }}>{selected.patient.condition}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <VitalChip label="Heart rate" value={`${selected.patient.hr} BPM`} alert={selected.patient.hr > 120} />
                      <VitalChip label="SpO2" value={`${selected.patient.spo2}%`} alert={selected.patient.spo2 < 94} />
                      <VitalChip label="Temperature" value={`${selected.patient.temp}°C`} alert={false} />
                      <VitalChip label="Blood pressure" value={selected.patient.bp} alert={false} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dispatch log */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Dispatch log</div>
              {dispatch.map(d => (
                <div key={d.id} style={{ padding: '7px 10px', background: d.status === 'active' ? `${C.red}08` : '#ffffff04', border: `1px solid ${d.status === 'active' ? C.red + '33' : C.border}`, borderRadius: 8, marginBottom: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 500, color: d.status === 'active' ? C.red : C.muted }}>{d.unit}</span>
                    <span style={{ fontSize: 10, color: C.muted }}>{d.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: d.status === 'active' ? C.text : C.sub }}>{d.call}</div>
                  <div style={{ fontSize: 9, color: d.status === 'active' ? C.amber : C.green, marginTop: 2 }}>{d.status === 'active' ? '● Active' : '✓ Completed'}</div>
                </div>
              ))}
            </div>

            {/* Response stats */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Today's stats</div>
              {[
                { label: 'Calls responded', val: '7' },
                { label: 'Avg response time', val: '8.4 min' },
                { label: 'Fastest response', val: '4.1 min' },
                { label: 'Fleet available', val: `${available}/${units.length}` },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}