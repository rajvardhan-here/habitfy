import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

const GREEN = '#285E2C'
const GREEN_MID = '#3d7a42'
const YELLOW = '#FFE67C'
const YELLOW_DARK = '#f5d800'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/habits' }
    })
    if (error) console.error('Login error:', error)
    setLoading(false)
  }

  const features = [
    { icon: '∞', label: 'Habits' },
    { icon: '🔥', label: 'Streaks' },
    { icon: '₹', label: 'Finance' },
    { icon: '📝', label: 'Notes' },
  ]

  const floaters = [
    { emoji: '🚀', x: '8%', y: '15%', duration: 4, delay: 0 },
    { emoji: '📈', x: '82%', y: '12%', duration: 5, delay: 0.5 },
    { emoji: '✅', x: '6%', y: '58%', duration: 6, delay: 1 },
    { emoji: '🏆', x: '86%', y: '54%', duration: 4.5, delay: 0.3 },
    { emoji: '💪', x: '16%', y: '82%', duration: 5.5, delay: 0.8 },
    { emoji: '📊', x: '78%', y: '80%', duration: 4, delay: 1.2 },
    { emoji: '⭐', x: '50%', y: '7%', duration: 3.5, delay: 0.2 },
    { emoji: '🎯', x: '89%', y: '36%', duration: 5, delay: 0.6 },
    { emoji: '💰', x: '4%', y: '39%', duration: 6, delay: 1.5 },
    { emoji: '🔥', x: '49%', y: '89%', duration: 4, delay: 0.4 },
  ]

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '16px', position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: `linear-gradient(135deg, ${GREEN} 0%, #1a4a1e 40%, #0f2e12 100%)`
    }}>

      {/* Floating emojis */}
      {floaters.map((f, i) => (
        <motion.div key={i}
          style={{ position: 'absolute', left: f.x, top: f.y, fontSize: 28, userSelect: 'none', pointerEvents: 'none', opacity: 0.6 }}
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: f.duration, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}>
          {f.emoji}
        </motion.div>
      ))}

      {/* Floating stat cards */}
      <motion.div style={{
        position: 'absolute', left: '3%', top: '20%',
        background: 'rgba(255,230,124,0.15)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,230,124,0.3)', borderRadius: 16,
        padding: '10px 14px', minWidth: 130, pointerEvents: 'none'
      }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: YELLOW, margin: '0 0 6px 0', letterSpacing: 1 }}>DAILY PROGRESS</p>
        <div style={{ width: '100%', background: 'rgba(255,230,124,0.2)', height: 6, borderRadius: 99, overflow: 'hidden' }}>
          <motion.div style={{ background: YELLOW, height: '100%', borderRadius: 99 }}
            initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ duration: 1.5 }} />
        </div>
        <p style={{ fontSize: 9, marginTop: 4, color: 'rgba(255,230,124,0.8)', margin: '4px 0 0 0' }}>72% done</p>
      </motion.div>

      <motion.div style={{
        position: 'absolute', right: '5%', top: '18%',
        background: 'rgba(255,230,124,0.15)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,230,124,0.3)', borderRadius: 16,
        padding: '10px 14px', pointerEvents: 'none', textAlign: 'center'
      }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
        <p style={{ fontSize: 20, margin: 0 }}>🔥</p>
        <p style={{ fontSize: 13, fontWeight: 900, color: YELLOW, margin: '2px 0 0 0' }}>14 days</p>
        <p style={{ fontSize: 9, color: 'rgba(255,230,124,0.7)', margin: 0 }}>streak!</p>
      </motion.div>

      <motion.div style={{
        position: 'absolute', left: '4%', bottom: '22%',
        background: 'rgba(255,230,124,0.15)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,230,124,0.3)', borderRadius: 16,
        padding: '10px 14px', pointerEvents: 'none'
      }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: YELLOW, margin: '0 0 6px 0' }}>This week</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
          {[30, 50, 35, 70, 55, 90, 65].map((h, i) => (
            <motion.div key={i} style={{ width: 7, borderRadius: '3px 3px 0 0', background: YELLOW }}
              initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
          ))}
        </div>
      </motion.div>

      <motion.div style={{
        position: 'absolute', right: '4%', bottom: '24%',
        background: 'rgba(255,230,124,0.15)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,230,124,0.3)', borderRadius: 16,
        padding: '10px 14px', pointerEvents: 'none', minWidth: 120
      }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: YELLOW, margin: '0 0 2px 0' }}>Budget left</p>
        <p style={{ fontSize: 18, fontWeight: 900, color: YELLOW, margin: 0 }}>₹2,450</p>
        <p style={{ fontSize: 9, color: 'rgba(255,230,124,0.7)', margin: 0 }}>of ₹5,000</p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'relative', zIndex: 10,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          border: `1px solid rgba(255,230,124,0.25)`,
          borderRadius: 32, padding: '36px 32px',
          width: '100%', maxWidth: 360, textAlign: 'center',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,230,124,0.1)'
        }}>

        {/* Logo */}
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          style={{
            width: 60, height: 60, borderRadius: 18,
            background: YELLOW, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px auto', cursor: 'pointer',
            boxShadow: `0 8px 24px rgba(255,230,124,0.4)`
          }}>
          <span style={{ color: GREEN, fontWeight: 900, fontSize: 26 }}>H</span>
        </motion.div>

        <h1 style={{
          fontSize: 34, fontWeight: 900, color: YELLOW,
          margin: '0 0 6px 0', letterSpacing: '-0.5px',
          fontFamily: "'Inter', sans-serif"
        }}>
          Habitfy
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,230,124,0.6)', margin: '0 0 28px 0' }}>
          Track habits. Build streaks. Live better.
        </p>

        {/* Features */}
        <div style={{
          marginBottom: 28, padding: '16px',
          background: 'rgba(255,230,124,0.08)',
          border: '1px solid rgba(255,230,124,0.15)',
          borderRadius: 20
        }}>
          <p style={{ fontSize: 9, fontWeight: 701, letterSpacing: 2, color: 'rgba(255,230,124,0.5)', margin: '0 0 14px 0' }}>
            FREE FOR STUDENTS
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
            {features.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -5, scale: 1.1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: 'rgba(255,230,124,0.15)',
                  border: '1px solid rgba(255,230,124,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: YELLOW, fontWeight: 900,
                  transition: 'background 0.2s'
                }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 701, color: 'rgba(255,230,124,0.75)' }}>{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Google Login Button */}
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: `0 8px 24px rgba(255,230,124,0.3)` }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10,
            borderRadius: 14, padding: '14px',
            background: YELLOW, border: 'none', cursor: 'pointer',
            boxShadow: `0 4px 16px rgba(255,230,124,0.25)`
          }}>
          <img src="https://www.google.com/favicon.ico" style={{ width: 16, height: 16 }} alt="G" />
          <span style={{ fontWeight: 800, color: GREEN, fontSize: 14, fontFamily: "'Inter', sans-serif" }}>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </span>
        </motion.button>

        <p style={{ fontSize: 11, marginTop: 16, color: 'rgba(255,230,124,0.35)', margin: '16px 0 0 0' }}>
          Free forever · No credit card needed
        </p>
      </motion.div>

      {/* Footer */}
      <motion.div whileHover={{ scale: 1.05 }}
        style={{ position: 'absolute', bottom: 20, opacity: 0.5 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: YELLOW }}>Made with 💚 by Rajvardhan</span>
      </motion.div>
    </div>
  )
}
