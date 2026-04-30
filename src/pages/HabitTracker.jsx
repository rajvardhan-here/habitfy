import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function HabitTracker() {
  const [habits, setHabits] = useState([])
  const [tasks, setTasks] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [user, setUser] = useState(null)
  const [celebrate, setCelebrate] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  // Last 30 days real dates
  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return {
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      fullDate: d.toISOString().split('T')[0],
      productivity: Math.floor(Math.random() * 60) + 20
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
    const { data } = await supabase.from('habits').insert({ user_id: user.id, name: newHabit, color: '#96AD94' }).select()
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

  const toggleHabit = async (habit) => {
    const existingLog = habit.habit_logs?.find(l => l.date === today)
    if (existingLog) {
      await supabase.from('habit_logs').delete().eq('id', existingLog.id)
    } else {
      await supabase.from('habit_logs').insert({ user_id: user.id, habit_id: habit.id, date: today, done: true })
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

  const todayDone = (habit) => habit.habit_logs?.some(l => l.date === today)
  const completedHabits = habits.filter(h => todayDone(h)).length
  const progress = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', color: '#53161D' }}>
          <p className="font-bold">{label}</p>
          <p style={{ color: '#96AD94' }}>Productivity: {payload[0].value}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#7DB9E8' }}>

      {/* Celebration */}
      {celebrate && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div key={i} className="absolute text-2xl"
              initial={{ y: '100vh', x: `${Math.random() * 100}vw`, opacity: 1 }}
              animate={{ y: '-10vh', opacity: 0 }}
              transition={{ duration: 2, delay: Math.random() * 1 }}>
              {['🎉', '✨', '🌟', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}

      {/* LEFT — 62% */}
      <div className="flex flex-col p-6 overflow-y-auto" style={{ width: '62%' }}>

        <div className="mb-5">
          <h1 className="text-2xl font-bold" style={{ color: 'white' }}>Habit Tracker ✅</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Progress */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: '#53161D' }}>Today's Progress</span>
            <span className="text-sm font-bold" style={{ color: '#96AD94' }}>{progress}%</span>
          </div>
          <div className="w-full rounded-full h-2.5" style={{ background: '#E8F4FD' }}>
            <motion.div className="h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8 }}
              style={{ background: 'linear-gradient(90deg, #96AD94, #6a8f68)' }} />
          </div>
          <p className="text-xs mt-1" style={{ color: '#97CBFB' }}>{completedHabits} of {habits.length} habits done</p>
        </div>

        {/* Share Market Style Area Chart */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold" style={{ color: '#53161D' }}>Daily Productivity</h3>
            <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: 'rgba(150,173,148,0.15)', color: '#96AD94' }}>Last 30 Days</span>
          </div>
          <p className="text-xs mb-3" style={{ color: '#97CBFB' }}>Track how productive you've been each day</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={last30Days} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#96AD94" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#96AD94" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,173,148,0.15)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#97CBFB' }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#97CBFB' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="productivity"
                stroke="#96AD94"
                strokeWidth={2}
                fill="url(#prodGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#96AD94', stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Habits List */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#53161D' }}>My Habits</h3>
          <AnimatePresence>
            {habits.map((habit) => (
              <motion.div key={habit.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 py-2.5 border-b last:border-0"
                style={{ borderColor: 'rgba(150,173,148,0.15)' }}>
                <button onClick={() => toggleHabit(habit)}
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ borderColor: todayDone(habit) ? '#96AD94' : 'rgba(150,173,148,0.4)', background: todayDone(habit) ? '#96AD94' : 'transparent' }}>
                  {todayDone(habit) && <span className="text-white text-xs font-bold">✓</span>}
                </button>
                <span className="text-sm flex-1" style={{ color: todayDone(habit) ? 'rgba(150,173,148,0.6)' : '#53161D', textDecoration: todayDone(habit) ? 'line-through' : 'none' }}>
                  {habit.name}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {habits.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: '#97CBFB' }}>Add your first habit below!</p>
          )}
          <div className="flex gap-2 mt-3">
            <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
              placeholder="Add new habit..."
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: '#F0F7FF', border: '1px solid rgba(150,173,148,0.3)', color: '#53161D' }} />
            <button onClick={addHabit}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #96AD94, #6a8f68)' }}>+</button>
          </div>
        </div>
      </div>

      {/* RIGHT — 38% */}
      <div className="p-6 overflow-y-auto" style={{ width: '38%' }}>
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#53161D' }}>Today's Tasks</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(150,173,148,0.15)', color: '#96AD94' }}>
                {tasks.filter(t => t.done).length}/{tasks.length}
              </span>
              <button onClick={addTask}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ background: 'linear-gradient(135deg, #96AD94, #6a8f68)' }}>+</button>
            </div>
          </div>

          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div key={task.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 py-2.5 border-b last:border-0"
                style={{ borderColor: 'rgba(150,173,148,0.15)' }}>
                <button onClick={() => toggleTask(task)}
                  className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ borderColor: task.done ? '#96AD94' : 'rgba(150,173,148,0.4)', background: task.done ? '#96AD94' : 'transparent' }}>
                  {task.done && <span className="text-white text-xs font-bold">✓</span>}
                </button>
                <input value={task.title}
                  onChange={e => updateTaskTitle(task, e.target.value)}
                  placeholder={`Task ${index + 1}`}
                  className="flex-1 text-sm outline-none bg-transparent"
                  style={{ color: task.done ? 'rgba(150,173,148,0.6)' : '#53161D', textDecoration: task.done ? 'line-through' : 'none' }} />
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <p className="text-xs text-center py-6" style={{ color: '#97CBFB' }}>Click + to add your first task!</p>
          )}
        </div>
      </div>
    </div>
  )
}