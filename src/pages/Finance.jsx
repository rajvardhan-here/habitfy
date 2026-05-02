import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const GREEN = '#285E2C'
const GREEN_LIGHT = '#E8F5E9'
const YELLOW = '#FFE67C'
const YELLOW_DARK = '#C9A800'

export default function Finance() {
  const [budget, setBudget] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [newBudget, setNewBudget] = useState('')
  const [form, setForm] = useState({ description: '', category: 'Food', amount: '' })
  const [user, setUser] = useState(null)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other']

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) { fetchBudget(user.id); fetchExpenses(user.id) }
    })
  }, [])

  const fetchBudget = async (uid) => {
    const { data } = await supabase.from('budgets').select('*').eq('user_id', uid).eq('month', currentMonth).single()
    setBudget(data)
  }

  const fetchExpenses = async (uid) => {
    const { data } = await supabase.from('expenses').select('*').eq('user_id', uid).order('date', { ascending: false })
    setExpenses(data || [])
  }

  const saveBudget = async () => {
    if (!newBudget) return
    if (budget) {
      await supabase.from('budgets').update({ amount: parseFloat(newBudget) }).eq('id', budget.id)
    } else {
      await supabase.from('budgets').insert({ user_id: user.id, month: currentMonth, amount: parseFloat(newBudget) })
    }
    fetchBudget(user.id)
    setNewBudget('')
  }

  const addExpense = async () => {
    if (!form.description || !form.amount) return
    await supabase.from('expenses').insert({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount)
    })
    fetchExpenses(user.id)
    setForm({ description: '', category: 'Food', amount: '' })
  }

  const totalSpent = expenses.filter(e => e.date?.startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0)
  const remaining = budget ? budget.amount - totalSpent : 0

  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const amt = expenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0)
    return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), amount: amt }
  })

  const categoryData = categories.map(cat => ({
    category: cat,
    amount: expenses.filter(e => e.category === cat && e.date?.startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.amount > 0)

  const C = { background: 'white', borderRadius: 20, boxShadow: '0 2px 20px rgba(40,94,44,0.08)' }
  const inputStyle = { background: YELLOW, border: `1px solid rgba(40,94,44,0.15)`, color: GREEN, borderRadius: 12, padding: '8px 12px', fontSize: 13, outline: 'none', width: '100%' }

  return (
    <div style={{ padding: 24, overflowY: 'auto', minHeight: '100vh', background: YELLOW, fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: GREEN, marginBottom: 4, margin: 0 }}>Finance Tracker 💰</h1>
      <p style={{ fontSize: 13, color: '#4a7c4e', marginBottom: 24, marginTop: 4 }}>
        {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Monthly Budget', value: `₹${budget?.amount?.toLocaleString() || '—'}`, color: GREEN },
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, color: '#c0392b' },
          { label: 'Remaining', value: `₹${Math.abs(remaining).toLocaleString()}`, color: remaining >= 0 ? GREEN : '#e74c3c' },
        ].map((s, i) => (
          <div key={i} style={{ ...C, padding: 16 }}>
            <p style={{ fontSize: 11, color: '#4a7c4e', margin: '0 0 4px 0', fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Area Chart */}
        <div style={{ ...C, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginBottom: 12, margin: '0 0 12px 0' }}>Last 7 Days Spending</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={last7}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GREEN} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GREEN_LIGHT} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#4a7c4e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#4a7c4e' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => `₹${v}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="amount" stroke={GREEN} strokeWidth={2.5} fill="url(#spendGrad)"
                dot={{ fill: GREEN, r: 4, stroke: YELLOW, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: YELLOW, stroke: GREEN, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Bar Chart */}
        <div style={{ ...C, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginBottom: 12, margin: '0 0 12px 0' }}>By Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: '#4a7c4e' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: GREEN }} width={80} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => `₹${v}`} contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Bar dataKey="amount" fill={GREEN} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Set Budget */}
        <div style={{ ...C, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: '0 0 12px 0' }}>{budget ? 'Update Budget' : 'Set Monthly Budget'}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newBudget} onChange={e => setNewBudget(e.target.value)}
              placeholder={budget ? `Current: ₹${budget.amount}` : 'Enter amount...'}
              type="number"
              style={{ ...inputStyle, flex: 1 }} />
            <button onClick={saveBudget}
              style={{ padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: YELLOW, background: GREEN, border: 'none', cursor: 'pointer' }}>
              Save
            </button>
          </div>
          {budget && (
            <div style={{ marginTop: 12 }}>
              <div style={{ width: '100%', borderRadius: 99, height: 6, background: GREEN_LIGHT }}>
                <div style={{ height: 6, borderRadius: 99, transition: 'width 0.5s', width: `${Math.min((totalSpent / budget.amount) * 100, 100)}%`, background: totalSpent > budget.amount ? '#e74c3c' : GREEN }} />
              </div>
              <p style={{ fontSize: 11, color: '#4a7c4e', marginTop: 4, margin: '4px 0 0 0' }}>{Math.round((totalSpent / budget.amount) * 100)}% used</p>
            </div>
          )}
        </div>

        {/* Add Expense */}
        <div style={{ ...C, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: '0 0 12px 0' }}>Add Expense</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What did you spend on?"
              style={inputStyle} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ ...inputStyle, flex: 1 }}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="₹" type="number"
                style={{ ...inputStyle, width: 80 }} />
            </div>
            <button onClick={addExpense}
              style={{ borderRadius: 12, padding: '10px', fontSize: 13, fontWeight: 700, color: YELLOW, background: GREEN, border: 'none', cursor: 'pointer' }}>
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div style={{ ...C, padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: '0 0 12px 0' }}>Recent Expenses</h3>
        {expenses.slice(0, 10).map((e) => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${GREEN_LIGHT}` }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: GREEN, margin: 0 }}>{e.description}</p>
              <p style={{ fontSize: 11, color: '#4a7c4e', margin: 0 }}>{e.category} · {e.date}</p>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: 0 }}>₹{e.amount}</p>
          </div>
        ))}
        {expenses.length === 0 && (
          <p style={{ fontSize: 13, textAlign: 'center', padding: '16px 0', color: '#4a7c4e', margin: 0 }}>No expenses yet!</p>
        )}
      </div>
    </div>
  )
} 