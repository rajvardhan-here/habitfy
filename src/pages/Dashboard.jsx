import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HabitTracker from './HabitTracker'
import Finance from './Finance'
import Journal from './Journal'
import Friends from './Friends'

const navItems = [
  { icon: '✅', label: 'Habits', path: '/habits' },
  { icon: '💰', label: 'Finance', path: '/finance' },
  { icon: '📓', label: 'Journal', path: '/journal' },
  { icon: '👥', label: 'Friends', path: '/friends' },
]

export default function Dashboard() {
  const [expanded, setExpanded] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F0F7FF' }}>

      {/* Sidebar */}
      <motion.div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        animate={{ width: expanded ? 180 : 64 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex flex-col py-6 px-3 gap-2 z-50 fixed top-0 left-0 h-screen"
        style={{
          background: 'linear-gradient(180deg, #96AD94 0%, #6a8f68 100%)',
          boxShadow: '4px 0 20px rgba(78,139,196,0.25)',
          overflow: 'hidden'
        }}>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(240,230,211,0.25)', border: '1px solid rgba(240,230,211,0.4)' }}>
            <span className="font-black text-sm" style={{ color: '#F0E6D3' }}>H</span>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-black text-lg whitespace-nowrap"
                style={{ color: '#F0E6D3' }}>
                Habitfy
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Items */}
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <motion.button key={item.path}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-all duration-200"
              style={{
                background: active ? 'rgba(240,230,211,0.25)' : 'transparent',
                border: active ? '1px solid rgba(240,230,211,0.4)' : '1px solid transparent',
              }}>
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: '#F0E6D3' }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}

        {/* User + Logout at bottom */}
        <div className="mt-auto">
          <AnimatePresence>
            {expanded && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2 px-2 py-2 rounded-xl"
                style={{ background: 'rgba(240,230,211,0.15)' }}>
                <p className="text-xs font-semibold truncate" style={{ color: '#F0E6D3' }}>
                  {user.user_metadata?.name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs truncate" style={{ color: 'rgba(240,230,211,0.6)' }}>
                  {user.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 w-full"
            style={{ border: '1px solid transparent' }}>
            <span className="text-xl flex-shrink-0">🚪</span>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium whitespace-nowrap"
                  style={{ color: 'rgba(240,230,211,0.8)' }}>
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1" style={{ marginLeft: 64 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/habits" replace />} />
          <Route path="/habits" element={<HabitTracker />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>
      </div>
    </div>
  )
}