import { useState } from 'react'
import LiveDashboard from './pages/LiveDashboard'
import StaffCommand from './pages/StaffCommand'
import PatientBoard from './pages/PatientBoard'
import AmbulanceTracker from './pages/AmbulanceTracker'
import AIReports from './pages/AIReports'
import './App.css'

const NAV = [
  { id: 'live', label: '⬤ Live Overview' },
  { id: 'staff', label: '👥 Staff Command' },
  { id: 'patients', label: '🫀 Patient Board' },
  { id: 'ambulance', label: '🚑 Ambulance' },
  { id: 'reports', label: '🤖 AI Reports' },
]

export default function App() {
  const [page, setPage] = useState('live')

  return (
    <div style={{ margin: 0, padding: 0, background: '#0a0e1a', minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: 4, padding: '8px 16px', background: '#0d1117', borderBottom: '1px solid #1f2937', position: 'sticky', top: 0, zIndex: 50 }}>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            style={{
              padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11,
              background: page === n.id ? '#7c3aed' : '#ffffff0a',
              color: page === n.id ? '#fff' : '#6b7280',
              fontWeight: page === n.id ? 500 : 400
            }}
          >
            {n.label}
          </button>
        ))}
      </div>
      {page === 'live' && <LiveDashboard />}
      {page === 'staff' && <StaffCommand />}
      {page === 'patients' && <PatientBoard />}
      {page === 'ambulance' && <AmbulanceTracker />}
      {page === 'reports' && <AIReports />}
    </div>
  )
}