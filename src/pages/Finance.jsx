import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const GREEN = '#285E2C'
const GREEN_LIGHT = '#E8F5E9'
const YELLOW = '#FFE67C'

const QUOTES = [
  "Paisa bachana ek kala hai, kharch karna aadat. 💸",
  "Budget banana boring hai, broke hona aur zyada. 😅",
  "Chhota kharch, bada sapna. ✨",
  "Jo aaj bachaya, kal khaengaa haan merii jaan . 🏦",
  "Pocket mein chhed ho toh sikko se phele rishte gir jate h. 🕳️",
]

export default function Finance() {
  const [budget, setBudget] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [newBudget, setNewBudget] = useState('')
  const [form, setForm] = useState({ description: '', category: 'Food', amount: '' })
  const [user, setUser] = useState(null)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const printRef = useRef()

  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other']

  // Quote rotation every 5 seconds with fade
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => {
        setQuoteIndex(i => (i + 1) % QUOTES.length)
        setQuoteVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) { fetchBudget(user.id); fetchExpenses(user.id) }
    })
  }, [])

  useEffect(() => {
    if (user) fetchBudget(user.id)
  }, [selectedMonth])

  const fetchBudget = async (uid) => {
    const { data } = await supabase.from('budgets').select('*').eq('user_id', uid).eq('month', selectedMonth).single()
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
      await supabase.from('budgets').insert({ user_id: user.id, month: selectedMonth, amount: parseFloat(newBudget) })
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

  const deleteExpense = async (id) => {
    if (!confirm('Delete this expense?')) return
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const handlePrint = () => {
    const monthExpenses = expenses.filter(e => e.date && e.date.startsWith(selectedMonth))
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${monthName}</title>
          <style>
            body { font-family: 'Courier New', monospace; max-width: 400px; margin: 20px auto; padding: 20px; }
            h2 { text-align: center; border-bottom: 2px dashed #285E2C; padding-bottom: 10px; }
            .item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #ccc; }
            .total { display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 18px; border-top: 2px dashed #285E2C; margin-top: 10px; }
            .header { text-align: center; color: #285E2C; margin-bottom: 20px; }
            .cat { font-size: 11px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🧾 Pocket me Chhed</h2>
            <p>${monthName} Receipt</p>
            ${budget ? `<p>Budget: ₹${budget.amount.toLocaleString()}</p>` : ''}
          </div>
          ${monthExpenses.map(e => `
            <div class="item">
              <div>
                <div>${e.description}</div>
                <div class="cat">${e.category} · ${e.date}</div>
              </div>
              <div>₹${e.amount}</div>
            </div>
          `).join('')}
          <div class="total">
            <span>Total Spent</span>
            <span>₹${total.toLocaleString()}</span>
          </div>
          ${budget ? `<div class="total" style="color: ${total > budget.amount ? 'red' : '#285E2C'}">
            <span>${total > budget.amount ? 'Over Budget!' : 'Remaining'}</span>
            <span>${total > budget.amount ? '-' : ''}₹${Math.abs(budget.amount - total).toLocaleString()}</span>
          </div>` : ''}
          <p style="text-align:center; margin-top:20px; color:#999; font-size:12px;">Generated by Habitfy · Pocket me Chhed</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const monthExpenses = expenses.filter(e => e.date && e.date.startsWith(selectedMonth))
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = budget ? budget.amount - totalSpent : 0
  const isOverBudget = budget && totalSpent > budget.amount

  // Chart data — dates of selected month
  const daysInMonth = new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1], 0).getDate()
  const chartData = [...Array(daysInMonth)].map((_, i) => {
    const day = i + 1
    const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`
    const amt = expenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0)
    return { date: `${day}`, amount: amt }
  })

  const categoryData = categories.map(cat => ({
    category: cat,
    amount: monthExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.amount > 0)

  const isMobile = window.innerWidth < 768
  const C = { background: 'white', borderRadius: 20, boxShadow: '0 2px 20px rgba(40,94,44,0.08)' }
  const inputStyle = { background: YELLOW, border: `1px solid rgba(40,94,44,0.15)`, color: GREEN, borderRadius: 12, padding: '8px 12px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: isMobile ? 12 : 24, overflowY: 'auto', minHeight: '100vh', background: YELLOW, fontFamily: 'Inter, sans-serif' }}>

      {/* Header with quote */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginBottom: 20}}>
        <div>
          <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: GREEN, margin: '0 0 4px 0' }}>
            Mahine ka Kharch 💰
          </h1>
          <p style={{ fontSize: 18, color: '#4a7c4e', margin: 0 }}>
            {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Rotating quote */}
        <div style={{ background: 'rgba(40,94,44,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(40,94,44,0.25)', borderRadius: 30, padding: '5px 16px', width: '100%', textAlign: 'center' }}>
          <p style={{
            fontSize: 17, color: GREEN, margin: 0, fontStyle: 'italic', textAlign: 'center',
            opacity: quoteVisible ? 100 : 0,
            transition: 'opacity 0.5s ease'
          }}>
            {QUOTES[quoteIndex]}
          </p>
        </div>
      </div>

      {/* Month selector + Print button */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
          style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }} />
        <button onClick={handlePrint}
          style={{ padding: '8px 20px', borderRadius: 12, background: GREEN, color: YELLOW, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          🧾 Print Receipt
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Monthly Budget', value: `₹${budget?.amount?.toLocaleString() || '—'}`, color: GREEN },
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, color: '#c0392b' },
          {
            label: isOverBudget ? '⚠️ Over Budget!' : 'Remaining',
            value: `${isOverBudget ? '-' : ''}₹${Math.abs(remaining).toLocaleString()}`,
            color: isOverBudget ? '#e74c3c' : GREEN
          },
        ].map((s, i) => (
          <div key={i} style={{ ...C, padding: 16, border: i === 2 && isOverBudget ? '2px solid #e74c3c' : 'none' }}>
            <p style={{ fontSize: 11, color: '#4a7c4e', margin: '0 0 4px 0', fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ ...C, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: '0 0 12px 0' }}>
            Daily Spending — {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long' })}
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GREEN} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GREEN_LIGHT} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#4a7c4e' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#4a7c4e' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => `₹${v}`} labelFormatter={l => `${new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'short' })} ${l}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="amount" stroke={GREEN} strokeWidth={2.5} fill="url(#spendGrad)"
                dot={false}
                activeDot={{ r: 5, fill: YELLOW, stroke: GREEN, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...C, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: '0 0 12px 0' }}>By Category</h3>
          {categoryData.length === 0 ? (
            <p style={{ color: '#4a7c4e', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>No expenses this month</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#4a7c4e' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: GREEN }} width={80} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => `₹${v}`} contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="amount" fill={GREEN} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Budget + Add Expense */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ ...C, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: '0 0 12px 0' }}>{budget ? 'Update Budget' : 'Set Monthly Budget'}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newBudget} onChange={e => setNewBudget(e.target.value)}
              placeholder={budget ? `Current: ₹${budget.amount}` : 'Enter amount...'}
              type="number" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={saveBudget}
              style={{ padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: YELLOW, background: GREEN, border: 'none', cursor: 'pointer' }}>
              Save
            </button>
          </div>
          {budget && (
            <div style={{ marginTop: 12 }}>
              <div style={{ width: '100%', borderRadius: 99, height: 8, background: GREEN_LIGHT }}>
                <div style={{ height: 8, borderRadius: 99, transition: 'width 0.5s', width: `${Math.min((totalSpent / budget.amount) * 100, 100)}%`, background: isOverBudget ? '#e74c3c' : GREEN }} />
              </div>
              <p style={{ fontSize: 11, color: isOverBudget ? '#e74c3c' : '#4a7c4e', margin: '4px 0 0 0', fontWeight: isOverBudget ? 700 : 400 }}>
                {isOverBudget ? `⚠️ ${Math.round((totalSpent / budget.amount) * 100)}% used — Over budget!` : `${Math.round((totalSpent / budget.amount) * 100)}% used`}
              </p>
            </div>
          )}
        </div>

        <div style={{ ...C, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: '0 0 12px 0' }}>Add Expense</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What did you spend on?" style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && addExpense()} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ ...inputStyle, flex: 1 }}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="₹" type="number" style={{ ...inputStyle, width: 340 }}
                onKeyDown={e => e.key === 'Enter' && addExpense()} />
            </div>
            <button onClick={addExpense}
              style={{ borderRadius: 12, padding: '10px', fontSize: 13, fontWeight: 700, color: YELLOW, background: GREEN, border: 'none', cursor: 'pointer' }}>
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div style={{ ...C, padding: 16 }} ref={printRef}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: 0 }}>
            Recent Expenses ({new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long' })})
          </h3>
          <span style={{ fontSize: 12, color: '#4a7c4e', fontWeight: 600 }}>{monthExpenses.length} entries</span>
        </div>
        {monthExpenses.length === 0 && (
          <p style={{ fontSize: 13, textAlign: 'center', padding: '16px 0', color: '#4a7c4e', margin: 0 }}>No expenses this month!</p>
        )}
        {monthExpenses.map((e) => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${GREEN_LIGHT}` }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: GREEN, margin: 0 }}>{e.description}</p>
              <p style={{ fontSize: 11, color: '#4a7c4e', margin: 0 }}>{e.category} · {e.date}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: 0 }}>₹{e.amount}</p>
              <button onClick={() => deleteExpense(e.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.4, padding: 0 }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
