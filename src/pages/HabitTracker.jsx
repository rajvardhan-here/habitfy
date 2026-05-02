import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const HABIT_ICONS = ['💪', '📚', '💻', '✍️', '🧘', '🎯', '🏃', '🎨', '🎵', '💡']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const ROW_HEIGHT = 220

const GREEN = '#285E2C'
const GREEN_LIGHT = '#E8F5E9'
const YELLOW = '#FFE67C'
const YELLOW_DARK = '#C9A800'

function LiquidProgress({ percent }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={95} height={95}>
        <defs>
          <linearGradient id="circGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor={GREEN} />
          </linearGradient>
        </defs>
        <circle cx={47} cy={47} r={r} fill="none" stroke={GREEN_LIGHT} strokeWidth={8} />
        <motion.circle cx={47} cy={47} r={r} fill="none" stroke="url(#circGrad)" strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 47 47)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="47" y="43" textAnchor="middle" style={{ fontSize: 18, fontWeight: 900, fill: GREEN }}>{percent}%</text>
        <text x="47" y="58" textAnchor="middle" style={{ fontSize: 9, fill: '#94A3B8' }}>Completed</text>
      </svg>
    </div>
  )
}

export default function HabitTracker({ user: propUser, onLogout }) {
  const [habits, setHabits] = useState([])
  const [tasks, setTasks] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [user, setUser] = useState(propUser || null)
  const [celebrate, setCelebrate] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [streak, setStreak] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear] = useState(new Date().getFullYear())

  const today = new Date().toISOString().split('T')[0]

  const getWeekDates = () => [...Array(15)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 7 + i + weekOffset * 15)
    return { label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), date: d.toISOString().split('T')[0] }
  })

  const weekDates = getWeekDates()
  const weekRange = `${weekDates[0].label} – ${weekDates[weekDates.length - 1].label}, ${selectedYear}`

  const getDaysInMonth = (month, year) => {
    const days = new Date(year, month + 1, 0).getDate()
    return [...Array(days)].map((_, i) => {
      const d = new Date(year, month, i + 1)
      return { date: `${i + 1}`, fullDate: d.toISOString().split('T')[0], productivity: 0 }
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
    if (data?.length > 0) {
      let s = 0
      const d = new Date()
      for (let i = 0; i < 365; i++) {
        const ds = d.toISOString().split('T')[0]
        if (data.every(h => h.habit_logs?.some(l => l.date === ds))) { s++; d.setDate(d.getDate() - 1) } else break
      }
      setStreak(s)
      const allDates = new Set()
      data.forEach(h => h.habit_logs?.forEach(l => allDates.add(l.date)))
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

  const addTask = async () => {
    if (!user) return
    const { data } = await supabase.from('tasks').insert({ user_id: user.id, title: `Task ${tasks.length + 1}`, date: today, done: false }).select()
    setTasks([...tasks, data[0]])
  }

  const updateTaskTitle = async (task, title) => {
    await supabase.from('tasks').update({ title }).eq('id', task.id)
    setTasks(tasks.map(t => t.id === task.id ? { ...t, title } : t))
  }

  const toggleHabit = async (habitId, date) => {
    const habit = habits.find(h => h.id === habitId)
    const log = habit.habit_logs?.find(l => l.date === date)
    if (log) await supabase.from('habit_logs').delete().eq('id', log.id)
    else await supabase.from('habit_logs').insert({ user_id: user.id, habit_id: habitId, date, done: true })
    fetchHabits(user.id)
  }

  const toggleTask = async (task) => {
    await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id)
    const updated = tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t)
    setTasks(updated)
    if (updated.every(t => t.done) && updated.length > 0) { setCelebrate(true); setTimeout(() => setCelebrate(false), 3000) }
  }

  const isDone = (habit, date) => habit.habit_logs?.some(l => l.date === date)
  const getProgress = (habit) => {
    if (!habit.habit_logs?.length) return 0
    return Math.round((weekDates.filter(d => isDone(habit, d.date)).length / weekDates.length) * 100)
  }
  const todayProgress = habits.length > 0 ? Math.round((habits.filter(h => isDone(h, today)).length / habits.length) * 100) : 0

  const chartData = monthDays.map(day => ({
    ...day,
    productivity: habits.length > 0 ? Math.round((habits.filter(h => isDone(h, day.fullDate)).length / habits.length) * 100) : 0
  }))

  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'there'
  const avatarLetter = firstName[0]?.toUpperCase()
  const C = { background: 'white', borderRadius: 20, boxShadow: '0 2px 20px rgba(40,94,44,0.10)' }

  return (
    <div style={{ minHeight: '100vh', background: YELLOW, fontFamily: "'Inter', sans-serif", overflowY: 'auto' }}>

      {celebrate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}>
          {[...Array(30)].map((_, i) => (
            <motion.div key={i} style={{ position: 'absolute', fontSize: 24 }}
              initial={{ y: '100vh', x: `${Math.random() * 100}vw`, opacity: 1 }}
              animate={{ y: '-10vh', opacity: 0 }}
              transition={{ duration: 2, delay: Math.random() }}>
              {['🎉', '✨', '🌟', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ padding: 20 }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>
              Hello <span style={{ color: GREEN }}>{firstName} ji,</span>
            </h1>
            <p style={{ fontSize: 18, fontStyle: 'italic', color: '#1a3a1c', fontFamily: 'Georgia, serif', marginTop: 4, marginBottom: 0 }}>
              Stay consistent, don't fool yourself.
            </p>
            <div style={{ height: 2, width: 340, background: `linear-gradient(90deg, ${GREEN}, transparent)`, marginTop: 6, borderRadius: 2 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 12, background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <span style={{ fontSize: 13 }}>📅</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>{weekRange}</span>
              <button onClick={() => setWeekOffset(p => p - 1)} style={{ color: '#94A3B8', fontWeight: 700, fontSize: 15, background: 'none', border: 'none', cursor: 'pointer' }}>‹</button>
              <button onClick={() => setWeekOffset(p => p + 1)} style={{ color: '#94A3B8', fontWeight: 700, fontSize: 15, background: 'none', border: 'none', cursor: 'pointer' }}>›</button>
            </div>
            <div style={{ position: 'relative' }}>
              <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', fontSize: 17 }}>🔔</button>
              <div style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ width: 40, height: 40, borderRadius: '50%', background: GREEN, border: 'none', cursor: 'pointer', boxShadow: `0 2px 10px rgba(40,94,44,0.35)`, color: YELLOW, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarLetter}
              </button>
              {showUserMenu && (
                <div style={{ position: 'absolute', right: 0, top: 48, borderRadius: 12, padding: 8, background: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 160, zIndex: 50 }}>
                  <p style={{ padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#0F172A', margin: 0 }}>{firstName} ji</p>
                  <p style={{ padding: '0 12px 4px', fontSize: 11, color: '#94A3B8', margin: 0 }}>{user?.email}</p>
                  <button onClick={onLogout} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 200px', gap: 14, marginBottom: 16 }}>

          {/* Chart */}
          <div style={{ ...C, padding: 14, height: ROW_HEIGHT, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', margin: 0 }}>Weekly Progress</h3>
                <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>{MONTHS[selectedMonth]}</span>
              </div>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMonthPicker(!showMonthPicker)}
                  style={{ fontSize: 10, fontWeight: 500, color: GREEN, background: GREEN_LIGHT, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer' }}>
                  {MONTHS[selectedMonth]} {selectedYear} ▾
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GREEN} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 10 }}
                    formatter={v => [`${v}%`, 'Progress']}
                    labelFormatter={l => `${MONTHS[selectedMonth]} ${l}`}
                    labelStyle={{ fontWeight: 700, color: '#0F172A' }} />
                  <Area type="monotone" dataKey="productivity" stroke={GREEN} strokeWidth={2} fill="url(#greenGrad)"
                    dot={{ fill: GREEN, r: 2, stroke: 'white', strokeWidth: 1 }}
                    activeDot={{ r: 4, fill: YELLOW, stroke: GREEN, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Overall Progress + Streak */}
          <div style={{ height: ROW_HEIGHT, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ ...C, padding: 12, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#0F172A', margin: '0 0 6px 0', alignSelf: 'flex-start' }}>Overall Progress</p>
              <LiquidProgress percent={todayProgress} />
            </div>
            <div style={{ ...C, padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 16 }}>🔥</span>
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#94A3B8', margin: 0, fontWeight: 600 }}>Current Streak</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', lineHeight: 1.1, margin: 0 }}>{streak} <span style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8' }}>days</span></p>
                <p style={{ fontSize: 10, color: GREEN, margin: 0, fontWeight: 600 }}>Total: {totalDays} days</p>
              </div>
            </div>
          </div>

          {/* Extra Task */}
          <div style={{ ...C, padding: 14, height: ROW_HEIGHT, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontWeight: 700, fontSize: 12, color: '#0F172A', margin: '0 0 10px 0', flexShrink: 0 }}>Extra Task of the Day</p>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, overflowY: 'auto' }}>
              <AnimatePresence>
                {tasks.map((task, i) => (
                  <motion.div key={task.id} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => toggleTask(task)}
                      style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${task.done ? GREEN : '#CBD5E1'}`, background: task.done ? GREEN : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {task.done && <span style={{ color: YELLOW, fontSize: 8, fontWeight: 700 }}>✓</span>}
                    </button>
                    <input value={task.title} onChange={e => updateTaskTitle(task, e.target.value)}
                      placeholder={`Task ${i + 1}`}
                      style={{ flex: 1, outline: 'none', background: 'transparent', border: 'none', fontSize: 11, color: task.done ? '#94A3B8' : '#0F172A', textDecoration: task.done ? 'line-through' : 'none' }} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div style={{ flexShrink: 0, marginTop: 10 }}>
              <button onClick={addTask}
                style={{ width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: `2px dashed ${GREEN}`, background: 'transparent', cursor: 'pointer' }}>
                <span style={{ fontSize: 24, color: GREEN }}>+</span>
              </button>
              <p style={{ fontSize: 9, color: '#94A3B8', textAlign: 'center', marginTop: 4, marginBottom: 0 }}>Today only · removed tomorrow</p>
            </div>
          </div>
        </div>

        {/* HABIT TABLE */}
        <div style={{ ...C, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', margin: 0 }}>Habit Tracker</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setWeekOffset(p => p - 1)} style={{ width: 28, height: 28, borderRadius: 8, background: GREEN_LIGHT, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, color: GREEN }}>‹</button>
              <button onClick={() => setWeekOffset(p => p + 1)} style={{ width: 28, height: 28, borderRadius: 8, background: GREEN_LIGHT, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, color: GREEN }}>›</button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ width: 150, fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>Habit</div>
            <div style={{ display: 'flex', gap: 4, flex: 1 }}>
              {weekDates.map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: d.date === today ? GREEN : '#94A3B8', margin: 0 }}>{d.label}</p>
                </div>
              ))}
            </div>
            <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: '#94A3B8', textAlign: 'right' }}>Progress</div>
          </div>

          <AnimatePresence>
            {habits.map((habit, hi) => {
              const prog = getProgress(habit)
              return (
                <motion.div key={habit.id}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <div style={{ width: 150, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{HABIT_ICONS[hi % HABIT_ICONS.length]}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{habit.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                    {weekDates.map((day) => (
                      <div key={day.date} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <button onClick={() => toggleHabit(habit.id, day.date)}
                          style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isDone(habit, day.date) ? GREEN : '#CBD5E1'}`, background: isDone(habit, day.date) ? GREEN : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isDone(habit, day.date) && <span style={{ color: YELLOW, fontSize: 9, fontWeight: 700 }}>✓</span>}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 3, background: GREEN_LIGHT, borderRadius: 99 }}>
                      <div style={{ height: 3, width: `${prog}%`, background: GREEN, borderRadius: 99, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: GREEN, minWidth: 26 }}>{prog}%</span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {habits.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 0' }}>
              <div style={{ width: 150 }} />
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                {weekDates.map((_, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${GREEN}` }} />
                  </div>
                ))}
              </div>
              <div style={{ width: 80 }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input id="habitInput" value={newHabit} onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
              placeholder="Type habit name and press Enter..."
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