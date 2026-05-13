import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const GREEN = '#285E2C'
const GREEN_LIGHT = '#E8F5E9'
const YELLOW = '#FFE67C'

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [user, setUser] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchEntries(user.id)
    })
  }, [])

  const fetchEntries = async (uid) => {
    const { data } = await supabase.from('journal').select('*').eq('user_id', uid).order('pinned', { ascending: false }).order('date', { ascending: false })
    setEntries(data || [])
  }

  const saveNote = async () => {
    if (!newContent.trim() || !user) return
    setSaving(true)
    await supabase.from('journal').insert({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      content: newContent,
      pinned: false
    })
    setNewContent('')
    setAdding(false)
    setSaving(false)
    fetchEntries(user.id)
  }

  const togglePin = async (entry) => {
    await supabase.from('journal').update({ pinned: !entry.pinned }).eq('id', entry.id)
    fetchEntries(user.id)
  }

  const deleteNote = async (id) => {
    await supabase.from('journal').delete().eq('id', id)
    fetchEntries(user.id)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  const C = { background: 'white', borderRadius: 20, boxShadow: '0 2px 20px rgba(40,94,44,0.08)' }

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: YELLOW, fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 901, color: GREEN, margin: 0 }}>Notes 📝</h1>
          <p style={{ fontSize: 13, color: '#4a7c4e', margin: '4px 0 0 0' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* + Button */}
        {!adding && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAdding(true)}
            style={{
              width: 48, height: 48, borderRadius: '51%',
              background: GREEN, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(40,94,44,0.3)'
            }}>
            <span style={{ fontSize: 28, color: YELLOW, lineHeight: 1, marginTop: -2 }}>+</span>
          </motion.button>
        )}
      </div>

      {/* New Note Input */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{ ...C, padding: 20, marginBottom: 20, border: `2px solid ${GREEN}` }}>
            <textarea
              autoFocus
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Write your note here..."
              rows={5}
              style={{
                width: '100%', borderRadius: 12, padding: 12,
                background: YELLOW, border: `1px solid rgba(40,94,44,0.2)`,
                color: GREEN, fontSize: 14, outline: 'none',
                resize: 'none', lineHeight: 1.7, boxSizing: 'border-box',
                fontFamily: "'Inter', sans-serif"
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 11, color: '#4a7c4e' }}>{newContent.length} characters</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setAdding(false); setNewContent('') }}
                  style={{
                    padding: '8px 16px', borderRadius: 12, fontSize: 13,
                    fontWeight: 600, background: GREEN_LIGHT, color: GREEN,
                    border: 'none', cursor: 'pointer'
                  }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={saveNote}
                  style={{
                    padding: '8px 20px', borderRadius: 12, fontSize: 13,
                    fontWeight: 700, background: GREEN, color: YELLOW,
                    border: 'none', cursor: 'pointer'
                  }}>
                  {saving ? '✓ Saving...' : 'Save Note'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned Notes */}
      {entries.filter(e => e.pinned).length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#4a7c4e', letterSpacing: 1, marginBottom: 10, margin: '0 0 10px 0' }}>📌 PINNED</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {entries.filter(e => e.pinned).map(entry => (
              <NoteCard key={entry.id} entry={entry} onPin={togglePin} onDelete={deleteNote} formatDate={formatDate} GREEN={GREEN} GREEN_LIGHT={GREEN_LIGHT} YELLOW={YELLOW} pinned />
            ))}
          </div>
        </div>
      )}

      {/* All Notes */}
      {entries.filter(e => !e.pinned).length > 0 && (
        <div>
          {entries.filter(e => e.pinned).length > 0 &&
            <p style={{ fontSize: 11, fontWeight: 700, color: '#4a7c4e', letterSpacing: 1, margin: '0 0 10px 0' }}>🗒 ALL NOTES</p>
          }
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.filter(e => !e.pinned).map(entry => (
              <NoteCard key={entry.id} entry={entry} onPin={togglePin} onDelete={deleteNote} formatDate={formatDate} GREEN={GREEN} GREEN_LIGHT={GREEN_LIGHT} YELLOW={YELLOW} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && !adding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', paddingTop: 80 }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📝</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: GREEN, margin: 0 }}>No notes yet</p>
          <p style={{ fontSize: 13, color: '#4a7c4e', marginTop: 6 }}>Tap + to write your first note</p>
        </motion.div>
      )}
    </div>
  )
}

function NoteCard({ entry, onPin, onDelete, formatDate, GREEN, GREEN_LIGHT, YELLOW, pinned }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = entry.content.length > 200

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        background: 'white',
        borderRadius: 20,
        padding: 20,
        boxShadow: pinned
          ? `0 4px 24px rgba(40,94,44,0.15), 0 0 0 2px ${GREEN}`
          : '0 2px 20px rgba(40,94,44,0.08)',
        border: pinned ? `2px solid ${GREEN}` : '2px solid transparent'
      }}>

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#4a7c4e', background: GREEN_LIGHT, padding: '3px 10px', borderRadius: 20 }}>
          {formatDate(entry.date)}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Pin button */}
          <button
            onClick={() => onPin(entry)}
            title={entry.pinned ? 'Unpin' : 'Pin'}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: entry.pinned ? GREEN : GREEN_LIGHT,
              border: 'none', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
            📌
          </button>
          {/* Delete button */}
          <button
            onClick={() => onDelete(entry.id)}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#FEE2E2', border: 'none', cursor: 'pointer',
              fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
            🗑
          </button>
        </div>
      </div>

      {/* Content */}
      <p style={{
        fontSize: 14, color: '#1a3a1c', lineHeight: 1.75, margin: 0,
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: expanded ? 'unset' : 4
      }}>
        {entry.content}
      </p>

      {/* Expand toggle */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: 8, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
            color: GREEN, padding: 0
          }}>
          {expanded ? '▲ Show less' : '▼ Read more'}
        </button>
      )}
    </motion.div>
  )
}