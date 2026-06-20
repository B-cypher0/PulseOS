import { useState } from 'react'
import LiveDashboard from './pages/LiveDashboard'
import './App.css'

function App() {
  return (
    <div style={{ margin: 0, padding: 0, background: '#0a0e1a', minHeight: '100vh' }}>
      <LiveDashboard />
    </div>
  )
}

export default App