import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const HABIT_ICONS = ['💪', '📚', '💻', '✍️', '🧘', '🎯', '🏃', '🎨', '🎵', '💡']

function LiquidProgress({ percent }) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #60A5FA 0%, #2563EB 100%)', minHeight: 110, padding: '16px' }}>

      {/* Wave animation */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden"
        style={{ height: `${percent}%`, transition: 'height 1s ease', minHeight: 0 }}>
        <svg viewBox="0 0 400 60" preserveAspectRatio="none"
          style={{ width: '200%', height: 40, marginLeft: '-50%', position: 'absolute', top: 0 }}>
          <motion.path
            animate={{ x: [0, -200] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            d="M0,30 C50,10 100,50 150,30 C200,10 250,50 300,30 C350,10 400,50 450,30 L450,60 L0,60 Z"
            fill="rgba(255,255,255,0.25)" />
        </svg>
        <div style={{ position: 'absolute', top: 30, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.15)' }} />
      </div>

      <div className="relative z-10 text-center">
        <p style={{ fontSize: 46, fontWeight: 900, color: 'white', lineHeight: 1 }}>{percent}%</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Completed</p>
      </div>
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
  const [showUserMenu, setShowUserMenu] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const getWeekDates = () => {
    return [...Array(15)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - 7 + i + weekOffset * 15)
      return {
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        date: d.toISOString().split('T')[0],
      }
    })
  }

  const weekDates = getWeekDates()
  const weekRange = `${weekDates[0].label} – ${weekDates[weekDates.length - 1].label}, ${new Date().getFullYear()}`

  useEffect(() => {
    const u = propUser || null
    if (u) { setUser(u); fetchHabits(u.id); fetchTasks(u.id) }
    else {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) { setUser(user); fetchHabits(user.id); fetchTasks(user.id) }
      })
    }
  }, [propUser])

  const fetchHabits = async (uid) => {
    const { data } = await supabase.from('habits').select('*, habit_logs(*)').eq('user_id', uid)
    setHabits(data || [])
    if (data && data.length > 0) {
      let s = 0
      const checkDate = new Date()
      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0]
        const allDone = data.every(h => h.habit_logs?.some(l => l.date === dateStr))
        if (allDone) { s++; checkDate.setDate(checkDate.getDate() - 1) }
        else break
      }
      setStreak(s)
    }
  }

  const fetchTasks = async (uid) => {
    const { data } = await supabase.from('tasks').select('*')
      .eq('user_id', uid).eq('date', today).order('created_at', { ascending: true })
    setTasks(data || [])
  }

  const addHabit = async () => {
    if (!newHabit.trim() || !user) return
    const { data } = await supabase.from('habits').insert({ user_id: user.id, name: newHabit, color: '#2563EB' }).select()
    setHabits([...habits, { ...data[0], habit_logs: [] }])
    setNewHabit('')
  }

  const addTask = async () => {
    if (!user) return
    const { data } = await supabase.from('tasks').insert({
      user_id: user.id, title: `Task ${tasks.length + 1}`, date: today, done: false
    }).select()
    setTasks([...tasks, data[0]])
  }

  const updateTaskTitle = async (task, title) => {
    await supabase.from('tasks').update({ title }).eq('id', task.id)
    setTasks(tasks.map(t => t.id === task.id ? { ...t, title } : t))
  }

  const toggleHabit = async (habitId, date) => {
    const habit = habits.find(h => h.id === habitId)
    const existingLog = habit.habit_logs?.find(l => l.date === date)
    if (existingLog) {
      await supabase.from('habit_logs').delete().eq('id', existingLog.id)
    } else {
      await supabase.from('habit_logs').insert({ user_id: user.id, habit_id: habitId, date, done: true })
    }
    fetchHabits(user.id)
  }

  const toggleTask = async (task) => {
    await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id)
    const updated = tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t)
    setTasks(updated)
    if (updated.every(t => t.done) && updated.length > 0) {
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 3000)
    }
  }

  const isDone = (habit, date) => habit.habit_logs?.some(l => l.date === date)

  const getHabitProgress = (habit) => {
    if (!habit.habit_logs || habit.habit_logs.length === 0) return 0
    const done = weekDates.filter(d => isDone(habit, d.date)).length
    return Math.round((done / weekDates.length) * 100)
  }

  const todayProgress = habits.length > 0
    ? Math.round((habits.filter(h => isDone(h, today)).length / habits.length) * 100) : 0

  const chartData = [...Array(30)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const fullDate = d.toISOString().split('T')[0]
    return {
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      productivity: habits.length > 0
        ? Math.round((habits.filter(h => isDone(h, fullDate)).length / habits.length) * 100) : 0
    }
  })

  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'there'
  const avatarLetter = firstName[0]?.toUpperCase()

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: '#EEF4FF', fontFamily: "'Inter', sans-serif" }}>

      {celebrate && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div key={i} className="absolute text-2xl"
              initial={{ y: '100vh', x: `${Math.random() * 100}vw`, opacity: 1 }}
              animate={{ y: '-10vh', opacity: 0 }}
              transition={{ duration: 2, delay: Math.random() }}>
              {['🎉', '✨', '🌟', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}

      <div className="p-5">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
              Hello <span style={{ color: '#2563EB' }}>{firstName} ji,</span>
            </h1>
            <p style={{ fontSize: 19, fontStyle: 'italic', color: '#64748B', fontFamily: 'Georgia, serif', marginTop: 3 }}>
              Stay consistent, don't fool yourself.
            </p>
            <div style={{ height: 2, width: 340, background: 'linear-gradient(90deg, #2563EB, transparent)', marginTop: 5, borderRadius: 2 }} />
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 13 }}>📅</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>{weekRange}</span>
              <button onClick={() => setWeekOffset(p => p - 1)} style={{ color: '#94A3B8', fontWeight: 700, fontSize: 15, marginLeft: 4 }}>‹</button>
              <button onClick={() => setWeekOffset(p => p + 1)} style={{ color: '#94A3B8', fontWeight: 700, fontSize: 15 }}>›</button>
            </div>
            <div className="relative">
              <button className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 17 }}>🔔</span>
              </button>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ background: '#2563EB', fontSize: 10, fontWeight: 700 }}>2</div>
            </div>
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{ background: '#2563EB', boxShadow: '0 2px 10px rgba(37,99,235,0.3)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ fontSize: 13 }}>{avatarLetter}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{firstName} ji</span>
                <span style={{ color: 'white', fontSize: 11 }}>▾</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-12 rounded-xl p-2 z-50"
                  style={{ background: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 160 }}>
                  <p className="px-3 py-1 text-xs" style={{ color: '#94A3B8' }}>{user?.email}</p>
                  <button onClick={onLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ color: '#EF4444' }}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 1 */}
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 200px 230px' }}>

          {/* Chart — no white space */}
          <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>Weekly Progress</h3>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#2563EB', background: '#EEF4FF', padding: '2px 10px', borderRadius: 20 }}>
                This Week ▾
              </span>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 11 }}
                  formatter={v => [`${v}%`, 'Progress']} labelStyle={{ fontWeight: 700, color: '#0F172A' }} />
                <Area type="monotone" dataKey="productivity" stroke="#2563EB" strokeWidth={2}
                  fill="url(#blueGrad)"
                  dot={{ fill: '#2563EB', r: 2.5, stroke: 'white', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#2563EB', stroke: 'white', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Overall Progress + Streak stacked */}
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 8 }}>Overall Progress</h3>
              <LiquidProgress percent={todayProgress} />
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 8 }}>Current Streak</h3>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #60A5FA, #2563EB)' }}>
                  <span style={{ fontSize: 16 }}>🔥</span>
                </div>
                <div>
                  <p style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{streak}</p>
                  <p style={{ fontSize: 10, color: '#94A3B8' }}>Days in a row</p>
                </div>
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {[...Array(14)].map((_, i) => (
                  <div key={i} className="rounded" style={{ width: 12, height: 12, background: i < streak ? '#2563EB' : '#E2E8F0' }} />
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} style={{ fontSize: 7, color: '#CBD5E1', width: 12, textAlign: 'center', display: 'inline-block' }}>{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Extra Task */}
          <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 10 }}>Extra Task of the Day</h3>
            <div className="flex flex-col gap-2 mb-3">
              <AnimatePresence>
                {tasks.map((task, i) => (
                  <motion.div key={task.id} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2">
                    <button onClick={() => toggleTask(task)}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: task.done ? '#2563EB' : '#CBD5E1', background: task.done ? '#2563EB' : 'transparent' }}>
                      {task.done && <span style={{ color: 'white', fontSize: 9 }}>✓</span>}
                    </button>
                    <input value={task.title} onChange={e => updateTaskTitle(task, e.target.value)}
                      placeholder={`Task ${i + 1}`} className="flex-1 outline-none bg-transparent"
                      style={{ fontSize: 12, color: task.done ? '#94A3B8' : '#0F172A', textDecoration: task.done ? 'line-through' : 'none' }} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button onClick={addTask} className="w-full flex items-center justify-center rounded-xl border-2 border-dashed"
              style={{ borderColor: '#BFDBFE', padding: '18px 0' }}>
              <span style={{ fontSize: 26, color: '#93C5FD' }}>+</span>
            </button>
            <p style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: 6 }}>Add a task for today only.</p>
            <p style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center' }}>It will be removed tomorrow.</p>
          </div>
        </div>

        {/* HABIT TRACKER TABLE */}
        <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Habit Tracker</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekOffset(p => p - 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#F1F5F9', color: '#64748B', fontWeight: 700, fontSize: 15 }}>‹</button>
              <button onClick={() => setWeekOffset(p => p + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#F1F5F9', color: '#64748B', fontWeight: 700, fontSize: 15 }}>›</button>
              <button onClick={() => document.getElementById('habitInput').focus()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', fontSize: 12 }}>
                + Add Habit
              </button>
            </div>
          </div>

          {/* Header row */}
          <div className="flex items-center gap-1 pb-2 border-b" style={{ borderColor: '#F1F5F9' }}>
            <div style={{ width: 150, fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>Habit</div>
            <div className="flex gap-1 flex-1">
              {weekDates.map((d, i) => (
                <div key={i} className="flex-1 text-center">
                  <p style={{ fontSize: 10, fontWeight: 600, color: d.date === today ? '#2563EB' : '#94A3B8' }}>{d.label}</p>
                </div>
              ))}
            </div>
            <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: '#94A3B8', textAlign: 'right' }}>Progress</div>
          </div>

          {/* Habit rows */}
          <AnimatePresence>
            {habits.map((habit, hi) => {
              const prog = getHabitProgress(habit)
              return (
                <motion.div key={habit.id}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1 py-2.5 border-b" style={{ borderColor: '#F8FAFC' }}>
                  <div className="flex items-center gap-2" style={{ width: 150 }}>
                    <span style={{ fontSize: 14 }}>{HABIT_ICONS[hi % HABIT_ICONS.length]}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{habit.name}</span>
                  </div>
                  <div className="flex gap-1 flex-1">
                    {weekDates.map((day) => (
                      <div key={day.date} className="flex-1 flex justify-center">
                        <button onClick={() => toggleHabit(habit.id, day.date)}
                          className="flex items-center justify-center transition-all"
                          style={{
                            width: 18, height: 18, borderRadius: 4,
                            border: `2px solid ${isDone(habit, day.date) ? '#2563EB' : '#CBD5E1'}`,
                            background: isDone(habit, day.date) ? '#2563EB' : 'transparent'
                          }}>
                          {isDone(habit, day.date) && <span style={{ color: 'white', fontSize: 9 }}>✓</span>}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2" style={{ width: 80 }}>
                    <div className="flex-1 rounded-full" style={{ height: 3, background: '#DBEAFE' }}>
                      <div className="rounded-full" style={{ height: 3, width: `${prog}%`, background: '#2563EB', transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#2563EB', minWidth: 26 }}>{prog}%</span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Empty circles */}
          {habits.length > 0 && (
            <div className="flex items-center gap-1 py-2">
              <div style={{ width: 150 }} />
              <div className="flex gap-1 flex-1">
                {weekDates.map((_, i) => (
                  <div key={i} className="flex-1 flex justify-center">
                    <div className="rounded-full border" style={{ width: 14, height: 14, borderColor: '#CBD5E1' }} />
                  </div>
                ))}
              </div>
              <div style={{ width: 80 }} />
            </div>
          )}

          {/* Add habit */}
          <div className="flex gap-2 mt-2">
            <input id="habitInput" value={newHabit} onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
              placeholder="Type habit name and press Enter..."
              className="flex-1 rounded-xl px-3 py-2 outline-none"
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', fontSize: 12 }} />
            <button onClick={addHabit}
              className="px-4 py-2 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', fontSize: 12 }}>Add</button>
          </div>

          {habits.length === 0 && (
            <p className="text-center py-5" style={{ color: '#94A3B8', fontSize: 12 }}>No habits yet! Add your first habit above.</p>
          )}
        </div>
      </div>
    </div>
  )
}