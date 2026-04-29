import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    setLoading(false)
  }

  const features = [
    { icon: '∞', label: 'Habits' },
    { icon: '🔥', label: 'Streaks' },
    { icon: '₹', label: 'Finance' },
    { icon: '👥', label: 'Friends' },
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans"
      style={{ background: 'linear-gradient(180deg, #A7D1F7 0%, #C1E1FF 100%)' }}>
      
      {/* 1. Floating Background Emojis */}
      {floaters.map((f, i) => (
        <motion.div key={i}
          className="absolute text-2xl md:text-3xl select-none pointer-events-none opacity-80"
          style={{ left: f.x, top: f.y }}
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: f.duration, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}>
          {f.emoji}
        </motion.div>
      ))}

      {/* 2. Progress Card (Top Left) */}
      <motion.div
        className="absolute rounded-2xl p-3 pointer-events-none z-0"
        style={{ left: '3%', top: '20%', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', minWidth: 130 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <p className="text-[10px] uppercase font-bold text-white mb-1">Daily Progress</p>
        <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
          <motion.div className="bg-white h-full" 
            initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ duration: 1.5 }} />
        </div>
        <p className="text-[10px] mt-1 text-white/90">72% done</p>
      </motion.div>

      {/* 3. Streak Card (Top Right) */}
      <motion.div
        className="absolute rounded-2xl p-3 pointer-events-none z-0"
        style={{ right: '5%', top: '18%', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)' }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
        <p className="text-xl text-center">🔥</p>
        <p className="text-[11px] font-black text-center text-white">14 days</p>
        <p className="text-[9px] text-center text-white/80">streak!</p>
      </motion.div>

      {/* 4. Graph Card (Bottom Left) */}
      <motion.div
        className="absolute rounded-2xl p-3 pointer-events-none z-0"
        style={{ left: '4%', bottom: '22%', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)' }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
        <p className="text-[10px] font-bold text-white mb-2">This week</p>
        <div className="flex items-end gap-1 h-8">
          {[30, 50, 35, 70, 55, 90, 65].map((h, i) => (
            <motion.div key={i} className="w-2 rounded-t-sm bg-white"
              initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
          ))}
        </div>
      </motion.div>

      {/* 5. Budget Card (Bottom Right) */}
      <motion.div
        className="absolute rounded-2xl p-3 pointer-events-none z-0"
        style={{ right: '4%', bottom: '24%', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', minWidth: 120 }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}>
        <p className="text-[10px] font-bold text-white">Budget left</p>
        <p className="text-lg font-black text-white">₹2,450</p>
        <p className="text-[9px] text-white/80">of ₹5,000</p>
      </motion.div>

      {/* MAIN CENTER CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ 
          y: -8, 
          scale: 1.02,
          transition: { type: "spring", stiffness: 400, damping: 10 } 
        }}
        className="relative z-10 rounded-[35px] p-8 w-full max-w-[340px] text-center"
        style={{
          background: '#96AD94',
          boxShadow: `
            0 30px 60px -12px rgba(0, 0, 0, 0.4), 
            0 18px 36px -18px rgba(0, 0, 0, 0.5)
          `
        }}>

        <motion.div whileHover={{ rotate: 15 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <span className="text-xl font-bold text-white">H</span>
        </motion.div>

        <h1 className="text-3xl font-bold mb-1 text-white">Habitfy</h1>
        <p className="text-xs mb-6 text-white/70">Track habits. Build streaks. Live better.</p>

        {/* Features Box */}
        <div className="mb-6 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-[9px] font-bold mb-4 tracking-widest text-white/60">FREE FOR STUDENTS</p>
          <div className="flex justify-between px-1">
            {features.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -5, scale: 1.1 }} className="flex flex-col items-center gap-1 cursor-pointer group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-white/20 border border-white/10 group-hover:bg-white/30 transition-colors">
                  {f.icon}
                </div>
                <span className="text-[9px] font-bold text-white/80">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Google Button */}
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }}
          whileTap={{ scale: 0.96 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl py-3.5 bg-white"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
          <span className="font-bold text-gray-800 text-sm">
            {loading ? 'Processing...' : 'Continue with Google'}
          </span>
        </motion.button>

        <p className="text-[10px] mt-4 text-white/40">Free forever · No credit card needed</p>
      </motion.div>

      {/* Footer Credit */}
      <motion.div whileHover={{ scale: 1.05 }} className="absolute bottom-6 opacity-50">
        <span className="text-[10px] font-bold text-gray-600">Made with 💙 by Rajvardhan</span>
      </motion.div>
    </div>
  )
}