import { useState, useEffect } from 'react'

const C = {
  bg: '#0a0e1a', card: '#111827', border: '#1f2937',
  purple: '#7c3aed', purpleLight: '#a78bfa',
  green: '#10b981', greenLight: '#6ee7b7',
  red: '#ef4444', amber: '#f59e0b',
  blue: '#3b82f6', text: '#f9fafb',
  muted: '#6b7280', sub: '#9ca3af',
}

const css = `
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  .pulse { animation: pulse 1.5s infinite; }
  .slide { animation: slideIn 0.3s ease; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
`

const ROLES = ['All', 'Doctor', 'Nurse', 'Receptionist', 'Security', 'Paramedic']
const WARDS = ['All Wards', 'Emergency', 'ICU', 'General A', 'General B', 'Trauma', 'Maternity']

const STAFF_DATA = [
  { id: 1, initials: 'NK', name: 'Dr. N. Khumalo', role: 'Doctor', ward: 'Emergency', hr: 72, temp: 36.6, status: 'active', tasks: 3, tasksCompleted: 8, clockIn: '07:02', location: 'Bay 3', wellness: 'green' },
  { id: 2, initials: 'SD', name: 'S. Dlamini', role: 'Nurse', ward: 'ICU', hr: 94, temp: 36.9, status: 'active', tasks: 5, tasksCompleted: 6, clockIn: '06:45', location: 'ICU Desk', wellness: 'amber' },
  { id: 3, initials: 'TM', name: 'T. Mthembu', role: 'Nurse', ward: 'General A', hr: 68, temp: 36.5, status: 'active', tasks: 2, tasksCompleted: 9, clockIn: '07:30', location: 'Ward A2', wellness: 'green' },
  { id: 4, initials: 'LP', name: 'L. Pillay', role: 'Receptionist', ward: 'Reception', hr: 82, temp: 36.7, status: 'active', tasks: 4, tasksCompleted: 12, clockIn: '08:00', location: 'Front Desk', wellness: 'green' },
  { id: 5, initials: 'BN', name: 'B. Ndlovu', role: 'Doctor', ward: 'Trauma', hr: 88, temp: 37.1, status: 'active', tasks: 1, tasksCompleted: 5, clockIn: '06:30', location: 'Trauma Bay', wellness: 'amber' },
  { id: 6, initials: 'ZM', name: 'Z. Mokoena', role: 'Nurse', ward: 'General B', hr: 65, temp: 36.4, status: 'active', tasks: 6, tasksCompleted: 7, clockIn: '07:15', location: 'Ward B1', wellness: 'green' },
  { id: 7, initials: 'RS', name: 'R. Sithole', role: 'Security', ward: 'Entrance', hr: 78, temp: 36.8, status: 'active', tasks: 0, tasksCompleted: 2, clockIn: '06:00', location: 'Main Gate', wellness: 'green' },
  { id: 8, initials: 'AN', name: 'A. Ntuli', role: 'Nurse', ward: 'Maternity', hr: 115, temp: 37.4, status: 'break', tasks: 3, tasksCompleted: 4, clockIn: '07:00', location: 'Break Room', wellness: 'red' },
  { id: 9, initials: 'PM', name: 'P. Mahlangu', role: 'Paramedic', ward: 'Ambulance', hr: 76, temp: 36.6, status: 'active', tasks: 0, tasksCompleted: 3, clockIn: '06:00', location: 'Unit 1 - En route', wellness: 'green' },
  { id: 10, initials: 'KD', name: 'K. Dube', role: 'Doctor', ward: 'ICU', hr: 70, temp: 36.5, status: 'active', tasks: 4, tasksCompleted: 6, clockIn: '08:00', location: 'ICU Bay 2', wellness: 'green' },
]

function WellnessDot({ level, pulse }) {
  const colors = { green: C.green, amber: C.amber, red: C.red }
  return (
    <div className={level === 'red' || pulse ? 'pulse' : ''} style={{ width: 8, height: 8, borderRadius: '50%', background: colors[level] || C.green, flexShrink: 0 }} />
  )
}

function HRBar({ hr }) {
  const pct = Math.min(100, (hr / 160) * 100)
  const color = hr > 110 ? C.red : hr > 90 ? C.amber : C.green
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 50, height: 4, background: '#ffffff15', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 1.5s ease' }} />
      </div>
      <span style={{ fontSize: 11, color, minWidth: 28 }}>{hr}</span>
    </div>
  )
}

function StaffCard({ staff, onAssign }) {
  const statusColors = { active: C.green, break: C.amber, busy: C.purple }
  const roleColors = { Doctor: C.purple, Nurse: C.green, Receptionist: C.amber, Security: C.blue, Paramedic: C.red }
  const roleColor = roleColors[staff.role] || C.sub

  return (
    <div className="slide" style={{ background: C.card, border: `1px solid ${staff.wellness === 'red' ? C.red + '66' : C.border}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${roleColor}22`, color: roleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{staff.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 10, color: roleColor, background: `${roleColor}18`, padding: '1px 6px', borderRadius: 10 }}>{staff.role}</span>
            <span style={{ fontSize: 10, color: C.muted }}>{staff.ward}</span>
          </div>
        </div>
        <WellnessDot level={staff.wellness} pulse={staff.wellness === 'red'} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
        <div style={{ background: '#ffffff05', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{staff.tasks}</div>
          <div style={{ fontSize: 9, color: C.muted }}>Open tasks</div>
        </div>
        <div style={{ background: '#ffffff05', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.green }}>{staff.tasksCompleted}</div>
          <div style={{ fontSize: 9, color: C.muted }}>Completed</div>
        </div>
        <div style={{ background: '#ffffff05', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{staff.clockIn}</div>
          <div style={{ fontSize: 9, color: C.muted }}>Clock-in</div>
        </div>
      </div>

      {/* Biometrics */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', align: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, color: C.muted }}>HR</div>
          <HRBar hr={staff.hr} />
        </div>
        <div style={{ fontSize: 10, color: staff.temp > 37.2 ? C.amber : C.sub }}>🌡️ {staff.temp}°C</div>
      </div>

      {/* Location */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[staff.status] || C.green }} className={staff.status === 'active' ? 'pulse' : ''} />
          <span style={{ fontSize: 10, color: C.sub }}>{staff.location}</span>
        </div>
        <button
          onClick={() => onAssign(staff)}
          style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, border: `1px solid ${C.purple}66`, background: `${C.purple}18`, color: C.purpleLight, cursor: 'pointer' }}
        >
          + Assign task
        </button>
      </div>
    </div>
  )
}

function TaskModal({ staff, onClose, onSend }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('normal')
  const [category, setCategory] = useState('general')

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, width: 340, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4 }}>Assign task</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>→ {staff.name} · {staff.ward}</div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Task title</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Check vitals on Bed 7"
            style={{ width: '100%', background: '#ffffff08', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 12, outline: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Priority</div>
            <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%', background: '#ffffff08', border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 8px', color: C.text, fontSize: 11, outline: 'none' }}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">🚨 Emergency</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Category</div>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', background: '#ffffff08', border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 8px', color: C.text, fontSize: 11, outline: 'none' }}>
              <option value="general">General</option>
              <option value="medication">Medication</option>
              <option value="vitals_check">Vitals check</option>
              <option value="procedure">Procedure</option>
              <option value="hygiene">Hygiene</option>
              <option value="equipment">Equipment</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.muted, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
          <button
            onClick={() => { if (title.trim()) { onSend({ staff, title, priority, category }); onClose() } }}
            style={{ flex: 2, padding: '9px', borderRadius: 8, border: 'none', background: priority === 'emergency' ? C.red : C.purple, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
          >
            Send to watch →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StaffCommand() {
  const [staff, setStaff] = useState(STAFF_DATA)
  const [filterRole, setFilterRole] = useState('All')
  const [filterWard, setFilterWard] = useState('All Wards')
  const [search, setSearch] = useState('')
  const [assignTarget, setAssignTarget] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])

  // Simulate live biometric updates
  useEffect(() => {
    const t = setInterval(() => {
      setStaff(prev => prev.map(s => ({
        ...s,
        hr: Math.max(55, Math.min(130, s.hr + Math.round((Math.random() - .5) * 5))),
        wellness: s.hr > 110 ? 'red' : s.hr > 90 ? 'amber' : 'green'
      })))
    }, 2500)
    return () => clearInterval(t)
  }, [])

  const filtered = staff.filter(s => {
    const roleMatch = filterRole === 'All' || s.role === filterRole
    const wardMatch = filterWard === 'All Wards' || s.ward === filterWard
    const searchMatch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase())
    return roleMatch && wardMatch && searchMatch
  })

  const clocked = staff.length
  const critical = staff.filter(s => s.wellness === 'red').length
  const onBreak = staff.filter(s => s.status === 'break').length
  const totalTasks = staff.reduce((a, s) => a + s.tasks, 0)

  const handleAssign = ({ staff: s, title, priority, category }) => {
    setRecentTasks(prev => [{ id: Date.now(), name: s.name, title, priority, time: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) }, ...prev.slice(0, 4)])
    setStaff(prev => prev.map(m => m.id === s.id ? { ...m, tasks: m.tasks + 1 } : m))
  }

  const priorityColor = { low: C.sub, normal: C.blue, high: C.amber, urgent: C.red, emergency: C.red }

  return (
    <>
      <style>{css}</style>
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: '#0d1117' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>PulseOS</span>
            <span style={{ fontSize: 11, color: C.muted }}>Staff Command Centre</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${C.green}18`, border: `1px solid ${C.green}44`, borderRadius: 20, padding: '3px 10px', fontSize: 10, color: C.greenLight }}>
              <div className="pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />
              Live biometrics
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', minHeight: 'calc(100vh - 49px)' }}>

          {/* Main */}
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[
                { val: clocked, label: 'On shift', color: C.green },
                { val: critical, label: 'Wellness alert', color: C.red },
                { val: onBreak, label: 'On break', color: C.amber },
                { val: totalTasks, label: 'Open tasks', color: C.purple },
              ].map((s, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 24, fontWeight: 600, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search staff..."
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', color: C.text, fontSize: 12, outline: 'none', width: 180 }}
              />
              <div style={{ display: 'flex', gap: 4 }}>
                {ROLES.map(r => (
                  <button key={r} onClick={() => setFilterRole(r)} style={{ fontSize: 10, padding: '5px 10px', borderRadius: 6, border: `1px solid ${filterRole === r ? C.purple : C.border}`, background: filterRole === r ? `${C.purple}22` : 'none', color: filterRole === r ? C.purpleLight : C.muted, cursor: 'pointer' }}>{r}</button>
                ))}
              </div>
            </div>

            {/* Ward filter */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {WARDS.map(w => (
                <button key={w} onClick={() => setFilterWard(w)} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: `1px solid ${filterWard === w ? C.green : C.border}`, background: filterWard === w ? `${C.green}18` : 'none', color: filterWard === w ? C.greenLight : C.muted, cursor: 'pointer' }}>{w}</button>
              ))}
            </div>

            {/* Staff grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 10 }}>
              {filtered.map(s => (
                <StaffCard key={s.id} staff={s} onAssign={setAssignTarget} />
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: C.muted, padding: 40, fontSize: 13 }}>No staff match your filters</div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div style={{ borderLeft: `1px solid ${C.border}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

            {/* Wellness alerts */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Wellness alerts</div>
              {staff.filter(s => s.wellness !== 'green').map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: `${s.wellness === 'red' ? C.red : C.amber}11`, border: `1px solid ${s.wellness === 'red' ? C.red : C.amber}33`, borderRadius: 8, marginBottom: 5 }}>
                  <WellnessDot level={s.wellness} pulse={s.wellness === 'red'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: s.wellness === 'red' ? C.red : C.amber }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>HR {s.hr} · {s.ward}</div>
                  </div>
                </div>
              ))}
              {staff.filter(s => s.wellness !== 'green').length === 0 && (
                <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', padding: '12px 0' }}>✓ All staff wellness normal</div>
              )}
            </div>

            {/* Recent task assignments */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Recent assignments</div>
              {recentTasks.length === 0 && (
                <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', padding: '12px 0' }}>No tasks assigned yet</div>
              )}
              {recentTasks.map(t => (
                <div key={t.id} className="slide" style={{ padding: '7px 10px', background: `${priorityColor[t.priority] || C.blue}11`, border: `1px solid ${priorityColor[t.priority] || C.blue}33`, borderRadius: 8, marginBottom: 5 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: priorityColor[t.priority] || C.blue }}>{t.title}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>→ {t.name} · {t.time}</div>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Shift summary</div>
              {[
                { label: 'Avg heart rate', val: Math.round(staff.reduce((a, s) => a + s.hr, 0) / staff.length) + ' BPM' },
                { label: 'Tasks completed today', val: staff.reduce((a, s) => a + s.tasksCompleted, 0) },
                { label: 'Staff per ward', val: `${(staff.length / 6).toFixed(1)} avg` },
                { label: 'Longest shift', val: '9h 14m (B. Ndlovu)' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{s.val}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Task assignment modal */}
        {assignTarget && (
          <TaskModal staff={assignTarget} onClose={() => setAssignTarget(null)} onSend={handleAssign} />
        )}
      </div>
    </>
  )
}