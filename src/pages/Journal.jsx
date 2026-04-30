import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [content, setContent] = useState('')
  const [user, setUser] = useState(null)
  const [saved, setSaved] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchEntries(user.id)
    })
  }, [])

  const fetchEntries = async (uid) => {
    const { data } = await supabase.from('journal').select('*').eq('user_id', uid).order('date', { ascending: false })
    setEntries(data || [])
    const todayEntry = data?.find(e => e.date === today)
    if (todayEntry) setContent(todayEntry.content)
  }

  const saveEntry = async () => {
    if (!content.trim()) return
    const existing = entries.find(e => e.date === today)
    if (existing) {
      await supabase.from('journal').update({ content }).eq('id', existing.id)
    } else {
      await supabase.from('journal').insert({ user_id: user.id, date: today, content })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    fetchEntries(user.id)
  }

  const moods = ['😊', '😐', '😔', '🔥', '😴', '💪']

  return (
    <div className="p-6 min-h-screen" style={{ background: '#F0F7FF' }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#53161D' }}>Journal 📓</h1>
      <p className="text-sm mb-6" style={{ color: '#97CBFB' }}>
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      <div className="grid grid-cols-3 gap-6">
        {/* Today's entry */}
        <div className="col-span-2 rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: '#53161D' }}>Today's Entry</h3>
            <div className="flex gap-2">
              {moods.map((m, i) => (
                <button key={i} onClick={() => setContent(prev => prev + ' ' + m)}
                  className="text-lg hover:scale-125 transition-transform">{m}</button>
              ))}
            </div>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="How was your day? What did you accomplish? What are you grateful for?"
            className="w-full rounded-xl p-3 text-sm outline-none resize-none"
            rows={12}
            style={{ background: '#F0F7FF', border: '1px solid #E8F4FD', color: '#53161D', lineHeight: 1.8 }}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs" style={{ color: '#97CBFB' }}>{content.length} characters</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveEntry}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: saved ? '#4E8BC4' : 'linear-gradient(135deg, #97CBFB, #4E8BC4)' }}>
              {saved ? '✓ Saved!' : 'Save Entry'}
            </motion.button>
          </div>
        </div>

        {/* Past entries */}
        <div className="rounded-2xl p-4 overflow-y-auto" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)', maxHeight: 520 }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#53161D' }}>Past Entries</h3>
          {entries.filter(e => e.date !== today).map((entry) => (
            <motion.div key={entry.id}
              whileHover={{ scale: 1.02 }}
              className="mb-3 p-3 rounded-xl cursor-pointer"
              style={{ background: '#F0F7FF', border: '1px solid #E8F4FD' }}
              onClick={() => setContent(entry.content)}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#4E8BC4' }}>{entry.date}</p>
              <p className="text-xs line-clamp-2" style={{ color: '#53161D' }}>{entry.content}</p>
            </motion.div>
          ))}
          {entries.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: '#97CBFB' }}>No entries yet!</p>
          )}
        </div>
      </div>
    </div>
  )
}