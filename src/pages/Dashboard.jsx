import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HabitTracker from './HabitTracker'
import Finance from './Finance'
import Journal from './Journal'

const PINK   = '#E91E8C'
const PURPLE = '#7C3AED'
const AMBER  = '#F59E0B'

const T = {
  light: {
    bg:          '#F3F0FF',
    card:        '#FFFFFF',
    text:        '#1E1B4B',
    subtext:     '#64748B',
    border:      '#EDE9FE',
    pink:        PINK,
    purple:      PURPLE,
    sidebar:     `linear-gradient(180deg, #1E1B4B 0%, #4C1D95 100%)`,
    shadow:      'rgba(124,58,237,0.15)',
  },
  dark: {
    bg:          '#0F0B1E',
    card:        '#1A1530',
    text:        '#F0EEFF',
    subtext:     '#A89EC9',
    border:      '#2D2550',
    pink:        '#F472B6',
    purple:      '#A78BFA',
    sidebar:     `linear-gradient(180deg, #080614 0%, #1A0A3A 100%)`,
    shadow:      'rgba(0,0,0,0.5)',
  }
}

const navItems = [
  { icon: '⊞', label: 'Habit Tracker', path: '/habits'  },
  { icon: '◫', label: 'Finance',       path: '/finance' },
  { icon: '☰', label: 'Notes',         path: '/journal' },
]

export default function Dashboard() {
  const [user,     setUser]     = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [dark,     setDark]     = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut() }
  const t = dark ? T.dark : T.light

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, transition: 'background 0.3s' }}>

      {/* ── Desktop Sidebar ── */}
      {!isMobile && (
        <motion.div
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          animate={{ width: expanded ? 180 : 64 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{
            background: t.sidebar,
            boxShadow: `4px 0 24px rgba(124,58,237,0.25)`,
            display: 'flex', flexDirection: 'column', padding: '24px 0',
            zIndex: 50, position: 'fixed', top: 0, left: 0, height: '100vh', overflow: 'hidden'
          }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 12px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `linear-gradient(135deg, ${t.pink}, ${t.purple})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: `0 4px 12px rgba(233,30,140,0.4)`
            }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: 18 }}>✦</span>
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 16, fontWeight: 800, color: 'white', whiteSpace: 'nowrap' }}>
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
                    background: active ? `rgba(233,30,140,0.25)` : 'transparent',
                    border: active ? `1px solid rgba(233,30,140,0.5)` : '1px solid transparent',
                    cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left'
                  }}>
                  <span style={{ fontSize: 18, color: active ? t.pink : 'rgba(255,255,255,0.45)', flexShrink: 0 }}>{item.icon}</span>
                  <AnimatePresence>
                    {expanded && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 13, fontWeight: 600, color: active ? 'white' : 'rgba(255,255,255,0.55)' }}>
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )
            })}
          </div>

          {/* Logout */}
          <div style={{ padding: '0 8px' }}>
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

      {/* ── Main Content ── */}
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : 64, marginBottom: isMobile ? 70 : 0 }}>
        <Routes>
          <Route path="/"        element={<Navigate to="/habits" replace />} />
          <Route path="/habits"  element={<HabitTracker  user={user} onLogout={handleLogout} dark={dark} onToggleDark={()=>setDark(d=>!d)} />} />
          <Route path="/finance" element={<Finance        user={user} onLogout={handleLogout} dark={dark} onToggleDark={()=>setDark(d=>!d)} />} />
          <Route path="/journal" element={<Journal        user={user} onLogout={handleLogout} dark={dark} onToggleDark={()=>setDark(d=>!d)} />} />
        </Routes>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: dark ? '#080614' : '#1E1B4B',
          display: 'flex', justifyContent: 'space-around',
          padding: '8px 0 12px 0', boxShadow: `0 -4px 20px rgba(124,58,237,0.3)`
        }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 20px', borderRadius: 12, opacity: active ? 1 : 0.6 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: active ? t.pink : 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: t.pink }} />}
              </button>
            )
          })}
          <button onClick={handleLogout}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 20px', opacity: 0.6 }}>
            <span style={{ fontSize: 24 }}>🚪</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444' }}>Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}
