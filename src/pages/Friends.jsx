import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

export default function Friends() {
  const [leaderboard, setLeaderboard] = useState([])
  const [searchEmail, setSearchEmail] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchLeaderboard()
    })
  }, [])

  const fetchLeaderboard = async () => {
    const { data } = await supabase.from('profiles').select('*').limit(10)
    setLeaderboard(data || [])
  }

  const searchFriend = async () => {
    if (!searchEmail.trim()) return
    const { data } = await supabase.from('profiles').select('*').eq('email', searchEmail).single()
    setMessage(data ? `Found: ${data.name || data.email}!` : 'User not found.')
    setTimeout(() => setMessage(''), 3000)
    setSearchEmail('')
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="p-6 min-h-screen" style={{ background: '#F0F7FF' }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#53161D' }}>Friends 👥</h1>
      <p className="text-sm mb-6" style={{ color: '#97CBFB' }}>See how your friends are doing!</p>

      <div className="grid grid-cols-2 gap-6">

        {/* Leaderboard */}
        <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#53161D' }}>🏆 Streak Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">👥</p>
              <p className="text-sm" style={{ color: '#97CBFB' }}>No users yet. Invite friends!</p>
            </div>
          ) : leaderboard.map((person, i) => (
            <motion.div key={person.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 py-3 border-b last:border-0"
              style={{ borderColor: '#F0F7FF' }}>
              <span className="text-xl w-8 text-center">{i < 3 ? medals[i] : `${i + 1}.`}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #97CBFB, #4E8BC4)' }}>
                {(person.name || person.email || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#53161D' }}>
                  {person.name || person.email?.split('@')[0] || 'Anonymous'}
                </p>
                <p className="text-xs" style={{ color: '#97CBFB' }}>0 day streak</p>
              </div>
              <span className="text-lg">🔥</span>
            </motion.div>
          ))}
        </div>

        {/* Right side */}
        <div className="flex flex-col gap-4">

          {/* Find Friend */}
          <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#53161D' }}>Find Friend</h3>
            <div className="flex gap-2">
              <input value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchFriend()}
                placeholder="Enter email..."
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: '#F0F7FF', border: '1px solid #E8F4FD', color: '#53161D' }} />
              <button onClick={searchFriend}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #97CBFB, #4E8BC4)' }}>Search</button>
            </div>
            {message && <p className="text-xs mt-2" style={{ color: '#4E8BC4' }}>{message}</p>}
          </div>

          {/* My Stats */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #7DB9E8, #4E8BC4)', boxShadow: '0 2px 15px rgba(78,139,196,0.2)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#F0E6D3' }}>My Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Current Streak', value: '0 🔥' },
                { label: 'Habits Done', value: '0 ✅' },
                { label: 'Best Streak', value: '0 🏆' },
                { label: 'Tasks Done', value: '0 💪' },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'rgba(240,230,211,0.15)' }}>
                  <p className="text-lg font-bold" style={{ color: '#F0E6D3' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: 'rgba(240,230,211,0.7)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Invite */}
          <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)' }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#53161D' }}>Invite Friends 🚀</h3>
            <p className="text-xs mb-3" style={{ color: '#97CBFB' }}>Share Habitfy with your friends!</p>
            <button onClick={() => { navigator.clipboard.writeText(window.location.origin); setMessage('Link copied! ✓') }}
              className="w-full py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #97CBFB, #4E8BC4)' }}>
              📋 Copy Invite Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}