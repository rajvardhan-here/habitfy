import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HabitTracker from './HabitTracker'
import Finance from './Finance'
import Journal from './Journal'

const navItems = [
  { icon: '⊞', label: 'Habit Tracker', path: '/habits' },
  { icon: '◫', label: 'Finance', path: '/finance' },
  { icon: '☰', label: 'Notes', path: '/journal' },
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#EEF4FF' }}>

      {/* Sidebar — hover to expand */}
      <motion.div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        animate={{ width: expanded ? 180 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex flex-col py-6 z-50 fixed top-0 left-0 h-screen overflow-hidden"
        style={{ background: 'white', boxShadow: '2px 0 12px rgba(0,0,0,0.06)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4A90E2, #2563EB)' }}>
            <span className="text-white font-black text-xl">✦</span>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                Habitfy
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-1 px-2 flex-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all text-left"
                style={{ background: active ? '#EEF4FF' : 'transparent', border: 'none', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 18, color: active ? '#2563EB' : '#94A3B8', flexShrink: 0 }}>{item.icon}</span>
                <AnimatePresence>
                  {expanded && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 13, fontWeight: 600, color: active ? '#2563EB' : '#64748B' }}>
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>

        {/* Logout at bottom */}
        <div className="px-2 pb-2">
          <button onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl px-3 py-3 w-full transition-all"
            style={{ border: 'none', background: 'transparent', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🚪</span>
            <AnimatePresence>
              {expanded && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Main */}
      <div className="flex-1" style={{ marginLeft: 64 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/habits" replace />} />
          <Route path="/habits" element={<HabitTracker user={user} onLogout={handleLogout} />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </div>
    </div>
  )
}