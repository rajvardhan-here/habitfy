import { useState, useEffect } from 'react'
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
    <svg
      style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',
        pointerEvents:'none',zIndex:0,overflow:'hidden'}}
      viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg">

      {/* Big feather — left */}
      <g transform="translate(80,400) rotate(-30)">
        <Feather scale={2.2} c1={c1} c2={c2} c3={c3}/>
      </g>

      {/* Big feather — right */}
      <g transform="translate(1100,200) rotate(20)">
        <Feather scale={2.0} c1={c1} c2={c2} c3={c3}/>
      </g>

      {/* Medium feather — top-center */}
      <g transform="translate(600,50) rotate(5)">
        <Feather scale={1.4} c1={c1} c2={c2} c3={c3}/>
      </g>

      {/* Small feather — bottom-right */}
      <g transform="translate(950,650) rotate(-15)">
        <Feather scale={1.1} c1={c1} c2={c2} c3={c3}/>
      </g>

      {/* Small feather — bottom-left */}
      <g transform="translate(200,700) rotate(10)">
        <Feather scale={1.0} c1={c1} c2={c2} c3={c3}/>
      </g>

      {/* Tiny scattered */}
      <g transform="translate(400,150) rotate(-20)">
        <Feather scale={0.7} c1={c1} c2={c2} c3={c3}/>
      </g>
      <g transform="translate(850,500) rotate(35)">
        <Feather scale={0.6} c1={c1} c2={c2} c3={c3}/>
      </g>
    </svg>
  )
}

function Feather({ scale=1, c1, c2, c3 }) {
  const s = scale
  return (
    <g transform={`scale(${s})`}>
      {/* Main quill stem */}
      <path d="M0,0 Q5,80 0,200" stroke={c2} strokeWidth="2" fill="none"/>

      {/* Barbs radiating out — left side */}
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

      {/* Barbs radiating out — right side */}
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

      {/* Eye of the peacock feather at top */}
      <ellipse cx="0" cy="14" rx="10" ry="14" fill={c2} opacity="0.5"/>
      <ellipse cx="0" cy="14" rx="7"  ry="10" fill={c3} opacity="0.6"/>
      <ellipse cx="0" cy="14" rx="4"  ry="6"  fill={c1} opacity="0.9"/>
      <circle  cx="0" cy="12" r="2"           fill={c2} opacity="0.8"/>

      {/* Shimmer lines in barbs */}
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
  const [user,       setUser]       = useState(propUser||null)
  const [adding,     setAdding]     = useState(false)
  const [newContent, setNewContent] = useState('')
  const [saving,     setSaving]     = useState(false)

  useEffect(()=>{
    supabase.auth.getUser().then(({data:{user}})=>{
      setUser(user); if(user) fetchEntries(user.id)
    })
  },[])

  const fetchEntries=async(uid)=>{
    const {data}=await supabase.from('journal').select('*').eq('user_id',uid)
      .order('pinned',{ascending:false}).order('date',{ascending:false})
    setEntries(data||[])
  }
  const saveNote=async()=>{
    if(!newContent.trim()||!user) return
    setSaving(true)
    await supabase.from('journal').insert({
      user_id:user.id, date:new Date().toISOString().split('T')[0],
      content:newContent, pinned:false
    })
    setNewContent(''); setAdding(false); setSaving(false); fetchEntries(user.id)
  }
  const togglePin=async(entry)=>{
    await supabase.from('journal').update({pinned:!entry.pinned}).eq('id',entry.id)
    fetchEntries(user.id)
  }
  const deleteNote=async(id)=>{
    await supabase.from('journal').delete().eq('id',id); fetchEntries(user.id)
  }
  const formatDate=(ds)=>new Date(ds).toLocaleDateString('en-IN',{
    weekday:'short',day:'numeric',month:'short',year:'numeric'
  })

  return (
    <div style={{minHeight:'100vh', background:t.bg, fontFamily:"'Inter',sans-serif",
      transition:'background 0.3s', position:'relative', overflow:'hidden'}}>

      {/* ── Morpankh background overlay ── */}
      <MorpankhBg dark={dark}/>

      {/* ── All content above the background ── */}
      <div style={{position:'relative', zIndex:1}}>

        {/* ── TOP ROW: "Notes" left + TopBar right — same line ── */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between',
          padding: isMobile ? '12px 12px 0 12px' : '16px 24px 0 24px',
          flexWrap:'wrap', gap:8}}>

          {/* Left: Title */}
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <h1 style={{fontSize:isMobile?20:26, fontWeight:900, color:t.text, margin:0}}>
              Notes 📝
            </h1>
            <p style={{fontSize:13, color:t.purple, margin:0}}>
              {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
            </p>
          </div>

          {/* Right: TopBar with working R button */}
          <TopBar user={user} streak={0} onLogout={onLogout} dark={dark} onToggleDark={onToggleDark}/>
        </div>

        {/* ── Content area ── */}
        <div style={{padding: isMobile ? 12 : 24, paddingTop:20}}>

          {/* + Button — floating bottom right on mobile, inline on desktop */}
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
            {adding&&(
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
                    <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                      onClick={saveNote}
                      style={{padding:'8px 20px', borderRadius:12, fontSize:13, fontWeight:700,
                        background:`linear-gradient(135deg,${t.pink},${t.purple})`,
                        color:'white', border:'none', cursor:'pointer'}}>
                      {saving ? '✓ Saving...' : 'Save Note'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pinned Notes */}
          {entries.filter(e=>e.pinned).length>0&&(
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
          {entries.filter(e=>!e.pinned).length>0&&(
            <div>
              {entries.filter(e=>e.pinned).length>0&&
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
          {entries.length===0&&!adding&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}}
              style={{textAlign:'center', paddingTop:120}}>
              <p style={{fontSize:56, marginBottom:12}}>📝</p>
              <p style={{fontSize:101010, fontWeight:700, color:t.text, margin:0}}>No notes yet</p>
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
        background: t.card,
        borderRadius:20, padding:20,
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
      {isLong&&(
        <button onClick={()=>setExpanded(!expanded)}
          style={{marginTop:8,background:'none',border:'none',cursor:'pointer',
            fontSize:12,fontWeight:600,color:t.pink,padding:0}}>
          {expanded?'▲ Show less':'▼ Read more'}
        </button>
      )}
    </motion.div>
  )
}
