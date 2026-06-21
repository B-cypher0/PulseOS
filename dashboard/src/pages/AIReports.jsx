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
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes typing { from{width:0} to{width:100%} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .pulse { animation: pulse 1.5s infinite; }
  .fadein { animation: fadeIn 0.5s ease; }
  .blink { animation: blink 1s infinite; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #111827; }
  ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
`

const REPORTS = [
  {
    id: 1,
    date: 'Today — Sunday, 22 June 2026',
    period: 'Live report · Updates every hour',
    type: 'daily',
    generated: '16:00',
    score: 78,
    summary: `Today has been a high-intensity shift across all departments. Emergency and Trauma wards operated at full capacity from 06:00, driven by two critical admissions — a cardiac arrest (Bed ICU-1) and a GSW to chest (Trauma Bay 1). Both patients remain critical but stable.

Staff performed well under pressure. Task completion rate sits at 82% — above the 75% threshold. However, three tasks were escalated due to delays in General Ward B, likely linked to nurse A. Ntuli's elevated stress indicators flagging at 14:00.

Ambulance Unit 1 responded to a suspected MI within 6 minutes — the fastest response this week. Patient vitals were pre-streamed to the receiving team 8 minutes before arrival, allowing Trauma Bay 2 to be prepared in advance.

The waiting room peaked at 14 patients at 11:30. Camera analysis detected one patient showing visible distress at 11:47 — they were prioritised and assessed within 4 minutes.`,
    highlights: [
      { icon: '🚨', text: '2 critical admissions — both stable', color: C.red },
      { icon: '✅', text: '82% task completion rate', color: C.green },
      { icon: '🚑', text: 'AMB-1 fastest response: 6 min', color: C.blue },
      { icon: '⚠️', text: 'Nurse A. Ntuli wellness flag at 14:00', color: C.amber },
      { icon: '👁️', text: 'Waiting room distress detected & resolved', color: C.purple },
    ],
    recommendations: [
      'Consider rotating A. Ntuli (Maternity) to a lower-intensity ward for the last 2 hours of shift — stress index has been elevated for 90 minutes.',
      'General Ward B has 3 overdue medication tasks. Assign backup nurse or supervisor check-in.',
      'Blood bank O-neg is at 2 units. Request resupply before end of shift — current critical patients may require transfusion.',
      'Trauma Bay 1 has been occupied for 4+ hours. Theatre scheduling should confirm OR availability for potential surgery.',
    ],
    metrics: {
      staffOnShift: 18, tasksAssigned: 47, tasksCompleted: 39, completionRate: 82,
      patientsAdmitted: 4, patientsActive: 12, criticalAlerts: 9,
      avgResponseTime: '8.4 min', ambulanceCallouts: 3,
    }
  },
  {
    id: 2,
    date: 'Yesterday — Saturday, 21 June 2026',
    period: 'Full day report',
    type: 'daily',
    generated: '23:59',
    score: 91,
    summary: `Saturday was one of the smoothest shifts this week. All 20 scheduled staff arrived on time — no call-outs or coverage gaps. Task completion rate reached 91%, the highest in 7 days.

Emergency admissions were below average (2 vs weekly average of 4.3). The two admissions — a diabetic crisis and a paediatric dehydration case — were both resolved and discharged within 6 hours.

Ambulance fleet operated with zero downtime. Average response time was 7.2 minutes across 5 callouts. The doctor pre-briefing system was used for all 3 hospital admissions from ambulance — receiving teams noted improved preparation time.

Staff wellness indicators were green across all roles for 94% of the shift. One brief amber flag (elevated HR) was detected for Dr. Khumalo during a complex procedure at 15:30 — resolved within 20 minutes.`,
    highlights: [
      { icon: '⭐', text: '91% task completion — best this week', color: C.green },
      { icon: '🚑', text: 'Avg response time: 7.2 min', color: C.green },
      { icon: '💚', text: 'Staff wellness 94% green all day', color: C.green },
      { icon: '✅', text: 'Full attendance — 0 call-outs', color: C.green },
    ],
    recommendations: [
      'Saturday staffing model worked well — consider applying same roster structure to Fridays.',
      'Pre-briefing adoption is 100% for ambulance admissions. Recommend formalising as standard protocol.',
    ],
    metrics: {
      staffOnShift: 20, tasksAssigned: 52, tasksCompleted: 47, completionRate: 91,
      patientsAdmitted: 2, patientsActive: 8, criticalAlerts: 2,
      avgResponseTime: '7.2 min', ambulanceCallouts: 5,
    }
  },
  {
    id: 3,
    date: 'Weekly summary — 16–22 June 2026',
    period: '7-day analysis',
    type: 'weekly',
    generated: 'Auto',
    score: 84,
    summary: `This week PulseOS monitored 7 full shifts across all departments. Overall performance was above baseline, with a weekly task completion rate of 84% and an average ambulance response time of 8.1 minutes.

Key pattern detected: Task overruns cluster between 14:00–16:00 on weekdays, consistently linked to shift handover gaps and reduced ward coverage. This window accounts for 61% of all escalated tasks.

Staff wellness: Two nurses showed repeated amber flags across multiple shifts (S. Dlamini, A. Ntuli). Both have been working 6+ consecutive days without a rest day. HR recommends a scheduled rest day within the next 48 hours.

Disease intelligence: A 40% rise in respiratory presentations was detected across the week, consistent with seasonal flu patterns. Ward B had the highest concentration. Recommend restocking nebulisers and bronchodilators.`,
    highlights: [
      { icon: '📊', text: '84% avg task completion this week', color: C.green },
      { icon: '⏰', text: 'Peak overrun window: 14:00–16:00', color: C.amber },
      { icon: '😮', text: '2 nurses need rest — 6+ day streak', color: C.amber },
      { icon: '🦠', text: '40% rise in respiratory cases', color: C.red },
      { icon: '🚑', text: 'Avg response 8.1 min — improving', color: C.blue },
    ],
    recommendations: [
      'Schedule mandatory rest days for S. Dlamini and A. Ntuli this week.',
      'Add overlap coverage for 14:00–16:00 handover window — consider 30-min staggered shift ends.',
      'Restock respiratory medications — current levels will not sustain projected demand next week.',
      'Consider opening a temporary respiratory assessment bay to reduce General Ward B congestion.',
    ],
    metrics: {
      staffOnShift: 134, tasksAssigned: 341, tasksCompleted: 287, completionRate: 84,
      patientsAdmitted: 31, patientsActive: 12, criticalAlerts: 47,
      avgResponseTime: '8.1 min', ambulanceCallouts: 19,
    }
  }
]

function ScoreRing({ score }) {
  const color = score >= 85 ? C.green : score >= 70 ? C.amber : C.red
  const circumference = 2 * Math.PI * 38
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{ position: 'relative', width: 96, height: 96 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r="38" fill="none" stroke={C.border} strokeWidth="8" />
        <circle cx="48" cy="48" r="38" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 600, color }}>{score}</div>
        <div style={{ fontSize: 9, color: C.muted }}>score</div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <div style={{ background: '#ffffff05', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: color || C.text }}>{value}</div>
      <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{label}</div>
    </div>
  )
}

function TypingText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const t = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(t)
      }
    }, speed)
    return () => clearInterval(t)
  }, [text])

  return (
    <span>
      {displayed}
      {!done && <span className="blink" style={{ color: C.purple }}>|</span>}
    </span>
  )
}

export default function AIReports() {
  const [selected, setSelected] = useState(REPORTS[0])
  const [generating, setGenerating] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [question, setQuestion] = useState('')
  const [chat, setChat] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setShowTyping(false)
    setTimeout(() => {
      setGenerating(false)
      setShowTyping(true)
    }, 2200)
  }

  const handleAsk = () => {
    if (!question.trim()) return
    const q = question
    setQuestion('')
    setChat(prev => [...prev, { role: 'user', text: q }])
    setChatLoading(true)
    setTimeout(() => {
      const answers = {
        default: `Based on today's PulseOS data: ${selected.highlights[0]?.text}. Task completion is at ${selected.metrics.completionRate}% and ${selected.metrics.criticalAlerts} alerts were raised. ${selected.recommendations[0]}`,
      }
      const keywords = q.toLowerCase()
      let answer = answers.default
      if (keywords.includes('staff') || keywords.includes('nurse')) answer = `Staff performance today: ${selected.metrics.staffOnShift} staff on shift with ${selected.metrics.completionRate}% task completion. ${selected.recommendations.find(r => r.toLowerCase().includes('nurse') || r.toLowerCase().includes('staff')) || selected.recommendations[0]}`
      if (keywords.includes('patient')) answer = `Patient summary: ${selected.metrics.patientsAdmitted} admitted today, ${selected.metrics.patientsActive} currently active, ${selected.metrics.criticalAlerts} critical alerts raised. ${selected.recommendations.find(r => r.toLowerCase().includes('patient') || r.toLowerCase().includes('ward')) || selected.recommendations[1] || selected.recommendations[0]}`
      if (keywords.includes('ambulance') || keywords.includes('response')) answer = `Ambulance performance: ${selected.metrics.ambulanceCallouts} callouts today with avg response time of ${selected.metrics.avgResponseTime}. Doctor pre-briefing system active for all hospital admissions from ambulance.`
      if (keywords.includes('recommend')) answer = `My top recommendations for today: 1) ${selected.recommendations[0]} 2) ${selected.recommendations[1] || 'Continue current protocols.'}`
      setChat(prev => [...prev, { role: 'ai', text: answer }])
      setChatLoading(false)
    }, 1500)
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: '#0d1117' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: C.purple }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>PulseOS</span>
            <span style={{ fontSize: 11, color: C.muted }}>AI Reports</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${C.purple}18`, border: `1px solid ${C.purple}44`, borderRadius: 20, padding: '3px 10px', fontSize: 10, color: C.purpleLight }}>
            <div className="pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: C.purple }} />
            Claude AI — connected
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 280px', minHeight: 'calc(100vh - 49px)' }}>

          {/* Left — report list */}
          <div style={{ borderRight: `1px solid ${C.border}`, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>Reports</div>
            {REPORTS.map(r => (
              <div
                key={r.id}
                onClick={() => { setSelected(r); setShowTyping(false); setChat([]) }}
                style={{ padding: '10px 10px', borderRadius: 8, cursor: 'pointer', background: selected.id === r.id ? `${C.purple}18` : '#ffffff04', border: `1px solid ${selected.id === r.id ? C.purple + '55' : C.border}`, transition: 'all .15s' }}
              >
                <div style={{ fontSize: 11, fontWeight: 500, color: selected.id === r.id ? C.purpleLight : C.text }}>{r.type === 'weekly' ? '📊' : '📋'} {r.type === 'weekly' ? 'Weekly' : r.date.split('—')[0].trim()}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{r.type === 'weekly' ? 'This week' : r.date.split('—')[1]?.trim()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: r.score >= 85 ? C.green : r.score >= 70 ? C.amber : C.red }}>{r.score}</div>
                  <div style={{ fontSize: 9, color: C.muted }}>score</div>
                </div>
              </div>
            ))}

            <button
              onClick={handleGenerate}
              style={{ marginTop: 8, padding: '9px', borderRadius: 8, border: `1px solid ${C.purple}55`, background: `${C.purple}18`, color: C.purpleLight, cursor: 'pointer', fontSize: 11, fontWeight: 500 }}
            >
              {generating ? '⏳ Generating...' : '+ Generate now'}
            </button>
          </div>

          {/* Main report */}
          <div style={{ padding: 20, overflowY: 'auto' }}>

            {/* Report header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
              <ScoreRing score={selected.score} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 4 }}>{selected.date}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{selected.period} · Generated {selected.generated}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selected.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${h.color}12`, border: `1px solid ${h.color}33`, borderRadius: 20, padding: '3px 10px', fontSize: 10, color: h.color }}>
                      {h.icon} {h.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 20 }}>
              <MetricCard label="Staff on shift" value={selected.metrics.staffOnShift} color={C.blue} />
              <MetricCard label="Tasks completed" value={`${selected.metrics.tasksCompleted}/${selected.metrics.tasksAssigned}`} color={C.green} />
              <MetricCard label="Completion rate" value={`${selected.metrics.completionRate}%`} color={selected.metrics.completionRate >= 80 ? C.green : C.amber} />
              <MetricCard label="Critical alerts" value={selected.metrics.criticalAlerts} color={C.red} />
              <MetricCard label="Avg response" value={selected.metrics.avgResponseTime} color={C.purple} />
            </div>

            {/* AI summary */}
            <div style={{ background: `${C.purple}08`, border: `1px solid ${C.purple}33`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${C.purple}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.purpleLight }}>Claude's analysis</div>
                  <div style={{ fontSize: 10, color: C.muted }}>Based on live PulseOS sensor data</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {showTyping ? <TypingText text={selected.summary} speed={12} /> : selected.summary}
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>AI recommendations</div>
              {selected.recommendations.map((r, i) => (
                <div key={i} className="fadein" style={{ display: 'flex', gap: 10, padding: '10px 12px', background: '#ffffff04', border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${C.purple}22`, color: C.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{r}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right — AI chat */}
          <div style={{ borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: C.purpleLight }}>Ask Claude about this report</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Ask anything about today's hospital data</div>
            </div>

            {/* Chat messages */}
            <div style={{ flex: 1, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chat.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Ask me about today's report</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 12 }}>
                    {['How did staff perform?', 'Any patient concerns?', 'What should I fix tomorrow?', 'How were the ambulances?'].map(q => (
                      <button key={q} onClick={() => { setQuestion(q); }} style={{ fontSize: 10, padding: '5px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: '#ffffff06', color: C.muted, cursor: 'pointer', textAlign: 'left' }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className="fadein" style={{ display: 'flex', gap: 6, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.role === 'user' ? `${C.blue}22` : `${C.purple}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
                    {m.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div style={{ maxWidth: '80%', padding: '8px 10px', borderRadius: 10, background: m.role === 'user' ? `${C.blue}18` : `${C.purple}12`, border: `1px solid ${m.role === 'user' ? C.blue + '33' : C.purple + '33'}`, fontSize: 11, color: C.sub, lineHeight: 1.5 }}>
                    {m.role === 'ai' ? <TypingText text={m.text} speed={15} /> : m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${C.purple}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🤖</div>
                  <div style={{ padding: '8px 12px', borderRadius: 10, background: `${C.purple}12`, border: `1px solid ${C.purple}33` }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0, 1, 2].map(i => <div key={i} className="pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: C.purple, animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: 10, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 6 }}>
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk()}
                placeholder="Ask about this report..."
                style={{ flex: 1, background: '#ffffff08', border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px', color: C.text, fontSize: 11, outline: 'none' }}
              />
              <button onClick={handleAsk} style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: C.purple, color: '#fff', cursor: 'pointer', fontSize: 11 }}>→</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}