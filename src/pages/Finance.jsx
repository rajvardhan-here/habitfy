import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

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

  return (
    <div className="p-6 overflow-y-auto min-h-screen" style={{ background: '#F0F7FF' }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#53161D' }}>Finance Tracker 💰</h1>
      <p className="text-sm mb-6" style={{ color: '#97CBFB' }}>
        {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Monthly Budget', value: `₹${budget?.amount?.toLocaleString() || '—'}`, color: '#4E8BC4' },
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, color: '#53161D' },
          { label: 'Remaining', value: `₹${Math.abs(remaining).toLocaleString()}`, color: remaining >= 0 ? '#4E8BC4' : '#e74c3c' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)' }}>
            <p className="text-xs mb-1" style={{ color: '#97CBFB' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Area Chart */}
        <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#53161D' }}>Last 7 Days Spending</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={last7}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#97CBFB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#97CBFB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F7FF" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#97CBFB' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#97CBFB' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => `₹${v}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="amount" stroke="#4E8BC4" strokeWidth={2.5} fill="url(#spendGrad)" dot={{ fill: '#4E8BC4', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Bar Chart */}
        <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#53161D' }}>By Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: '#97CBFB' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#53161D' }} width={80} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => `₹${v}`} contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Bar dataKey="amount" fill="#4E8BC4" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Set Budget */}
        <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#53161D' }}>{budget ? 'Update Budget' : 'Set Monthly Budget'}</h3>
          <div className="flex gap-2">
            <input value={newBudget} onChange={e => setNewBudget(e.target.value)}
              placeholder={budget ? `Current: ₹${budget.amount}` : 'Enter amount...'}
              type="number"
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: '#F0F7FF', border: '1px solid #E8F4FD', color: '#53161D' }} />
            <button onClick={saveBudget}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #97CBFB, #4E8BC4)' }}>Save</button>
          </div>
          {budget && (
            <div className="mt-3">
              <div className="w-full rounded-full h-2" style={{ background: '#F0F7FF' }}>
                <div className="h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((totalSpent / budget.amount) * 100, 100)}%`, background: totalSpent > budget.amount ? '#e74c3c' : 'linear-gradient(90deg, #97CBFB, #4E8BC4)' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: '#97CBFB' }}>{Math.round((totalSpent / budget.amount) * 100)}% used</p>
            </div>
          )}
        </div>

        {/* Add Expense */}
        <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#53161D' }}>Add Expense</h3>
          <div className="flex flex-col gap-2">
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What did you spend on?"
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: '#F0F7FF', border: '1px solid #E8F4FD', color: '#53161D' }} />
            <div className="flex gap-2">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: '#F0F7FF', border: '1px solid #E8F4FD', color: '#53161D' }}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="₹" type="number"
                className="w-24 rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: '#F0F7FF', border: '1px solid #E8F4FD', color: '#53161D' }} />
            </div>
            <button onClick={addExpense}
              className="rounded-xl py-2 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #97CBFB, #4E8BC4)' }}>Add Expense</button>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 2px 15px rgba(78,139,196,0.08)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#53161D' }}>Recent Expenses</h3>
        {expenses.slice(0, 10).map((e) => (
          <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#F0F7FF' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#53161D' }}>{e.description}</p>
              <p className="text-xs" style={{ color: '#97CBFB' }}>{e.category} · {e.date}</p>
            </div>
            <p className="text-sm font-bold" style={{ color: '#4E8BC4' }}>₹{e.amount}</p>
          </div>
        ))}
        {expenses.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: '#97CBFB' }}>No expenses yet!</p>
        )}
      </div>
    </div>
  )
}