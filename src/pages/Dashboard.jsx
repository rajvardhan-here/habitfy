import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HabitTracker from './HabitTracker'
import Finance from './Finance'
import Journal from './Journal'

const GREEN = '#285E2C'
const YELLOW = '#FFE67C'

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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'User'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: YELLOW }}>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.div
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          animate={{ width: expanded ? 180 : 64 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{
            background: GREEN, boxShadow: '2px 0 16px rgba(40,94,44,0.25)',
            borderRight: '1px solid rgba(40,94,44,0.3)',
            display: 'flex', flexDirection: 'column', padding: '24px 0',
            zIndex: 50, position: 'fixed', top: 0, left: 0, height: '100vh', overflow: 'hidden'
          }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 12px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: GREEN, fontWeight: 900, fontSize: 18 }}>✦</span>
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 16, fontWeight: 800, color: YELLOW, whiteSpace: 'nowrap' }}>
                  Habitfy
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 8px', flex: 1 }}>
            {navItems.map((item) => {
              const active = location.pathname === item.path
              return (
                <button key={item.path} onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    borderRadius: 12, padding: '10px 12px',
                    background: active ? 'rgba(255,230,124,0.18)' : 'transparent',
                    border: active ? '1px solid rgba(255,230,124,0.4)' : '1px solid transparent',
                    cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left'
                  }}>
                  <span style={{ fontSize: 18, color: active ? YELLOW : 'rgba(255,230,124,0.6)', flexShrink: 0 }}>{item.icon}</span>
                  <AnimatePresence>
                    {expanded && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 13, fontWeight: 600, color: active ? YELLOW : 'rgba(255,230,124,0.7)' }}>
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )
            })}
          </div>

          {/* Bottom user + logout */}
          <div style={{ padding: '0 8px' }}>
            <AnimatePresence>
              {expanded && user && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: '8px 12px', marginBottom: 4, borderRadius: 12, background: 'rgba(255,230,124,0.12)', border: '1px solid rgba(255,230,124,0.25)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: YELLOW, margin: 0 }}>{firstName} ji</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,230,124,0.6)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 12, padding: '10px 12px', width: '100%', background: 'transparent', border: '1px solid transparent', cursor: 'pointer' }}>
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
      )}

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : 64, marginBottom: isMobile ? 70 : 0 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/habits" replace />} />
          <Route path="/habits" element={<HabitTracker user={user} onLogout={handleLogout} />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: GREEN, display: 'flex', justifyContent: 'space-around',
          padding: '8px 0 12px 0', boxShadow: '0 -4px 20px rgba(40,94,44,0.3)'
        }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '4px 20px', borderRadius: 12,
                  opacity: active ? 1 : 0.6
                }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: active ? YELLOW : 'rgba(255,230,124,0.7)' }}>
                  {item.label}
                </span>
                {active && (
                  <div style={{ width: 4, height: 4, borderRadius: '51%', background: YELLOW }} />
                )}
              </button>
            )
          })}
          <button onClick={handleLogout}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 20px', opacity: 0.6 }}>
            <span style={{ fontSize: 22 }}>🚪</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444' }}>Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}