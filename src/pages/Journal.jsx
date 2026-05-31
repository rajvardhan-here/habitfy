import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { TopBar } from './HabitTracker'

const T = {
  light: {
    bg:'#F3F0FF', card:'#FFFFFF', text:'#1E1B4B', subtext:'#64748B',
    border:'#EDE9FE', inputBg:'#F8F7FF',
    pink:'#E91E8C', pinkLight:'#FCE7F3',
    purple:'#7C3AED', purpleLight:'#EDE9FE',
    shadow:'rgba(124,58,237,0.08)',
  },
  dark: {
    bg:'#0F0B1E', card:'#1A1530', text:'#F0EEFF', subtext:'#A89EC9',
    border:'#2D2550', inputBg:'#231D3D',
    pink:'#F472B6', pinkLight:'rgba(244,114,182,0.15)',
    purple:'#A78BFA', purpleLight:'rgba(167,139,250,0.15)',
    shadow:'rgba(0,0,0,0.4)',
  }
}

/* ── Morpankh SVG background ── */
function MorpankhBg({ dark }) {
  const c1 = dark ? 'rgba(167,139,250,0.07)' : 'rgba(124,58,237,0.06)'
  const c2 = dark ? 'rgba(244,114,182,0.06)' : 'rgba(233,30,140,0.05)'
  const c3 = dark ? 'rgba(52,211,153,0.05)'  : 'rgba(16,185,129,0.06)'
  return (
    <svg style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',
      pointerEvents:'none',zIndex:0,overflow:'hidden'}}
      viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(80,400) rotate(-30)"><Feather scale={2.2} c1={c1} c2={c2} c3={c3}/></g>
      <g transform="translate(1100,200) rotate(20)"><Feather scale={2.0} c1={c1} c2={c2} c3={c3}/></g>
      <g transform="translate(600,50) rotate(5)"><Feather scale={1.4} c1={c1} c2={c2} c3={c3}/></g>
      <g transform="translate(950,650) rotate(-15)"><Feather scale={1.1} c1={c1} c2={c2} c3={c3}/></g>
      <g transform="translate(200,700) rotate(10)"><Feather scale={1.0} c1={c1} c2={c2} c3={c3}/></g>
      <g transform="translate(400,150) rotate(-20)"><Feather scale={0.7} c1={c1} c2={c2} c3={c3}/></g>
      <g transform="translate(850,500) rotate(35)"><Feather scale={0.6} c1={c1} c2={c2} c3={c3}/></g>
    </svg>
  )
}

function Feather({ scale=1, c1, c2, c3 }) {
  return (
    <g transform={`scale(${scale})`}>
      <path d="M0,0 Q5,80 0,200" stroke={c2} strokeWidth="2" fill="none"/>
      {[20,40,60,80,100,120,140,160,180].map((y,i)=>{
        const spread = Math.sin((i/8)*Math.PI)*30
        return (
          <g key={`l${i}`}>
            <path d={`M${3-i*0.2},${y} Q${-spread*0.5},${y-8} ${-spread},${y+5}`}
              stroke={c1} strokeWidth="1.2" fill="none" opacity={0.9-i*0.05}/>
            <path d={`M${-spread*0.5},${y-8} Q${-spread*0.8},${y-15} ${-spread+5},${y}`}
              stroke={c3} strokeWidth="0.8" fill="none" opacity={0.6}/>
          </g>
        )
      })}
      {[20,40,60,80,100,120,140,160,180].map((y,i)=>{
        const spread = Math.sin((i/8)*Math.PI)*28
        return (
          <g key={`r${i}`}>
            <path d={`M${3-i*0.2},${y} Q${spread*0.5},${y-8} ${spread},${y+5}`}
              stroke={c1} strokeWidth="1.2" fill="none" opacity={0.9-i*0.05}/>
            <path d={`M${spread*0.5},${y-8} Q${spread*0.8},${y-15} ${spread-5},${y}`}
              stroke={c3} strokeWidth="0.8" fill="none" opacity={0.6}/>
          </g>
        )
      })}
      <ellipse cx="0" cy="14" rx="10" ry="14" fill={c2} opacity="0.5"/>
      <ellipse cx="0" cy="14" rx="7"  ry="10" fill={c3} opacity="0.6"/>
      <ellipse cx="0" cy="14" rx="4"  ry="6"  fill={c1} opacity="0.9"/>
      <circle  cx="0" cy="12" r="2"           fill={c2} opacity="0.8"/>
      {[30,70,110,150].map((y,i)=>(
        <path key={`s${i}`}
          d={`M${-Math.sin(i)*18},${y} Q0,${y-4} ${Math.sin(i)*18},${y}`}
          stroke={c3} strokeWidth="0.6" fill="none" opacity="0.4"/>
      ))}
    </g>
  )
}

export default function Journal({ user: propUser, onLogout, dark, onToggleDark }) {
  const t = dark ? T.dark : T.light
  const isMobile = window.innerWidth < 768

  const [entries,    setEntries]    = useState([])
  const [user,       setUser]       = useState(null)
  const [adding,     setAdding]     = useState(false)
  const [newContent, setNewContent] = useState('')
  const [saving,     setSaving]     = useState(false)

  // ✅ FIX: Always get fresh user from Supabase — don't rely on propUser
  const userRef = useRef(null)

  useEffect(()=>{
    supabase.auth.getUser().then(({data:{user}})=>{
      if(user){
        userRef.current = user
        setUser(user)
        fetchEntries(user.id)
      }
    })
  },[])

  // ✅ Also update when propUser changes
  useEffect(()=>{
    if(propUser && !userRef.current){
      userRef.current = propUser
      setUser(propUser)
      fetchEntries(propUser.id)
    }
  },[propUser])

  // ✅ FIX: Always use userRef.current — never null
  const getUser = async () => {
    if(userRef.current) return userRef.current
    const { data } = await supabase.auth.getUser()
    if(data?.user){
      userRef.current = data.user
      setUser(data.user)
      return data.user
    }
    return null
  }

  const fetchEntries = async (uid) => {
    if(!uid) return
    const { data, error } = await supabase
      .from('journal')
      .select('*')
      .eq('user_id', uid)
      .order('pinned', { ascending: false })
      .order('date',   { ascending: false })
    if(!error) setEntries(data || [])
  }

  const saveNote = async () => {
    if(!newContent.trim()) return
    setSaving(true)
    // ✅ FIX: Always fetch fresh user before saving
    const cu = await getUser()
    if(!cu){ setSaving(false); return }

    const { error } = await supabase.from('journal').insert({
      user_id: cu.id,
      date:    new Date().toISOString().split('T')[0],
      content: newContent,
      pinned:  false
    })

    if(!error){
      setNewContent('')
      setAdding(false)
      // ✅ FIX: Fetch entries again after save — with guaranteed uid
      await fetchEntries(cu.id)
    }
    setSaving(false)
  }

  const togglePin = async (entry) => {
    const cu = await getUser(); if(!cu) return
    await supabase.from('journal').update({ pinned: !entry.pinned }).eq('id', entry.id)
    fetchEntries(cu.id)
  }

  const deleteNote = async (id) => {
    const cu = await getUser(); if(!cu) return
    await supabase.from('journal').delete().eq('id', id)
    fetchEntries(cu.id)
  }

  const formatDate = (ds) => new Date(ds).toLocaleDateString('en-IN', {
    weekday:'short', day:'numeric', month:'short', year:'numeric'
  })

  return (
    <div style={{minHeight:'100vh', background:t.bg, fontFamily:"'Inter',sans-serif",
      transition:'background 0.3s', position:'relative', overflow:'hidden'}}>

      <MorpankhBg dark={dark}/>

      <div style={{position:'relative', zIndex:1}}>

        {/* TOP ROW */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between',
          padding: isMobile ? '12px 12px 0 12px' : '16px 24px 0 24px',
          flexWrap:'wrap', gap:8}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <h1 style={{fontSize:isMobile?20:26, fontWeight:900, color:t.text, margin:0}}>
              Notes 📝
            </h1>
            <p style={{fontSize:13, color:t.purple, margin:0}}>
              {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
            </p>
          </div>
          <TopBar user={user} streak={0} onLogout={onLogout} dark={dark} onToggleDark={onToggleDark}/>
        </div>

        <div style={{padding: isMobile ? 12 : 24, paddingTop:20}}>

          {/* + Floating button */}
          {!adding && (
            <motion.button
              whileHover={{scale:1.09}} whileTap={{scale:0.95}}
              onClick={()=>setAdding(true)}
              style={{
                position:'fixed', bottom:isMobile?90:32, right:24, zIndex:100,
                width:52, height:52, borderRadius:'50%',
                background:`linear-gradient(135deg,${t.pink},${t.purple})`,
                border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:`0 6px 20px rgba(233,30,140,0.45)`
              }}>
              <span style={{fontSize:30, color:'white', lineHeight:1, marginTop:-2}}>+</span>
            </motion.button>
          )}

          {/* New Note Input */}
          <AnimatePresence>
            {adding && (
              <motion.div
                initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
                style={{background:t.card, borderRadius:20,
                  boxShadow:`0 8px 40px ${t.shadow}, 0 0 0 2px ${t.pink}`,
                  padding:20, marginBottom:20}}>
                <textarea autoFocus value={newContent}
                  onChange={e=>setNewContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={5}
                  style={{width:'101%', borderRadius:12, padding:12,
                    background:t.purpleLight, border:`1px solid ${t.border}`,
                    color:t.text, fontSize:14, outline:'none',
                    resize:'none', lineHeight:1.7, boxSizing:'border-box',
                    fontFamily:"'Inter',sans-serif"}}/>
                <div style={{display:'flex', justifyContent:'space-between',
                  alignItems:'center', marginTop:12}}>
                  <span style={{fontSize:11, color:t.purple}}>{newContent.length} characters</span>
                  <div style={{display:'flex', gap:8}}>
                    <button onClick={()=>{setAdding(false);setNewContent('')}}
                      style={{padding:'8px 16px', borderRadius:12, fontSize:13, fontWeight:600,
                        background:t.purpleLight, color:t.purple, border:'none', cursor:'pointer'}}>
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                      onClick={saveNote}
                      disabled={saving}
                      style={{padding:'8px 20px', borderRadius:12, fontSize:13, fontWeight:700,
                        background:`linear-gradient(135deg,${t.pink},${t.purple})`,
                        color:'white', border:'none', cursor:'pointer',
                        opacity: saving ? 0.7 : 1}}>
                      {saving ? '✓ Saving...' : 'Save Note'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pinned Notes */}
          {entries.filter(e=>e.pinned).length > 0 && (
            <div style={{marginBottom:8}}>
              <p style={{fontSize:11,fontWeight:700,color:t.purple,letterSpacing:1,margin:'0 0 10px 0'}}>
                📌 PINNED
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:11,marginBottom:21}}>
                {entries.filter(e=>e.pinned).map(entry=>(
                  <NoteCard key={entry.id} entry={entry} onPin={togglePin} onDelete={deleteNote}
                    formatDate={formatDate} t={t} pinned/>
                ))}
              </div>
            </div>
          )}

          {/* All Notes */}
          {entries.filter(e=>!e.pinned).length > 0 && (
            <div>
              {entries.filter(e=>e.pinned).length > 0 &&
                <p style={{fontSize:11,fontWeight:700,color:t.purple,letterSpacing:1,margin:'0 0 10px 0'}}>
                  🗒 ALL NOTES
                </p>
              }
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {entries.filter(e=>!e.pinned).map(entry=>(
                  <NoteCard key={entry.id} entry={entry} onPin={togglePin} onDelete={deleteNote}
                    formatDate={formatDate} t={t}/>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {entries.length === 0 && !adding && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}
              style={{textAlign:'center', paddingTop:120}}>
              <p style={{fontSize:56, marginBottom:12}}>📝</p>
              <p style={{fontSize:18, fontWeight:700, color:t.text, margin:0}}>No notes yet</p>
              <p style={{fontSize:14, color:t.purple, marginTop:8}}>
                Tap + to write your first note
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function NoteCard({ entry, onPin, onDelete, formatDate, t, pinned }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = entry.content.length > 200
  return (
    <motion.div
      initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
      style={{
        background: t.card, borderRadius:20, padding:20,
        boxShadow: pinned
          ? `0 4px 24px rgba(233,30,140,0.18), 0 0 0 2px ${t.pink}`
          : `0 2px 20px ${t.shadow}`,
        border: pinned ? `2px solid ${t.pink}` : '2px solid transparent',
        backdropFilter:'blur(8px)',
      }}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
        <span style={{fontSize:11,fontWeight:600,color:t.purple,
          background:t.purpleLight,padding:'3px 10px',borderRadius:20}}>
          {formatDate(entry.date)}
        </span>
        <div style={{display:'flex',gap:6}}>
          <button onClick={()=>onPin(entry)} title={entry.pinned?'Unpin':'Pin'}
            style={{width:30,height:30,borderRadius:'50%',
              background:entry.pinned
                ? `linear-gradient(135deg,${t.pink},${t.purple})`
                : t.purpleLight,
              border:'none',cursor:'pointer',fontSize:14,
              display:'flex',alignItems:'center',justifyContent:'center'}}>
            📌
          </button>
          <button onClick={()=>onDelete(entry.id)}
            style={{width:30,height:30,borderRadius:'50%',
              background:'#FEE2E2',border:'none',cursor:'pointer',
              fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>
            🗑
          </button>
        </div>
      </div>
      <p style={{fontSize:14,color:t.text,lineHeight:1.75,margin:0,
        whiteSpace:'pre-wrap',overflow:'hidden',
        display:'-webkit-box',WebkitBoxOrient:'vertical',
        WebkitLineClamp:expanded?'unset':4}}>
        {entry.content}
      </p>
      {isLong && (
        <button onClick={()=>setExpanded(!expanded)}
          style={{marginTop:8,background:'none',border:'none',cursor:'pointer',
            fontSize:12,fontWeight:600,color:t.pink,padding:0}}>
          {expanded?'▲ Show less':'▼ Read more'}
        </button>
      )}
    </motion.div>
  )
}
