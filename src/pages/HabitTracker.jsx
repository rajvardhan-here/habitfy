import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const HABIT_ICONS = ['💪', '📚', '💻', '✍️', '🧘', '🎯', '🏃', '🎨', '🎵', '💡']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ✅ NEW COLOUR PALETTE
const PINK        = '#E91E8C'
const PINK_LIGHT  = '#FCE7F3'
const PURPLE      = '#7C3AED'
const PURPLE_LIGHT= '#EDE9FE'
const AMBER       = '#F59E0B'
const BG          = '#F3F0FF'
const DARK        = '#1E1B4B'
const TEAL        = '#0EA5E9'

function WaterBowl({ percent }) {
  const isOverflow = percent >= 95
  const waveY = 100 - percent
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
      <div style={{ position: 'relative', width: 110, height: 110 }}>
        <svg viewBox="0 0 110 110" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <defs>
            <clipPath id="bowlClip"><ellipse cx="55" cy="58" rx="46" ry="46" /></clipPath>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PINK} stopOpacity={0.8} />
              <stop offset="100%" stopColor={PURPLE} stopOpacity={1} />
            </linearGradient>
          </defs>
          <ellipse cx="55" cy="58" rx="46" ry="46" fill={PURPLE_LIGHT} stroke={PURPLE} strokeWidth="2.5" />
          <g clipPath="url(#bowlClip)">
            <rect x="0" y={12 + waveY * 0.88} width="110" height="110" fill="url(#waterGrad)" opacity="0.85" />
            <motion.path d={`M-10,${12 + waveY * 0.88} C15,${12 + waveY * 0.88 - 7} 40,${12 + waveY * 0.88 + 7} 65,${12 + waveY * 0.88} C90,${12 + waveY * 0.88 - 7} 110,${12 + waveY * 0.88 + 5} 130,${12 + waveY * 0.88} L130,110 L-10,110 Z`}
              fill={PINK} opacity={0.5} animate={{ x: [0, -50, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
            <motion.path d={`M-10,${12 + waveY * 0.88 + 4} C20,${12 + waveY * 0.88 - 4} 45,${12 + waveY * 0.88 + 9} 70,${12 + waveY * 0.88 + 3} C95,${12 + waveY * 0.88 - 5} 115,${12 + waveY * 0.88 + 7} 130,${12 + waveY * 0.88} L130,110 L-10,110 Z`}
              fill={PURPLE} opacity={0.3} animate={{ x: [0, 50, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
          </g>
          <ellipse cx="55" cy="58" rx="46" ry="46" fill="none" stroke={PURPLE} strokeWidth="2.5" />
          <ellipse cx="55" cy="13" rx="46" ry="9" fill={PURPLE_LIGHT} stroke={PURPLE} strokeWidth="2" />
          <ellipse cx="55" cy="13" rx="38" ry="6" fill="white" stroke={PURPLE} strokeWidth="1.5" opacity="0.8" />
          <text x="55" y="60" textAnchor="middle" style={{ fontSize: 17, fontWeight: 900, fill: percent > 50 ? 'white' : DARK }}>{percent}%</text>
          <text x="55" y="74" textAnchor="middle" style={{ fontSize: 8, fill: percent > 50 ? 'rgba(255,255,255,0.8)' : '#94A3B8' }}>this month</text>
        </svg>
        {isOverflow && (
          <>
            <motion.div style={{ position: 'absolute', top: 2, left: 32, width: 7, height: 14, borderRadius: '50%', background: PINK, opacity: 0.8 }}
              animate={{ y: [0, -8, 0], scaleY: [1, 1.3, 1] }} transition={{ duration: 1.0, repeat: Infinity }} />
            <motion.div style={{ position: 'absolute', top: 0, left: 52, width: 6, height: 12, borderRadius: '50%', background: PURPLE, opacity: 0.7 }}
              animate={{ y: [0, -10, 0], scaleY: [1, 1.4, 1] }} transition={{ duration: 1.3, repeat: Infinity, delay: 0.4 }} />
          </>
        )}
      </div>
    </div>
  )
}

function MiniCircle({ percent }) {
  const r = 9, circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={22} height={22} style={{ flexShrink: 0 }}>
      <circle cx={11} cy={11} r={r} fill="none" stroke={PURPLE_LIGHT} strokeWidth={3} />
      <circle cx={11} cy={11} r={r} fill="none" stroke={PINK} strokeWidth={3}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 11 11)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  )
}

function StreakPill({ streak }) {
  const [showTip, setShowTip] = useState(false)
  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onTouchStart={() => setShowTip(v => !v)}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 16px', borderRadius: 20,
        background: 'white', boxShadow: '0 2px 10px rgba(124,58,237,0.15)',
        cursor: 'default', userSelect: 'none'
      }}>
        <span style={{ fontSize: 13 }}>🔥</span>
        <span style={{ fontWeight: 700, color: PURPLE, fontSize: 12 }}>Streak</span>
        <div style={{ width: 1, height: 14, background: '#E2E8F0' }} />
        <span style={{ fontWeight: 800, color: '#e85d04', fontSize: 13 }}>{streak}d</span>
      </div>
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', top: 46, left: '50%', transform: 'translateX(-50%)',
              background: DARK, color: 'white', borderRadius: 14, padding: '12px 16px',
              fontSize: 11.5, fontWeight: 600, lineHeight: 1.7,
              zIndex: 200, boxShadow: `0 8px 24px rgba(30,27,75,0.35)`,
              width: 230, textAlign: 'center'
            }}>
            <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: `6px solid ${DARK}` }} />
            ⚠️ <strong>Streak sirf tabhi badhti hai</strong> jab aap <em>roz aake</em> us din ke task tick karo.<br />
            Ek saath purane saare din tick karne se streak <strong>nahi badhti!</strong> 🙅‍♂️<br />
            <span style={{ opacity: 0.75, fontSize: 10.5 }}>Roz aana padega bhai — consistency hi game hai 💪</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HabitTracker({ user: propUser, onLogout }) {
  const [habits, setHabits] = useState([])
  const [tasks, setTasks] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [user, setUser] = useState(propUser || null)
  const [celebrate, setCelebrate] = useState(false)
  const [halfOffset, setHalfOffset] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear] = useState(new Date().getFullYear())
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const isMobile = vw < 768
  const today = new Date().toISOString().split('T')[0]
  const nowDate = new Date()
  const todayLabel = `${DAYS[nowDate.getDay()]}, ${nowDate.getDate()} ${MONTHS[nowDate.getMonth()]}`

  const getMonthHalfDates = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    const start = halfOffset === 0 ? 1 : 16
    const end = halfOffset === 0 ? 15 : daysInMonth
    return Array.from({ length: end - start + 1 }, (_, i) => {
      const day = start + i
      const d = new Date(selectedYear, selectedMonth, day)
      return { label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), date: d.toISOString().split('T')[0] }
    })
  }
  const weekDates = getMonthHalfDates()

  const getDaysInMonth = (month, year) => {
    const days = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month, i + 1)
      return { date: `${i + 1}`, fullDate: d.toISOString().split('T')[0] }
    })
  }
  const monthDays = getDaysInMonth(selectedMonth, selectedYear)
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()

  useEffect(() => {
    const u = propUser || null
    if (u) { setUser(u); fetchHabits(u.id); fetchTasks(u.id) }
    else supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUser(user); fetchHabits(user.id); fetchTasks(user.id) }
    })
  }, [propUser])

  const fetchHabits = async (uid) => {
    const { data } = await supabase.from('habits').select('*, habit_logs(*)').eq('user_id', uid)
    setHabits(data || [])
    if (data && data.length > 0) {
      let s = 0
      const d = new Date()
      for (let i = 0; i < 365; i++) {
        const ds = d.toISOString().split('T')[0]
        if (ds > today) { d.setDate(d.getDate() - 1); continue }
        if (data.every(h => h.habit_logs && h.habit_logs.some(l => l.date === ds))) { s++; d.setDate(d.getDate() - 1) }
        else break
      }
      setStreak(s)
    }
  }

  const fetchTasks = async (uid) => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', uid).eq('date', today).order('created_at', { ascending: true })
    setTasks(data || [])
  }

  const getCurrentUser = async () => {
    if (user) return user
    const { data } = await supabase.auth.getUser()
    if (data?.user) { setUser(data.user); return data.user }
    return null
  }

  const addHabit = async () => {
    if (!newHabit.trim()) return
    const cu = await getCurrentUser()
    if (!cu) return
    const { data, error } = await supabase.from('habits').insert({ user_id: cu.id, name: newHabit, color: PINK }).select()
    if (error) { console.error('addHabit error', error); return }
    setHabits(prev => [...prev, { ...data[0], habit_logs: [] }])
    setNewHabit('')
  }

  const deleteHabit = async (habitId) => {
    if (!confirm('Delete this habit and all its logs?')) return
    await supabase.from('habit_logs').delete().eq('habit_id', habitId)
    await supabase.from('habits').delete().eq('id', habitId)
    setHabits(prev => prev.filter(h => h.id !== habitId))
  }

  const addTask = async () => {
    const cu = await getCurrentUser()
    if (!cu) return
    const { data, error } = await supabase.from('tasks').insert({ user_id: cu.id, title: '', date: today, done: false }).select()
    if (error) { console.error('addTask error', error); return }
    setTasks(prev => [...prev, data[0]])
  }

  const deleteTask = async (taskId) => {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const updateTaskTitle = async (task, title) => {
    await supabase.from('tasks').update({ title }).eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, title } : t))
  }

  const toggleHabit = async (habitId, date) => {
    const cu = await getCurrentUser()
    if (!cu) return
    const habit = habits.find(h => h.id === habitId)
    const log = habit.habit_logs && habit.habit_logs.find(l => l.date === date)
    if (log) await supabase.from('habit_logs').delete().eq('id', log.id)
    else await supabase.from('habit_logs').insert({ user_id: cu.id, habit_id: habitId, date, done: true })
    fetchHabits(cu.id)
  }

  const toggleTask = async (task) => {
    const { error } = await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id)
    if (error) return
    const updated = tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t)
    setTasks(updated)
    if (updated.every(t => t.done) && updated.length > 0) { setCelebrate(true); setTimeout(() => setCelebrate(false), 3000) }
  }

  const isDone = (habit, date) => habit.habit_logs && habit.habit_logs.some(l => l.date === date)

  const getHabitMonthProgress = (habit) => {
    if (!habit.habit_logs || habit.habit_logs.length === 0) return 0
    return Math.round((monthDays.filter(d => isDone(habit, d.fullDate)).length / monthDays.length) * 100)
  }
  const getHabitHalfProgress = (habit) => {
    if (!habit.habit_logs || habit.habit_logs.length === 0) return 0
    return Math.round((weekDates.filter(d => isDone(habit, d.date)).length / weekDates.length) * 100)
  }

  const selectedMonthProgress = habits.length > 0
    ? Math.round(monthDays.reduce((sum, day) => {
        const done = habits.filter(h => isDone(h, day.fullDate)).length
        return sum + (done / habits.length) * 100
      }, 0) / monthDays.length)
    : 0

  const chartData = monthDays.map(day => ({
    date: day.date,
    productivity: habits.length > 0 ? Math.round((habits.filter(h => isDone(h, day.fullDate)).length / habits.length) * 100) : 0
  }))

  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'there'
  const avatarLetter = firstName[0].toUpperCase()

  // Card style
  const C = { background: 'white', borderRadius: 20, boxShadow: '0 2px 20px rgba(124,58,237,0.10)' }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Inter, sans-serif', overflowY: 'auto' }}>
      {celebrate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}>
          {[...Array(20)].map((_, i) => (
            <motion.div key={i} style={{ position: 'absolute', fontSize: 24 }}
              initial={{ y: '100vh', x: `${Math.random() * 100}vw`, opacity: 1 }}
              animate={{ y: '-10vh', opacity: 0 }} transition={{ duration: 2, delay: Math.random() }}>
              {['🎉', '✨', '🌟', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ padding: isMobile ? 12 : 20 }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 22 : 30, fontWeight: 900, color: DARK, lineHeight: 1.2, margin: 0 }}>
              Hello <span style={{ color: PINK }}>{firstName} ji,</span>
            </h1>
            <p style={{ fontSize: isMobile ? 13 : 16, fontStyle: 'italic', color: PURPLE, fontFamily: 'Georgia, serif', marginTop: 4, marginBottom: 0 }}>
              Stay consistent, don't fool yourself.
            </p>
            <div style={{ height: 2, width: isMobile ? 180 : 300, background: `linear-gradient(90deg, ${PINK}, ${PURPLE}, transparent)`, marginTop: 5, borderRadius: 2 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <StreakPill streak={streak} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'white', boxShadow: '0 2px 10px rgba(124,58,237,0.1)' }}>
              <span style={{ fontSize: 12 }}>📅</span>
              <span style={{ fontWeight: 600, color: DARK, fontSize: 11 }}>{todayLabel}</span>
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${PINK}, ${PURPLE})`, border: 'none', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarLetter}
              </button>
              {showUserMenu && (
                <div style={{ position: 'absolute', right: 0, top: 46, borderRadius: 12, padding: 8, background: 'white', boxShadow: '0 8px 30px rgba(124,58,237,0.15)', minWidth: 160, zIndex: 50 }}>
                  <p style={{ padding: '4px 12px', fontSize: 12, fontWeight: 700, color: DARK, margin: 0 }}>{firstName} ji</p>
                  <p style={{ padding: '0 12px 4px', fontSize: 11, color: '#94A3B8', margin: 0 }}>{user?.email}</p>
                  <button onClick={onLogout} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 160px 220px', gap: 14, marginBottom: 16 }}>

          {/* Chart */}
          <div style={{ ...C, padding: 14, height: isMobile ? 200 : 220, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontWeight: 700, fontSize: 13, color: DARK, margin: 0 }}>Progress</h3>
                <span style={{ fontSize: 11, fontWeight: 600, color: PINK }}>{MONTHS[selectedMonth]}</span>
              </div>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMonthPicker(!showMonthPicker)}
                  style={{ fontSize: 10, fontWeight: 500, color: PURPLE, background: PURPLE_LIGHT, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer' }}>
                  {MONTHS[selectedMonth].slice(0, 3)} {selectedYear} ▾
                </button>
                {showMonthPicker && (
                  <div style={{ position: 'absolute', right: 0, top: 28, background: 'white', borderRadius: 12, boxShadow: '0 8px 30px rgba(124,58,237,0.15)', padding: 8, zIndex: 50, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, minWidth: 190 }}>
                    {MONTHS.map((m, i) => (
                      <button key={i} onClick={() => { setSelectedMonth(i); setShowMonthPicker(false) }}
                        style={{ padding: '5px 6px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, background: selectedMonth === i ? PURPLE : 'transparent', color: selectedMonth === i ? 'white' : DARK }}>
                        {m.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PINK} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={PURPLE} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} ticks={[0, 50, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(124,58,237,0.15)', fontSize: 10 }}
                    formatter={v => [`${v}%`, 'Progress']} labelFormatter={l => `${MONTHS[selectedMonth]} ${l}`} labelStyle={{ fontWeight: 700, color: DARK }} />
                  <Area type="monotone" dataKey="productivity" stroke={PINK} strokeWidth={2} fill="url(#pinkGrad)"
                    dot={false} activeDot={{ r: 4, fill: AMBER, stroke: PINK, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bowl */}
          <div style={{ ...C, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: isMobile ? 'auto' : 220 }}>
            <p style={{ fontWeight: 700, fontSize: 11, color: DARK, margin: '0 0 2px 0', alignSelf: 'flex-start' }}>Overall</p>
            <p style={{ fontSize: 9, color: '#94A3B8', margin: '0 0 4px 0', alignSelf: 'flex-start' }}>{MONTHS[selectedMonth]} {selectedYear}</p>
            <WaterBowl percent={selectedMonthProgress} />
          </div>

          {/* Tasks */}
          <div style={{ ...C, padding: 14, height: isMobile ? 'auto' : 220, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontWeight: 700, fontSize: 12, color: DARK, margin: '0 0 8px 0', flexShrink: 0 }}>⚡ Extra Task of the Day</p>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.div key={task.id} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => toggleTask(task)}
                      style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${task.done ? PINK : '#CBD5E1'}`, background: task.done ? PINK : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {task.done && <span style={{ color: 'white', fontSize: 8, fontWeight: 700 }}>✓</span>}
                    </button>
                    <input value={task.title} onChange={e => updateTaskTitle(task, e.target.value)} placeholder="Enter task..."
                      style={{ flex: 1, outline: 'none', background: 'transparent', border: 'none', fontSize: 11, color: task.done ? '#94A3B8' : DARK, textDecoration: task.done ? 'line-through' : 'none' }} />
                    <button onClick={() => deleteTask(task.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9CA3AF', flexShrink: 0, padding: 0 }}>🗑</button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div style={{ flexShrink: 0, marginTop: 8 }}>
              <button onClick={addTask}
                style={{ width: '100%', height: tasks.length === 0 ? 90 : 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: `2px dashed ${PINK}`, background: 'transparent', cursor: 'pointer' }}>
                <span style={{ fontSize: 22, color: PINK }}>+</span>
              </button>
              <p style={{ fontSize: 9, color: '#94A3B8', textAlign: 'center', marginTop: 4, marginBottom: 0 }}>Today only · removed tomorrow</p>
            </div>
          </div>
        </div>

        {/* HABIT TABLE */}
        <div style={{ ...C, padding: isMobile ? 12 : 16, overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: DARK, margin: 0 }}>Habit Tracker</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setHalfOffset(0)}
                style={{ padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, background: halfOffset === 0 ? PURPLE : PURPLE_LIGHT, color: halfOffset === 0 ? 'white' : PURPLE }}>1–15</button>
              <button onClick={() => setHalfOffset(1)}
                style={{ padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, background: halfOffset === 1 ? PURPLE : PURPLE_LIGHT, color: halfOffset === 1 ? 'white' : PURPLE }}>16–{daysInSelectedMonth}</button>
            </div>
          </div>

          <div style={{ minWidth: isMobile ? 480 : 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ width: isMobile ? 90 : 160, fontSize: 11, fontWeight: 600, color: '#94A3B8', flexShrink: 0 }}>Habit</div>
              <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                {weekDates.map((d, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: isMobile ? 7 : 9, fontWeight: 600, color: d.date === today ? PINK : '#94A3B8', margin: 0 }}>{d.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ width: isMobile ? 56 : 90, fontSize: 11, fontWeight: 600, color: '#94A3B8', textAlign: 'right', flexShrink: 0 }}>%</div>
            </div>

            <AnimatePresence>
              {habits.map((habit, hi) => {
                const halfProg = getHabitHalfProgress(habit)
                const monthProg = getHabitMonthProgress(habit)
                return (
                  <motion.div key={habit.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
                    <div style={{ width: isMobile ? 90 : 160, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <span style={{ fontSize: 13 }}>{HABIT_ICONS[hi % HABIT_ICONS.length]}</span>
                      <span style={{ fontSize: isMobile ? 9 : 11, fontWeight: 600, color: DARK, flex: 1 }}>{habit.name}</span>
                      <button onClick={() => deleteHabit(habit.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B7280', padding: 0, flexShrink: 0 }}>🗑</button>
                    </div>
                    <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                      {weekDates.map((day) => {
                        const isToday = day.date === today
                        const done = isDone(habit, day.date)
                        return (
                          <div key={day.date} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            <button onClick={() => toggleHabit(habit.id, day.date)}
                              style={{
                                width: isMobile ? 14 : 17, height: isMobile ? 14 : 17, borderRadius: 3,
                                border: `2px solid ${done ? PINK : (isToday ? PURPLE : '#CBD5E1')}`,
                                background: done ? `linear-gradient(135deg, ${PINK}, ${PURPLE})` : 'transparent', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isToday && !done ? `0 0 0 2px ${PINK_LIGHT}` : 'none',
                                transition: 'all 0.15s'
                              }}>
                              {done && <span style={{ color: 'white', fontSize: 7, fontWeight: 700 }}>✓</span>}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ width: isMobile ? 56 : 90, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, justifyContent: 'flex-end' }}>
                      {!isMobile && (
                        <div style={{ flex: 1, height: 3, background: PURPLE_LIGHT, borderRadius: 99 }}>
                          <div style={{ height: 3, width: `${halfProg}%`, background: `linear-gradient(90deg, ${PINK}, ${PURPLE})`, borderRadius: 99, transition: 'width 0.5s' }} />
                        </div>
                      )}
                      <span style={{ fontSize: 9, fontWeight: 700, color: PINK }}>{halfProg}%</span>
                      <MiniCircle percent={monthProg} />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
              placeholder="Add habit and press Enter..."
              style={{ flex: 1, borderRadius: 12, padding: '8px 14px', outline: 'none', background: '#F8F0FF', border: `1px solid ${PURPLE_LIGHT}`, color: DARK, fontSize: 12 }} />
            <button onClick={addHabit}
              style={{ padding: '8px 20px', borderRadius: 12, background: `linear-gradient(135deg, ${PINK}, ${PURPLE})`, color: 'white', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Add</button>
          </div>

          {habits.length === 0 && (
            <p style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 12, margin: 0 }}>No habits yet! Add your first habit above.</p>
          )}
        </div>
      </div>
    </div>
  )
}
