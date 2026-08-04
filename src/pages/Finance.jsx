import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TopBar } from './HabitTracker'

const T = {
  light: {
    bg:'#7A97C9', card:'#FFFFFF', text:'#1E1B4B', subtext:'#64748B',
    border:'#EDE9FE', inputBg:'#F8F7FF',
    pink:'#E91E8C', pinkLight:'#FCE7F3',
    purple:'#7C3AED', purpleLight:'#EDE9FE',
    amber:'#F59E0B', teal:'#0EA5E9',
    shadow:'rgba(124,58,237,0.08)',
  },
  dark: {
    bg:'#0F0B1E', card:'#1A1530', text:'#F0EEFF', subtext:'#A89EC9',
    border:'#2D2550', inputBg:'#231D3D',
    pink:'#F472B6', pinkLight:'rgba(244,114,182,0.15)',
    purple:'#A78BFA', purpleLight:'rgba(167,139,250,0.15)',
    amber:'#FCD34D', teal:'#38BDF8',
    shadow:'rgba(0,0,0,0.4)',
  }
}

const QUOTES = [
  "LIKH LE LIKH LE, HISAB LIKH LE betee 💸",
  "uske upar jo kharch kiya h , vo bhi likh lena ",
  "Chhota paisa , mota paisa , paisa hi paisa . ✨",
  "Jo aaj bachayenga , to kal khaengaa haan merii jaan . 🏦",
  "Pocket mein chhed ho toh sikko se phele rishte gir jate h. 🕳️",
]

export default function Finance({ user: propUser, onLogout, dark, onToggleDark }) {
  const t = dark ? T.dark : T.light

  const [budget,       setBudget]      = useState(null)
  const [expenses,     setExpenses]    = useState([])
  const [newBudget,    setNewBudget]   = useState('')
  const [form,         setForm]        = useState({ description:'', category:'Food', amount:'' })
  const [user,         setUser]        = useState(propUser||null)
  const [quoteIndex,   setQuoteIndex]  = useState(0)
  const [quoteVisible, setQuoteVisible]= useState(true)
  const [selectedMonth,setMonth]       = useState(new Date().toISOString().slice(0,7))
  const printRef = useRef()
  const categories = ['Food','Transport','Shopping','Entertainment','Health','Other']

  useEffect(()=>{
    const iv=setInterval(()=>{
      setQuoteVisible(false)
      setTimeout(()=>{setQuoteIndex(i=>(i+1)%QUOTES.length);setQuoteVisible(true)},400)
    },5000)
    return ()=>clearInterval(iv)
  },[])

  useEffect(()=>{
    supabase.auth.getUser().then(({data:{user}})=>{
      setUser(user)
      if(user){fetchBudget(user.id);fetchExpenses(user.id)}
    })
  },[])

  useEffect(()=>{if(user) fetchBudget(user.id)},[selectedMonth])

  const fetchBudget=async(uid)=>{
    const {data}=await supabase.from('budgets').select('*').eq('user_id',uid).eq('month',selectedMonth).maybeSingle()
    setBudget(data)
  }
  const fetchExpenses=async(uid)=>{
    const {data}=await supabase.from('expenses').select('*').eq('user_id',uid).order('date',{ascending:false})
    setExpenses(data||[])
  }
  const saveBudget=async()=>{
    if(!newBudget) return
    if(budget) await supabase.from('budgets').update({amount:parseFloat(newBudget)}).eq('id',budget.id)
    else       await supabase.from('budgets').insert({user_id:user.id,month:selectedMonth,amount:parseFloat(newBudget)})
    fetchBudget(user.id); setNewBudget('')
  }
  const addExpense=async()=>{
    if(!form.description||!form.amount) return
    await supabase.from('expenses').insert({user_id:user.id,date:new Date().toISOString().split('T')[0],
      category:form.category,description:form.description,amount:parseFloat(form.amount)})
    fetchExpenses(user.id); setForm({description:'',category:'Food',amount:''})
  }
  const deleteExpense=async(id)=>{
    if(!confirm('Delete this expense?')) return
    await supabase.from('expenses').delete().eq('id',id)
    setExpenses(expenses.filter(e=>e.id!==id))
  }
  const handlePrint=()=>{
    const me=expenses.filter(e=>e.date&&e.date.startsWith(selectedMonth))
    const total=me.reduce((s,e)=>s+e.amount,0)
    const mn=new Date(selectedMonth+'-01').toLocaleDateString('en-IN',{month:'long',year:'numeric'})
    const pw=window.open('','_blank')
    pw.document.write(`<html><head><title>Receipt - ${mn}</title><style>body{font-family:'Courier New',monospace;max-width:400px;margin:20px auto;padding:20px;}h2{text-align:center;border-bottom:2px dashed #E91E8C;padding-bottom:10px;}.item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dotted #ccc;}.total{display:flex;justify-content:space-between;padding:10px 0;font-weight:bold;font-size:18px;border-top:2px dashed #E91E8C;margin-top:10px;}.header{text-align:center;color:#7C3AED;margin-bottom:20px;}.cat{font-size:11px;color:#666;}</style></head><body><div class="header"><h2>🧾 Pocket me Chhed</h2><p>${mn} Receipt</p>${budget?`<p>Budget: ₹${budget.amount.toLocaleString()}</p>`:''}</div>${me.map(e=>`<div class="item"><div><div>${e.description}</div><div class="cat">${e.category} · ${e.date}</div></div><div>₹${e.amount}</div></div>`).join('')}<div class="total"><span>Total Spent</span><span>₹${total.toLocaleString()}</span></div>${budget?`<div class="total" style="color:${total>budget.amount?'red':'#7C3AED'}"><span>${total>budget.amount?'Over Budget!':'Remaining'}</span><span>${total>budget.amount?'-':''}₹${Math.abs(budget.amount-total).toLocaleString()}</span></div>`:''}<p style="text-align:center;margin-top:20px;color:#999;font-size:12px;">Generated by Habitfy</p></body></html>`)
    pw.document.close(); pw.print()
  }

  const monthExpenses=expenses.filter(e=>e.date&&e.date.startsWith(selectedMonth))
  const totalSpent=monthExpenses.reduce((s,e)=>s+e.amount,0)
  const remaining=budget?budget.amount-totalSpent:0
  const isOver=budget&&totalSpent>budget.amount
  const isMobile=window.innerWidth<768

  const daysInMonth=new Date(selectedMonth.split('-')[0],selectedMonth.split('-')[1],0).getDate()
  const chartData=[...Array(daysInMonth)].map((_,i)=>{
    const day=i+1, ds=`${selectedMonth}-${String(day).padStart(2,'0')}`
    const amt=expenses.filter(e=>e.date===ds).reduce((s,e)=>s+e.amount,0)
    return {date:`${day}`,amount:amt}
  })
  const categoryData=categories.map(cat=>({
    category:cat,
    amount:monthExpenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0)
  })).filter(c=>c.amount>0)

  const C={background:t.card,borderRadius:20,boxShadow:`0 2px 20px ${t.shadow}`}
  const inputStyle={background:t.purpleLight,border:`1px solid ${t.border}`,color:t.text,
    borderRadius:12,padding:'8px 12px',fontSize:13,outline:'none',width:'100%',boxSizing:'border-box'}

  return (
    <div style={{overflowY:'auto',minHeight:'100vh',background:t.bg,
      fontFamily:'Inter,sans-serif',transition:'background 0.3s'}}>

      {/* ── TOP ROW: Title left, TopBar right — same line ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
        padding: isMobile ? '12px 12px 0 12px' : '16px 24px 0 24px', flexWrap:'wrap', gap:8}}>

        {/* Left: title + subtitle */}
        <div>
          <h1 style={{fontSize:isMobile?20:24,fontWeight:900,color:t.text,margin:0,lineHeight:1.2}}>
            Mahine ka Kharch 💰
          </h1>
          <p style={{fontSize:14,color:t.purple,margin:'2px 0 0 0'}}>
            {new Date(selectedMonth+'-01').toLocaleDateString('en-IN',{month:'long',year:'numeric'})}
          </p>
        </div>

        {/* Right: TopBar (moon, streak, date, avatar) */}
        <TopBar user={user} streak={0} onLogout={onLogout} dark={dark} onToggleDark={onToggleDark}/>
      </div>

      {/* Content */}
      <div style={{padding:isMobile?12:24,paddingTop:16}}>

        {/* Quote bar */}
        <div style={{background:`linear-gradient(135deg,${t.pinkLight},${t.purpleLight})`,
          border:`1px solid ${t.border}`,borderRadius:30,padding:'6px 16px',marginBottom:20,textAlign:'center'}}>
          <p style={{fontSize:15,color:t.purple,margin:0,fontStyle:'italic',
            opacity:quoteVisible?1:0,transition:'opacity 0.5s ease'}}>{QUOTES[quoteIndex]}</p>
        </div>

        {/* Controls */}
        <div style={{display:'flex',gap:10,marginBottom:20,alignItems:'center',flexWrap:'wrap'}}>
          <input type="month" value={selectedMonth} onChange={e=>setMonth(e.target.value)}
            style={{...inputStyle,width:'auto',cursor:'pointer'}}/>
          <button onClick={handlePrint}
            style={{padding:'8px 20px',borderRadius:12,
              background:`linear-gradient(135deg,${t.pink},${t.purple})`,
              color:'white',fontWeight:700,fontSize:13,border:'none',cursor:'pointer',
              boxShadow:`0 4px 12px rgba(233,30,140,0.3)`}}>
            🧾 Print Receipt
          </button>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)',gap:16,marginBottom:24}}>
          {[
            {label:'Monthly Budget',value:`₹${budget?.amount?.toLocaleString()||'—'}`,color:t.purple},
            {label:'Total Spent',   value:`₹${totalSpent.toLocaleString()}`,          color:t.pink},
            {label:isOver?'⚠️ Over Budget!':'Remaining',
             value:`${isOver?'-':''}₹${Math.abs(remaining).toLocaleString()}`,
             color:isOver?'#e74c3c':t.teal},
          ].map((s,i)=>(
            <div key={i} style={{...C,padding:16,borderLeft:`4px solid ${s.color}`}}>
              <p style={{fontSize:11,color:t.subtext,margin:'0 0 4px 0',fontWeight:600}}>{s.label}</p>
              <p style={{fontSize:22,fontWeight:900,color:s.color,margin:0}}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:20,marginBottom:20}}>
          <div style={{...C,padding:16}}>
            <h3 style={{fontSize:13,fontWeight:700,color:t.text,margin:'0 0 12px 0'}}>
              Daily Spending — {new Date(selectedMonth+'-01').toLocaleDateString('en-IN',{month:'long'})}
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={t.pink}   stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={t.purple} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:9,fill:t.subtext}} axisLine={false} tickLine={false} interval={4}/>
                <YAxis tick={{fontSize:10,fill:t.subtext}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>`₹${v}`}
                  contentStyle={{borderRadius:12,border:'none',background:t.card,color:t.text}}/>
                <Area type="monotone" dataKey="amount" stroke={t.pink} strokeWidth={2.5} fill="url(#spendGrad)"
                  dot={false} activeDot={{r:5,fill:t.amber,stroke:t.pink,strokeWidth:2}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{...C,padding:16}}>
            <h3 style={{fontSize:13,fontWeight:700,color:t.text,margin:'0 0 12px 0'}}>By Category</h3>
            {categoryData.length===0?(
              <p style={{color:t.subtext,fontSize:13,textAlign:'center',paddingTop:40}}>No expenses this month</p>
            ):(
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" tick={{fontSize:11,fill:t.subtext}} axisLine={false} tickLine={false}/>
                  <YAxis dataKey="category" type="category" tick={{fontSize:11,fill:t.purple}} width={80} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={v=>`₹${v}`}
                    contentStyle={{borderRadius:12,border:'none',background:t.card,color:t.text}}/>
                  <Bar dataKey="amount" fill={t.purple} radius={[0,6,6,0]}/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Budget + Expense form */}
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:20,marginBottom:20}}>
          <div style={{...C,padding:16}}>
            <h3 style={{fontSize:13,fontWeight:700,color:t.text,margin:'0 0 12px 0'}}>
              {budget?'Update Budget':'Set Monthly Budget'}
            </h3>
            <div style={{display:'flex',gap:8}}>
              <input value={newBudget} onChange={e=>setNewBudget(e.target.value)}
                placeholder={budget?`Current: ₹${budget.amount}`:'Enter amount...'} type="number"
                style={{...inputStyle,flex:1}}/>
              <button onClick={saveBudget}
                style={{padding:'8px 16px',borderRadius:12,fontSize:13,fontWeight:700,color:'white',
                  background:`linear-gradient(135deg,${t.purple},${t.pink})`,border:'none',cursor:'pointer'}}>
                Save
              </button>
            </div>
            {budget&&(
              <div style={{marginTop:12}}>
                <div style={{width:'100%',borderRadius:99,height:8,background:t.purpleLight}}>
                  <div style={{height:8,borderRadius:99,transition:'width 0.5s',
                    width:`${Math.min((totalSpent/budget.amount)*100,100)}%`,
                    background:isOver?'#e74c3c':`linear-gradient(90deg,${t.purple},${t.pink})`}}/>
                </div>
                <p style={{fontSize:11,color:isOver?'#e74c3c':t.purple,margin:'4px 0 0 0',fontWeight:isOver?700:400}}>
                  {isOver?`⚠️ ${Math.round((totalSpent/budget.amount)*100)}% used — Over budget!`:`${Math.round((totalSpent/budget.amount)*100)}% used`}
                </p>
              </div>
            )}
          </div>
          <div style={{...C,padding:16}}>
            <h3 style={{fontSize:13,fontWeight:700,color:t.text,margin:'0 0 12px 0'}}>Add Expense</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                placeholder="What did you spend on?" style={inputStyle}
                onKeyDown={e=>e.key==='Enter'&&addExpense()}/>
              <div style={{display:'flex',gap:8}}>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                  style={{...inputStyle,flex:1}}>
                  {categories.map(c=><option key={c}>{c}</option>)}
                </select>
                <input value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
                  placeholder="₹" type="number" style={{...inputStyle,width:120}}
                  onKeyDown={e=>e.key==='Enter'&&addExpense()}/>
              </div>
              <button onClick={addExpense}
                style={{borderRadius:12,padding:'10px',fontSize:13,fontWeight:700,color:'white',
                  background:`linear-gradient(135deg,${t.pink},${t.purple})`,border:'none',cursor:'pointer',
                  boxShadow:`0 4px 12px rgba(233,30,140,0.25)`}}>
                Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Expense list */}
        <div style={{...C,padding:16}} ref={printRef}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <h3 style={{fontSize:13,fontWeight:700,color:t.text,margin:0}}>
              Recent Expenses ({new Date(selectedMonth+'-01').toLocaleDateString('en-IN',{month:'long'})})
            </h3>
            <span style={{fontSize:12,color:t.purple,fontWeight:600}}>{monthExpenses.length} entries</span>
          </div>
          {monthExpenses.length===0&&
            <p style={{fontSize:13,textAlign:'center',padding:'16px 0',color:t.subtext,margin:0}}>No expenses this month!</p>}
          {monthExpenses.map((e)=>(
            <div key={e.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'10px 0',borderBottom:`1px solid ${t.border}`}}>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:t.text,margin:0}}>{e.description}</p>
                <p style={{fontSize:11,color:t.purple,margin:0}}>{e.category} · {e.date}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <p style={{fontSize:13,fontWeight:700,color:t.pink,margin:0}}>₹{e.amount}</p>
                <button onClick={()=>deleteExpense(e.id)}
                  style={{background:'none',border:'none',cursor:'pointer',fontSize:14,opacity:0.4,padding:0}}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
