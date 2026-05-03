import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

const GREEN = '#285E2C'
const YELLOW = '#FFE67C'

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
    { icon: '📓', label: 'Notes' },
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

  const floatingCards = [
    { content: <><p style={{fontSize:10,fontWeight:700,color:'white',margin:'0 0 4px 0'}}>DAILY PROGRESS</p><div style={{width:'100%',height:6,borderRadius:99,background:'rgba(255,255,255,0.3)'}}><motion.div style={{height:6,borderRadius:99,background:YELLOW}} initial={{width:0}} animate={{width:'72%'}} transition={{duration:1.5}}/></div><p style={{fontSize:10,marginTop:4,color:'rgba(255,255,255,0.9)',margin:'4px 0 0 0'}}>72% done</p></>, pos:{left:'3%',top:'20%'}, anim:{y:[0,-8,0]}, dur:4 },
    { content: <><p style={{fontSize:20,textAlign:'center',margin:0}}>🔥</p><p style={{fontSize:11,fontWeight:900,textAlign:'center',color:'white',margin:'2px 0 0 0'}}>14 days</p><p style={{fontSize:9,textAlign:'center',color:'rgba(255,255,255,0.8)',margin:0}}>streak!</p></>, pos:{right:'5%',top:'18%'}, anim:{y:[0,-10,0]}, dur:5 },
    { content: <><p style={{fontSize:10,fontWeight:700,color:'white',margin:'0 0 6px 0'}}>This week</p><div style={{display:'flex',alignItems:'flex-end',gap:3,height:32}}>{[30,50,35,70,55,90,65].map((h,i)=><motion.div key={i} style={{width:8,borderRadius:'2px 2px 0 0',background:YELLOW}} initial={{height:0}} animate={{height:`${h}%`}} transition={{duration:0.8,delay:i*0.1}}/>)}</div></>, pos:{left:'4%',bottom:'22%'}, anim:{y:[0,8,0]}, dur:4.5 },
    { content: <><p style={{fontSize:10,fontWeight:700,color:'white',margin:0}}>Budget left</p><p style={{fontSize:18,fontWeight:900,color:YELLOW,margin:'2px 0 0 0'}}>₹2,450</p><p style={{fontSize:9,color:'rgba(255,255,255,0.8)',margin:0}}>of ₹5,000</p></>, pos:{right:'4%',bottom:'24%'}, anim:{y:[0,8,0]}, dur:5 },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px', position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${GREEN} 0%, #3a7a3e 50%, #285E2C 100%)`, fontFamily: "'Inter', sans-serif" }}>

      {/* Floating emojis */}
      {floaters.map((f, i) => (
        <motion.div key={i}
          style={{ position: 'absolute', left: f.x, top: f.y, fontSize: 28, userSelect: 'none', pointerEvents: 'none', opacity: 0.6 }}
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: f.duration, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}>
          {f.emoji}
        </motion.div>
      ))}

      {/* Floating cards */}
      {floatingCards.map((card, i) => (
        <motion.div key={i}
          style={{ position: 'absolute', ...card.pos, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 16, padding: 12, minWidth: 120, pointerEvents: 'none', zIndex: 0 }}
          animate={card.anim}
          transition={{ duration: card.dur, repeat: Infinity, ease: 'easeInOut' }}>
          {card.content}
        </motion.div>
      ))}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 10 } }}
        style={{ position: 'relative', zIndex: 10, borderRadius: 32, padding: 32, width: '100%', maxWidth: 340, textAlign: 'center', background: YELLOW, boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)' }}>

        {/* Logo */}
        <motion.div whileHover={{ rotate: 15 }}
          style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: GREEN, boxShadow: '0 4px 16px rgba(40,94,44,0.4)', cursor: 'pointer' }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: YELLOW }}>H</span>
        </motion.div>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: GREEN, margin: '0 0 4px 0' }}>Habitfy</h1>
        <p style={{ fontSize: 12, color: 'rgba(40,94,44,0.7)', marginBottom: 24, margin: '0 0 24px 0' }}>Track habits. Build streaks. Live better.</p>

        {/* Features */}
        <div style={{ marginBottom: 24, padding: 16, borderRadius: 20, background: 'rgba(40,94,44,0.1)', border: '1px solid rgba(40,94,44,0.15)' }}>
          <p style={{ fontSize: 9, fontWeight: 700, marginBottom: 16, letterSpacing: 1.5, color: 'rgba(40,94,44,0.6)', margin: '0 0 14px 0' }}>FREE FOR STUDENTS</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
            {features.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -5, scale: 1.1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: 'rgba(40,94,44,0.12)', border: '1px solid rgba(40,94,44,0.15)' }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(40,94,44,0.8)' }}>{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Google button */}
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 10px 25px rgba(40,94,44,0.3)' }}
          whileTap={{ scale: 0.96 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 14, padding: '14px 0', background: GREEN, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(40,94,44,0.3)' }}>
          <img src="https://www.google.com/favicon.ico" style={{ width: 16, height: 16, background: 'white', borderRadius: '50%', padding: 2 }} alt="G" />
          <span style={{ fontSize: 14, fontWeight: 700, color: YELLOW }}>
            {loading ? 'Processing...' : 'Continue with Google'}
          </span>
        </motion.button>

        <p style={{ fontSize: 10, marginTop: 12, color: 'rgba(40,94,44,0.5)', margin: '12px 0 0 0' }}>Free forever · No credit card needed</p>
      </motion.div>

      {/* Footer */}
      <motion.div whileHover={{ scale: 1.05 }} style={{ position: 'absolute', bottom: 20, opacity: 0.6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Made with 💚 by Rajvardhan</span>
      </motion.div>
    </div>
  )
}