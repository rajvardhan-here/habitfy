import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const HABIT_ICONS = ['💪', '📚', '💻', '✍️', '🧘', '🎯', '🏃', '🎨', '🎵', '💡']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const GREEN = '#285E2C'
const GREEN_LIGHT = '#E8F5E9'
const YELLOW = '#FFE67C'

// CHANGE 7: Bigger bowl with cap, overflow animation at 95%
function WaterBowl({ percent }) {
  const isOverflow = percent >= 95
  const waveY = 100 - percent

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
      <div style={{ position: 'relative', width: 110, height: 110 }}>
        <svg viewBox="0 0 110 110" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <defs>
            <clipPath id="bowlClip">
              <ellipse cx="55" cy="58" rx="46" ry="46" />
            </clipPath>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.8} />
              <stop offset="100%" stopColor={GREEN} stopOpacity={1} />
            </linearGradient>
          </defs>

          {/* Bowl body */}
          <ellipse cx="55" cy="58" rx="46" ry="46" fill={GREEN_LIGHT} stroke={GREEN} strokeWidth="2.5" />

          {/* Water fill */}
          <g clipPath="url(#bowlClip)">
            <rect x="0" y={12 + waveY * 0.88} width="110" height="110" fill="url(#waterGrad)" opacity="0.85" />
            <motion.path
              d={`M-10,${12 + waveY * 0.88} C15,${12 + waveY * 0.88 - 7} 40,${12 + waveY * 0.88 + 7} 65,${12 + waveY * 0.88} C90,${12 + waveY * 0.88 - 7} 110,${12 + waveY * 0.88 + 5} 130,${12 + waveY * 0.88} L130,110 L-10,110 Z`}
              fill={GREEN} opacity={0.5}
              animate={{ x: [0, -50, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
            <motion.path
              d={`M-10,${12 + waveY * 0.88 + 4} C20,${12 + waveY * 0.88 - 4} 45,${12 + waveY * 0.88 + 9} 70,${12 + waveY * 0.88 + 3} C95,${12 + waveY * 0.88 - 5} 115,${12 + waveY * 0.88 + 7} 130,${12 + waveY * 0.88} L130,110 L-10,110 Z`}
              fill="#4CAF50" opacity={0.3}
              animate={{ x: [0, 50, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
          </g>

          {/* Bowl border overlay */}
          <ellipse cx="55" cy="58" rx="46" ry="46" fill="none" stroke={GREEN} strokeWidth="2.5" />

          {/* Open cap / rim at top - like a mug opening */}
          <ellipse cx="55" cy="13" rx="46" ry="9" fill={GREEN_LIGHT} stroke={GREEN} strokeWidth="2" />
          <ellipse cx="55" cy="13" rx="38" ry="6" fill="white" stroke={GREEN} strokeWidth="1.5" opacity="0.8" />

          {/* Percentage text */}
          <text x="55" y="60" textAnchor="middle" style={{ fontSize: 17, fontWeight: 900, fill: percent > 50 ? 'white' : GREEN }}>{percent}%</text>
          <text x="55" y="74" textAnchor="middle" style={{ fontSize: 8, fill: percent > 50 ? 'rgba(255,255,255,0.8)' : '#94A3B8' }}>this month</text>
        </svg>

        {/* Overflow drops when >= 95% */}
        {isOverflow && (
          <>
            <motion.div style={{ position: 'absolute', top: 2, left: 32, width: 7, height: 14, borderRadius: '50%', background: GREEN, opacity: 0.8 }}
              animate={{ y: [0, -8, 0], scaleY: [1, 1.3, 1] }}
              transition={{ duration: 1.0, repeat: Infinity }} />
            <motion.div style={{ position: 'absolute', top: 0, left: 52, width: 6, height: 12, borderRadius: '50%', background: '#4CAF50', opacity: 0.7 }}
              animate={{ y: [0, -10, 0], scaleY: [1, 1.4, 1] }}
              transition={{ duration: 1.3, repeat: Infinity, delay: 0.4 }} />
            <motion.div style={{ position: 'absolute', top: 3, left: 70, width: 5, height: 10, borderRadius: '50%', background: GREEN, opacity: 0.6 }}
              animate={{ y: [0, -7, 0], scaleY: [1, 1.2, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: 0.7 }} />
            {/* Drips falling down the side */}
            <motion.div style={{ position: 'absolute', top: 8, left: 8, width: 5, height: 5, borderRadius: '50%', background: GREEN }}
              animate={{ y: [0, 20, 0], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity }} />
            <motion.div style={{ position: 'absolute', top: 8, right: 8, width: 4, height: 4, borderRadius: '50%', background: GREEN }}
              animate={{ y: [0, 18, 0], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: 0.6 }} />
          </>
        )}
      </div>
    </div>
  )
}

function MiniCircle({ percent }) {
  const r = 9
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={22} height={22} style={{ flexShrink: 0 }}>
      <circle cx={11} cy={11} r={r} fill="none" stroke={GREEN_LIGHT} strokeWidth={3} />
      <circle cx={11} cy={11} r={r} fill="none" stroke={GREEN} strokeWidth={3}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 11 11)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
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
  const [totalDays, setTotalDays] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear] = useState(new Date().getFullYear())

  const isMobile = window.innerWidth < 768
  const today = new Date().toISOString().split('T')[0]
  // CHANGE 5: Current date display
  const nowDate = new Date()
  const todayLabel = `${DAYS[nowDate.getDay()]}, ${nowDate.getDate()} ${MONTHS[nowDate.getMonth()]}`

  const getMonthHalfDates = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    const start = halfOffset === 0 ? 1 : 16
    const end = halfOffset === 0 ? 15 : daysInMonth
    return Array.from({ length: end - start + 1 }, (_, i) => {
      const day = start + i
      const d = new Date(selectedYear, selectedMonth, day)
      return {
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        date: d.toISOString().split('T')[0]
      }
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
        if (data.every(h => h.habit_logs && h.habit_logs.some(l => l.date === ds))) {
          s++; d.setDate(d.getDate() - 1)
        } else break
      }
      setStreak(s)
      const allDates = new Set()
      data.forEach(h => h.habit_logs && h.habit_logs.forEach(l => allDates.add(l.date)))
      setTotalDays(allDates.size)
    }
  }

  const fetchTasks = async (uid) => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', uid).eq('date', today).order('created_at', { ascending: true })
    setTasks(data || [])
  }

  const addHabit = async () => {
    if (!newHabit.trim() || !user) return
    const { data } = await supabase.from('habits').insert({ user_id: user.id, name: newHabit, color: GREEN }).select()
    setHabits([...habits, { ...data[0], habit_logs: [] }])
    setNewHabit('')
  }

  const deleteHabit = async (habitId) => {
    if (!confirm('Delete this habit and all its logs?')) return
    await supabase.from('habit_logs').delete().eq('habit_id', habitId)
    await supabase.from('habits').delete().eq('id', habitId)
    setHabits(habits.filter(h => h.id !== habitId))
  }

  // CHANGE 3: addTask with empty title so placeholder shows
  const addTask = async () => {
    if (!user) return
    const { data } = await supabase.from('tasks').insert({ user_id: user.id, title: '', date: today, done: false }).select()
    setTasks([...tasks, data[0]])
  }

  const deleteTask = async (taskId) => {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  const updateTaskTitle = async (task, title) => {
    await supabase.from('tasks').update({ title }).eq('id', task.id)
    setTasks(tasks.map(t => t.id === task.id ? { ...t, title } : t))
  }

  // CHANGE 6: Block toggling future dates
  const toggleHabit = async (habitId, date) => {
    if (date > today) return // Cannot check future dates
    const habit = habits.find(h => h.id === habitId)
    const log = habit.habit_logs && habit.habit_logs.find(l => l.date === date)
    if (log) await supabase.from('habit_logs').delete().eq('id', log.id)
    else await supabase.from('habit_logs').insert({ user_id: user.id, habit_id: habitId, date, done: true })
    fetchHabits(user.id)
  }

  const toggleTask = async (task) => {
    await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id)
    const updated = tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t)
    setTasks(updated)
    if (updated.every(t => t.done) && updated.length > 0) {
      setCelebrate(true); setTimeout(() => setCelebrate(false), 3000)
    }
  }

  const isDone = (habit, date) => habit.habit_logs && habit.habit_logs.some(l => l.date === date)
  const isFuture = (date) => date > today

  const getHabitMonthProgress = (habit) => {
    if (!habit.habit_logs || habit.habit_logs.length === 0) return 0
    const done = monthDays.filter(d => isDone(habit, d.fullDate)).length
    return Math.round((done / monthDays.length) * 100)
  }

  const getHabitHalfProgress = (habit) => {
    if (!habit.habit_logs || habit.habit_logs.length === 0) return 0
    const done = weekDates.filter(d => isDone(habit, d.date)).length
    return Math.round((done / weekDates.length) * 100)
  }

  const monthProgress = habits.length > 0
    ? Math.round(monthDays.reduce((sum, day) => {
        const done = habits.filter(h => isDone(h, day.fullDate)).length
        return sum + (done / habits.length) * 100
      }, 0) / monthDays.length)
    : 0

  // CHANGE 2: interval=1 means every date shown, we use interval prop on XAxis = 1 (every 2 days)
  const chartData = monthDays.map(day => ({
    date: day.date,
    productivity: habits.length > 0
      ? Math.round((habits.filter(h => isDone(h, day.fullDate)).length / habits.length) * 100)
      : 0
  }))

  const firstName = user && user.user_metadata && user.user_metadata.name
    ? user.user_metadata.name.split(' ')[0] : 'there'
  const avatarLetter = firstName[0].toUpperCase()
  const C = { background: 'white', borderRadius: 20, boxShadow: '0 2px 20px rgba(40,94,44,0.10)' }
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()

  return (
    <div style={{ minHeight: '100vh', background: YELLOW, fontFamily: 'Inter, sans-serif', overflowY: 'auto' }}>

      {celebrate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}>
          {[...Array(20)].map((_, i) => (
            <motion.div key={i} style={{ position: 'absolute', fontSize: 24 }}
              initial={{ y: '100vh', x: `${Math.random() * 100}vw`, opacity: 1 }}
              animate={{ y: '-10vh', opacity: 0 }}
              transition={{ duration: 2, delay: Math.random() }}>
              {['🎉', '✨', '🌟', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ padding: isMobile ? 12 : 20 }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 22 : 30, fontWeight: 900, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>
              Hello <span style={{ color: GREEN }}>{firstName} ji,</span>
            </h1>
            <p style={{ fontSize: isMobile ? 13 : 16, fontStyle: 'italic', color: '#1a3a1c', fontFamily: 'Georgia, serif', marginTop: 4, marginBottom: 0 }}>
              Stay consistent, don't fool yourself.
            </p>
            <div style={{ height: 2, width: isMobile ? 180 : 300, background: `linear-gradient(90deg, ${GREEN}, transparent)`, marginTop: 5, borderRadius: 2 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* CHANGE 5: Show current date instead of date range */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <span style={{ fontSize: 12 }}>📅</span>
              <span style={{ fontWeight: 600, color: '#334155', fontSize: 11 }}>{todayLabel}</span>
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ width: 38, height: 38, borderRadius: '50%', background: GREEN, border: 'none', cursor: 'pointer', color: YELLOW, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarLetter}
              </button>
              {showUserMenu && (
                <div style={{ position: 'absolute', right: 0, top: 46, borderRadius: 12, padding: 8, background: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 160, zIndex: 50 }}>
                  <p style={{ padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#0F172A', margin: 0 }}>{firstName} ji</p>
                  <p style={{ padding: '0 12px 4px', fontSize: 11, color: '#94A3B8', margin: 0 }}>{user && user.email}</p>
                  <button onClick={onLogout} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 160px 1fr', gap: 14, marginBottom: 16 }}>

          {/* Chart */}
          <div style={{ ...C, padding: 13, height: isMobile ? 200 : 220, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', margin: 0 }}>Progress</h3>
                <span style={{ fontSize: 11, fontWeight: 600, color: GREEN }}>{MONTHS[selectedMonth]}</span>
              </div>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMonthPicker(!showMonthPicker)}
                  style={{ fontSize: 10, fontWeight: 500, color: GREEN, background: GREEN_LIGHT, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer' }}>
                  {MONTHS[selectedMonth].slice(0, 3)} {selectedYear} ▾
                </button>
                {showMonthPicker && (
                  <div style={{ position: 'absolute', right: 0, top: 28, background: 'white', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: 8, zIndex: 50, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, minWidth: 190 }}>
                    {MONTHS.map((m, i) => (
                      <button key={i} onClick={() => { setSelectedMonth(i); setShowMonthPicker(false) }}
                        style={{ padding: '5px 6px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, background: selectedMonth === i ? GREEN : 'transparent', color: selectedMonth === i ? YELLOW : '#334155' }}>
                        {m.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="110%">
                {/* CHANGE 2: interval=1 shows every 2nd tick (0-indexed), so gap of 2 days */}
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GREEN} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} ticks={[0, 50, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 10 }}
                    formatter={v => [`${v}%`, 'Progress']}
                    labelFormatter={l => `${MONTHS[selectedMonth]} ${l}`}
                    labelStyle={{ fontWeight: 700, color: '#0F172A' }} />
                  <Area type="monotone" dataKey="productivity" stroke={GREEN} strokeWidth={2} fill="url(#greenGrad)"
                    dot={false} activeDot={{ r: 4, fill: YELLOW, stroke: GREEN, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHANGE 7: Water Bowl — bigger, with cap, overflow */}
          <div style={{ ...C, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: isMobile ? 'auto' : 220 }}>
            <p style={{ fontWeight: 700, fontSize: 11, color: '#0F172A', margin: '0 0 2px 0', alignSelf: 'flex-start' }}>Overall</p>
            <p style={{ fontSize: 9, color: '#94A3B8', margin: '0 0 4px 0', alignSelf: 'flex-start' }}>{MONTHS[selectedMonth]} {selectedYear}</p>
            <WaterBowl percent={monthProgress} />
            <p style={{ fontSize: 9, color: '#4a7c4e', margin: '2px 0 0 0', textAlign: 'center', fontWeight: 600 }}>Total: {totalDays} days</p>
          </div>

          {/* RIGHT COLUMN: Extra Task of the Day + Streak (CHANGES 3 & 4) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: isMobile ? 'auto' : 220 }}>

            {/* CHANGE 3: "Extra Task of the Day" with Enter placeholder */}
            <div style={{ ...C, padding: 14, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: '#0F172A', margin: '0 0 8px 0', flexShrink: 0 }}>⚡ Extra Task of the Day</p>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
                <AnimatePresence>
                  {tasks.map((task) => (
                    <motion.div key={task.id} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => toggleTask(task)}
                        style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${task.done ? GREEN : '#CBD5E1'}`, background: task.done ? GREEN : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {task.done && <span style={{ color: YELLOW, fontSize: 8, fontWeight: 700 }}>✓</span>}
                      </button>
                      <input value={task.title} onChange={e => updateTaskTitle(task, e.target.value)}
                        placeholder="Enter task..."
                        style={{ flex: 1, outline: 'none', background: 'transparent', border: 'none', fontSize: 11, color: task.done ? '#94A3B8' : '#0F172A', textDecoration: task.done ? 'line-through' : 'none' }} />
                      <button onClick={() => deleteTask(task.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9CA3AF', flexShrink: 0, padding: 0 }}>🗑</button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div style={{ flexShrink: 0, marginTop: 6 }}>
                <button onClick={addTask}
                  style={{ width: '100%', height: tasks.length === 0 ? 50 : 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: `2px dashed ${GREEN}`, background: 'transparent', cursor: 'pointer' }}>
                  <span style={{ fontSize: 18, color: GREEN }}>+</span>
                </button>
                <p style={{ fontSize: 9, color: '#94A3B8', textAlign: 'center', marginTop: 3, marginBottom: 0 }}>Today only · removed tomorrow</p>
              </div>
            </div>

            {/* CHANGE 4: Streak — separate container */}
            <div style={{ ...C, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{ fontSize: 28 }}>🔥</div>
              <div>
                <p style={{ margin: 0, fontSize: 9, color: '#94A3B8', fontWeight: 600 }}>Current Streak</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: GREEN, lineHeight: 1.1 }}>{streak}<span style={{ fontSize: 12, fontWeight: 600, color: '#4a7c4e' }}> days</span></p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 9, color: '#94A3B8', fontWeight: 600 }}>Total Active</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: GREEN }}>{totalDays}<span style={{ fontSize: 10, color: '#4a7c4e' }}> days</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* CHANGE 1: 15-Day Report section REMOVED */}

        {/* HABIT TABLE */}
        <div style={{ ...C, padding: isMobile ? 12 : 16, overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', margin: 0 }}>Habit Tracker</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setHalfOffset(0)}
                style={{ padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, background: halfOffset === 0 ? GREEN : GREEN_LIGHT, color: halfOffset === 0 ? YELLOW : GREEN }}>
                1–15
              </button>
              <button onClick={() => setHalfOffset(1)}
                style={{ padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, background: halfOffset === 1 ? GREEN : GREEN_LIGHT, color: halfOffset === 1 ? YELLOW : GREEN }}>
                16–{daysInSelectedMonth}
              </button>
            </div>
          </div>

          <div style={{ minWidth: isMobile ? 480 : 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ width: isMobile ? 90 : 160, fontSize: 11, fontWeight: 600, color: '#94A3B8', flexShrink: 0 }}>Habit</div>
              <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                {weekDates.map((d, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: isMobile ? 7 : 9, fontWeight: 600, color: d.date === today ? GREEN : (isFuture(d.date) ? '#CBD5E1' : '#94A3B8'), margin: 0 }}>{d.label}</p>
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
                  <motion.div key={habit.id}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
                    <div style={{ width: isMobile ? 90 : 160, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <span style={{ fontSize: 13 }}>{HABIT_ICONS[hi % HABIT_ICONS.length]}</span>
                      <span style={{ fontSize: isMobile ? 9 : 11, fontWeight: 600, color: '#0F172A', flex: 1 }}>{habit.name}</span>
                      <button onClick={() => deleteHabit(habit.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B7280', padding: 0, flexShrink: 0 }}>🗑</button>
                    </div>
                    <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                      {weekDates.map((day) => {
                        const future = isFuture(day.date)
                        return (
                          <div key={day.date} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            {/* CHANGE 6: Future dates shown as disabled */}
                            <button
                              onClick={() => !future && toggleHabit(habit.id, day.date)}
                              disabled={future}
                              title={future ? 'Cannot mark future dates' : ''}
                              style={{
                                width: isMobile ? 14 : 17, height: isMobile ? 14 : 17, borderRadius: 3,
                                border: `2px solid ${future ? '#E2E8F0' : (isDone(habit, day.date) ? GREEN : '#CBD5E1')}`,
                                background: future ? '#F8FAFC' : (isDone(habit, day.date) ? GREEN : 'transparent'),
                                cursor: future ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: future ? 0.4 : 1
                              }}>
                              {!future && isDone(habit, day.date) && <span style={{ color: YELLOW, fontSize: 7, fontWeight: 700 }}>✓</span>}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ width: isMobile ? 56 : 90, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, justifyContent: 'flex-end' }}>
                      {!isMobile && (
                        <div style={{ flex: 1, height: 3, background: GREEN_LIGHT, borderRadius: 99 }}>
                          <div style={{ height: 3, width: `${halfProg}%`, background: GREEN, borderRadius: 99, transition: 'width 0.5s' }} />
                        </div>
                      )}
                      <span style={{ fontSize: 9, fontWeight: 700, color: GREEN }}>{halfProg}%</span>
                      <MiniCircle percent={monthProg} />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input id="habitInput" value={newHabit} onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
              placeholder="Add habit and press Enter..."
              style={{ flex: 1, borderRadius: 12, padding: '8px 14px', outline: 'none', background: '#F8FAFC', border: `1px solid ${GREEN_LIGHT}`, color: '#0F172A', fontSize: 12 }} />
            <button onClick={addHabit}
              style={{ padding: '8px 20px', borderRadius: 12, background: GREEN, color: YELLOW, fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
              Add
            </button>
          </div>

          {habits.length === 0 && (
            <p style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 12, margin: 0 }}>
              No habits yet! Add your first habit above.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
