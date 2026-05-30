import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { TopBar } from './HabitTracker'   // ✅ shared TopBar

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

export default function Journal({ user: propUser, onLogout, dark, onToggleDark }) {
  const t = dark ? T.dark : T.light

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
    await supabase.from('journal').insert({user_id:user.id,date:new Date().toISOString().split('T')[0],content:newContent,pinned:false})
    setNewContent(''); setAdding(false); setSaving(false); fetchEntries(user.id)
  }
  const togglePin=async(entry)=>{
    await supabase.from('journal').update({pinned:!entry.pinned}).eq('id',entry.id)
    fetchEntries(user.id)
  }
  const deleteNote=async(id)=>{
    await supabase.from('journal').delete().eq('id',id); fetchEntries(user.id)
  }
  const formatDate=(ds)=>new Date(ds).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})

  return (
    <div style={{padding:24,minHeight:'100vh',background:t.bg,fontFamily:"'Inter',sans-serif",
      transition:'background 0.3s'}}>

      {/* ✅ TopBar — moon/sun + streak + date + avatar */}
      <TopBar user={user} streak={0} onLogout={onLogout} dark={dark} onToggleDark={onToggleDark}/>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',margin:'20px 0 24px 0'}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:900,color:t.text,margin:0}}>Notes 📝</h1>
          <p style={{fontSize:13,color:t.purple,margin:'4px 0 0 0'}}>
            {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
          </p>
        </div>
        {!adding&&(
          <motion.button whileHover={{scale:1.09}} whileTap={{scale:0.95}}
            onClick={()=>setAdding(true)}
            style={{width:48,height:48,borderRadius:'50%',
              background:`linear-gradient(135deg,${t.pink},${t.purple})`,
              border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:`0 4px 16px rgba(233,30,140,0.35)`}}>
            <span style={{fontSize:28,color:'white',lineHeight:1,marginTop:-2}}>+</span>
          </motion.button>
        )}
      </div>

      {/* New Note */}
      <AnimatePresence>
        {adding&&(
          <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
            style={{background:t.card,borderRadius:20,boxShadow:`0 2px 20px ${t.shadow}`,
              padding:20,marginBottom:20,border:`2px solid ${t.pink}`}}>
            <textarea autoFocus value={newContent} onChange={e=>setNewContent(e.target.value)}
              placeholder="Write your note here..." rows={5}
              style={{width:'101%',borderRadius:12,padding:12,background:t.purpleLight,
                border:`1px solid ${t.border}`,color:t.text,fontSize:14,outline:'none',
                resize:'none',lineHeight:1.7,boxSizing:'border-box',fontFamily:"'Inter',sans-serif"}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
              <span style={{fontSize:11,color:t.purple}}>{newContent.length} characters</span>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{setAdding(false);setNewContent('')}}
                  style={{padding:'8px 16px',borderRadius:12,fontSize:13,fontWeight:600,
                    background:t.purpleLight,color:t.purple,border:'none',cursor:'pointer'}}>
                  Cancel
                </button>
                <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={saveNote}
                  style={{padding:'8px 20px',borderRadius:12,fontSize:13,fontWeight:700,
                    background:`linear-gradient(135deg,${t.pink},${t.purple})`,
                    color:'white',border:'none',cursor:'pointer'}}>
                  {saving?'✓ Saving...':'Save Note'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned */}
      {entries.filter(e=>e.pinned).length>0&&(
        <div style={{marginBottom:8}}>
          <p style={{fontSize:11,fontWeight:700,color:t.purple,letterSpacing:1,margin:'0 0 10px 0'}}>📌 PINNED</p>
          <div style={{display:'flex',flexDirection:'column',gap:11,marginBottom:21}}>
            {entries.filter(e=>e.pinned).map(entry=>(
              <NoteCard key={entry.id} entry={entry} onPin={togglePin} onDelete={deleteNote}
                formatDate={formatDate} t={t} pinned/>
            ))}
          </div>
        </div>
      )}

      {/* All */}
      {entries.filter(e=>!e.pinned).length>0&&(
        <div>
          {entries.filter(e=>e.pinned).length>0&&
            <p style={{fontSize:11,fontWeight:700,color:t.purple,letterSpacing:1,margin:'0 0 10px 0'}}>🗒 ALL NOTES</p>}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {entries.filter(e=>!e.pinned).map(entry=>(
              <NoteCard key={entry.id} entry={entry} onPin={togglePin} onDelete={deleteNote}
                formatDate={formatDate} t={t}/>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {entries.length===0&&!adding&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{textAlign:'center',paddingTop:80}}>
          <p style={{fontSize:48,marginBottom:12}}>📝</p>
          <p style={{fontSize:16,fontWeight:700,color:t.text,margin:0}}>No notes yet</p>
          <p style={{fontSize:13,color:t.purple,marginTop:6}}>Tap + to write your first note</p>
        </motion.div>
      )}
    </div>
  )
}

function NoteCard({ entry, onPin, onDelete, formatDate, t, pinned }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = entry.content.length > 200
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
      style={{background:t.card,borderRadius:20,padding:20,
        boxShadow:pinned?`0 4px 24px rgba(233,30,140,0.15),0 0 0 2px ${t.pink}`:`0 2px 20px ${t.shadow}`,
        border:pinned?`2px solid ${t.pink}`:'2px solid transparent'}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
        <span style={{fontSize:11,fontWeight:600,color:t.purple,background:t.purpleLight,padding:'3px 10px',borderRadius:20}}>
          {formatDate(entry.date)}
        </span>
        <div style={{display:'flex',gap:6}}>
          <button onClick={()=>onPin(entry)} title={entry.pinned?'Unpin':'Pin'}
            style={{width:30,height:30,borderRadius:'50%',
              background:entry.pinned?`linear-gradient(135deg,${t.pink},${t.purple})`:t.purpleLight,
              border:'none',cursor:'pointer',fontSize:14,
              display:'flex',alignItems:'center',justifyContent:'center'}}>📌</button>
          <button onClick={()=>onDelete(entry.id)}
            style={{width:30,height:30,borderRadius:'50%',background:'#FEE2E2',border:'none',cursor:'pointer',
              fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>🗑</button>
        </div>
      </div>
      <p style={{fontSize:14,color:t.text,lineHeight:1.75,margin:0,whiteSpace:'pre-wrap',
        overflow:'hidden',display:'-webkit-box',WebkitBoxOrient:'vertical',
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
