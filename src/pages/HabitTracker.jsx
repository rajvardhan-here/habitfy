import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'

function CircularProgress({ percent, size = 60, stroke = 6, color = '#2563EB', bg = '#DBEAFE' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: size * 0.2, fontWeight: 700, fill: color }}>
        {percent}%
      </text>
    </svg>
  )
}

export default function HabitTracker() {
  const [habits, setHabits] = useState([])
  const [tasks, setTasks] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [user, setUser] = useState(null)
  const [celebrate, setCelebrate] = useState(false)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [streak, setStreak] = useState(7)

  const today = new Date().toISOString().split('T')[0]

  const getWeekDates = (offset = 0) => {
    return [...Array(15)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - 7 + i + offset * 15)
      return {
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        date: d.toISOString().split('T')[0],
        dayLetter: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()]
      }
    })
  }

  const weekDates = getWeekDates(currentWeekOffset)

  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return {
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      fullDate: d.toISOString().split('T')[0],
      productivity: 0
    }
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) { fetchHabits(user.id); fetchTasks(user.id) }
    })
  }, [])

  const fetchHabits = async (uid) => {
    const { data } = await supabase.from('habits').select('*, habit_logs(*)').eq('user_id', uid)
    setHabits(data || [])
  }

  const fetchTasks = async (uid) => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', uid).eq('date', today).order('created_at', { ascending: true })
    setTasks(data || [])
  }

  const addHabit = async () => {
    if (!newHabit.trim()) return
    const { data } = await supabase.from('habits').insert({ user_id: user.id, name: newHabit, color: '#2563EB' }).select()
    setHabits([...habits, { ...data[0], habit_logs: [] }])
    setNewHabit('')
  }

  const addTask = async () => {
    const taskNum = tasks.length + 1
    const { data } = await supabase.from('tasks').insert({
      user_id: user.id, title: `Task ${taskNum}`, date: today, done: false
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
    const last30 = [...Array(30)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split('T')[0]
    })
    const done = last30.filter(date => habit.habit_logs.some(l => l.date === date)).length
    return Math.round((done / 30) * 100)
  }

  const todayProgress = habits.length > 0
    ? Math.round((habits.filter(h => isDone(h, today)).length / habits.length) * 100) : 0

  const chartData = last30Days.map(day => ({
    ...day,
    productivity: habits.length > 0
      ? Math.round((habits.filter(h => isDone(h, day.fullDate)).length / habits.length) * 100) : 0
  }))

  const weekRange = `${weekDates[0].label} – ${weekDates[weekDates.length - 1].label}`

  return (
    <div className="min-h-screen p-6" style={{ background: '#EEF4FF' }}>

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

      {/* TOP HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#1e293b' }}>
            Hello <span style={{ color: '#2563EB' }}>{user?.user_metadata?.name?.split(' ')[0] || 'there'} ji,</span>
          </h1>
          <p className="text-lg italic mt-1" style={{ color: '#64748b', fontFamily: 'Georgia, serif' }}>
            Stay consistent, don't fool yourself.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: 14 }}>📅</span>
            <span className="text-sm font-medium" style={{ color: '#64748b' }}>{weekRange}</span>
            <button onClick={() => setCurrentWeekOffset(p => p - 1)} className="ml-2 text-gray-400 hover:text-gray-600">‹</button>
            <button onClick={() => setCurrentWeekOffset(p => p + 1)} className="text-gray-400 hover:text-gray-600">›</button>
          </div>
        </div>
      </div>

      {/* ROW 1 — Chart + Overall Progress + Extra Task */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 220px 220px' }}>

        {/* Weekly Progress Chart */}
        <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: '#1e293b' }}>Weekly Progress</h3>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#EEF4FF', color: '#2563EB' }}>This Week ▾</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={v => [`${v}%`, 'Progress']} />
              <Area type="monotone" dataKey="productivity" stroke="#2563EB" strokeWidth={2.5}
                fill="url(#blueGrad)" dot={{ fill: '#2563EB', r: 3, stroke: 'white', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#2563EB', stroke: 'white', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Overall Progress */}
        <div className="rounded-2xl p-5 flex flex-col" style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
          <h3 className="font-bold mb-3" style={{ color: '#1e293b' }}>Overall Progress</h3>
          <div className="flex-1 flex flex-col items-center justify-center rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
            <p className="text-5xl font-black text-white">{todayProgress}%</p>
            <p className="text-sm text-white opacity-80 mt-1">Completed</p>
          </div>
        </div>

        {/* Extra Task of the Day */}
        <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
          <h3 className="font-bold mb-3" style={{ color: '#1e293b' }}>Extra Task of the Day</h3>
          <div className="flex flex-col gap-2 mb-3">
            {tasks.map((task, i) => (
              <div key={task.id} className="flex items-center gap-2">
                <button onClick={() => toggleTask(task)}
                  className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: task.done ? '#2563EB' : '#CBD5E1', background: task.done ? '#2563EB' : 'transparent' }}>
                  {task.done && <span className="text-white text-xs">✓</span>}
                </button>
                <input value={task.title} onChange={e => updateTaskTitle(task, e.target.value)}
                  placeholder={`Task ${i + 1}`}
                  className="flex-1 text-xs outline-none bg-transparent"
                  style={{ color: task.done ? '#94a3b8' : '#1e293b', textDecoration: task.done ? 'line-through' : 'none' }} />
              </div>
            ))}
          </div>
          <button onClick={addTask}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 border-2 border-dashed"
            style={{ borderColor: '#CBD5E1', color: '#94a3b8' }}>
            <span className="text-lg">+</span>
          </button>
          <p className="text-xs text-center mt-2" style={{ color: '#94a3b8' }}>Add a task for today only.</p>
          <p className="text-xs text-center" style={{ color: '#94a3b8' }}>It will be removed tomorrow.</p>
        </div>
      </div>

      {/* ROW 2 — Current Streak */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
              <span className="text-xl">🔥</span>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: '#64748b' }}>Current Streak</p>
              <p className="text-2xl font-black" style={{ color: '#1e293b' }}>{streak}</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Days in a row</p>
            </div>
          </div>
          <div className="flex gap-1 ml-4 flex-wrap">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded"
                style={{ background: i < streak ? '#2563EB' : '#E2E8F0' }} />
            ))}
          </div>
          <div className="flex gap-3 ml-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-xs" style={{ color: '#94a3b8' }}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3 — Habit Tracker Table */}
      <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: '#1e293b' }}>Habit Tracker</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentWeekOffset(p => p - 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#F1F5F9', color: '#64748b' }}>‹</button>
            <button onClick={() => setCurrentWeekOffset(p => p + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#F1F5F9', color: '#64748b' }}>›</button>
            <button onClick={() => { }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
              onClickCapture={addHabit}>
              + Add Habit
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="flex items-center gap-2 mb-2 px-2">
          <div className="text-xs font-semibold" style={{ color: '#94a3b8', width: 120 }}>Habit</div>
          <div className="flex gap-1 flex-1">
            {weekDates.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <p className="text-xs font-medium" style={{ color: d.date === today ? '#2563EB' : '#94a3b8', fontSize: 10 }}>{d.label}</p>
              </div>
            ))}
          </div>
          <div className="text-xs font-semibold text-right" style={{ color: '#94a3b8', width: 70 }}>Progress</div>
        </div>

        {/* Habit Rows */}
        <AnimatePresence>
          {habits.map((habit, hi) => {
            const prog = getHabitProgress(habit)
            return (
              <motion.div key={habit.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 py-2 border-b"
                style={{ borderColor: '#F1F5F9' }}>
                <div className="flex items-center gap-2" style={{ width: 120 }}>
                  <span className="text-sm">{['💪', '📚', '💻', '✍️', '🧘'][hi % 5]}</span>
                  <span className="text-sm font-medium truncate" style={{ color: '#1e293b' }}>{habit.name}</span>
                </div>
                <div className="flex gap-1 flex-1">
                  {weekDates.map((day) => (
                    <div key={day.date} className="flex-1 flex justify-center">
                      <button onClick={() => toggleHabit(habit.id, day.date)}
                        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: isDone(habit, day.date) ? '#2563EB' : '#CBD5E1',
                          background: isDone(habit, day.date) ? '#2563EB' : 'transparent'
                        }}>
                        {isDone(habit, day.date) && <span className="text-white" style={{ fontSize: 9 }}>✓</span>}
                      </button>
                    </div>
                  ))}
                </div>
                {/* Progress bar + circle */}
                <div className="flex items-center gap-2" style={{ width: 70 }}>
                  <CircularProgress percent={prog} size={32} stroke={3} color="#2563EB" bg="#DBEAFE" />
                  <span className="text-xs font-semibold" style={{ color: '#2563EB' }}>{prog}%</span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Add habit input */}
        <div className="flex gap-2 mt-3">
          <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addHabit()}
            placeholder="Type habit name and press Enter..."
            className="flex-1 rounded-xl px-4 py-2 text-sm outline-none"
            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#1e293b' }} />
          <button onClick={addHabit}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>Add</button>
        </div>

        {habits.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: '#94a3b8' }}>Add your first habit above!</p>
        )}
      </div>
    </div>
  )
}