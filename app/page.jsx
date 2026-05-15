'use client'

import Link from "next/link"

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { buildStats, calcRR } from '@/lib/analytics'
import {
  Home, CalendarDays, BarChart3, PieChart, Layers, AlertTriangle, Activity,
  ClipboardList, Plus, Download, Brain, Cloud, Lock
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RPieChart, Pie, Cell } from 'recharts'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'

function Sidebar() {
  return <aside className="sidebar">
    <div className="logo">TRADING JOURNAL</div>
    <div className="author">Pro версия</div>
   <nav>
  <Link href="/"><b><Home size={18}/> Дашборд</b></Link>

  <Link href="/calendar">
    <span><CalendarDays size={18}/> Календарь</span>
  </Link>

  <Link href="/sessions">
    <span><PieChart size={18}/> Сессии</span>
  </Link>

  <Link href="/weekdays">
    <span><BarChart3 size={18}/> Дни недели</span>
  </Link>

  <Link href="/setups">
    <span><Layers size={18}/> Сетапы</span>
  </Link>

  <Link href="/mistakes">
    <span><AlertTriangle size={18}/> Ошибки</span>
  </Link>

  <Link href="/equity">
    <span><Activity size={18}/> Equity Curve</span>
  </Link>

  <Link href="/trades">
    <span><ClipboardList size={18}/> Все сделки</span>
  </Link>
</nav>
  </aside>
}

function Stat({ title, value }) {
  return <div className="stat"><small>{title}</small><strong>{value}</strong><em>обновляется автоматически</em></div>
}

export default function App() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    side: 'long',
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    pnl: '',
    setup: '',
    mistake: '',
    emotion_before: '',
    emotion_after: '',
    notes: ''
  })
  const [ai, setAi] = useState(null)
  const [authEmail, setAuthEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    loadTrades()
  }, [])

  async function loadTrades() {
    setLoading(true)

    if (!supabase) {
      setStatusMessage('Supabase ENV не найдены')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setStatusMessage(`Ошибка загрузки: ${error.message}`)
    } else {
      setTrades(data || [])
      setStatusMessage(`Загружено сделок: ${(data || []).length}`)
    }

    setLoading(false)
  }

  const visibleTrades = useMemo(() => {
    return trades.filter(t => !filter || [t.symbol, t.setup, t.mistake, t.emotion_before, t.side]
      .join(' ')
      .toLowerCase()
      .includes(filter.toLowerCase()))
  }, [trades, filter])

  const stats = useMemo(() => buildStats(visibleTrades), [visibleTrades])

  const weekData = useMemo(() => {
    const map = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт' }
    return Object.entries(map).map(([dayNum, name]) => {
      const pnl = visibleTrades
        .filter(t => new Date(t.created_at || t.opened_at).getDay() === Number(dayNum))
        .reduce((sum, t) => sum + Number(t.pnl || 0), 0)
      return { name, pnl }
    })
  }, [visibleTrades])

  const sessionData = [
    { name:'Азия', value:22 },
    { name:'Франкфурт', value:18 },
    { name:'Лондон', value:38 },
    { name:'Нью-Йорк', value:22 }
  ]

  async function addTrade() {
    if (!supabase) {
      alert('Supabase не подключен. Проверь ENV переменные в Vercel.')
      return
    }

    const entry = Number(newTrade.entry_price || 0)
    const sl = Number(newTrade.stop_loss || 0)
    const tp = Number(newTrade.take_profit || 0)

    const trade = {
      symbol: newTrade.symbol.trim().toUpperCase(),
      side: newTrade.side,
      entry_price: entry,
      stop_loss: sl,
      take_profit: tp,
      pnl: Number(newTrade.pnl || 0),
      setup: newTrade.setup,
      mistake: newTrade.mistake,
      emotion_before: newTrade.emotion_before,
      emotion_after: newTrade.emotion_after,
      rr: calcRR(entry, sl, tp),
      notes: newTrade.notes
    }

    if (!trade.symbol) {
      alert('Заполни symbol')
      return
    }

    const { data, error } = await supabase
      .from('trades')
      .insert(trade)
      .select()
      .single()

    if (error) {
      alert(`Ошибка сохранения: ${error.message}`)
      return
    }

    setTrades([data, ...trades])
    setStatusMessage('Сделка сохранена в Supabase')
    setNewTrade({
      symbol: '',
      side: 'long',
      entry_price: '',
      stop_loss: '',
      take_profit: '',
      pnl: '',
      setup: '',
      mistake: '',
      emotion_before: '',
      emotion_after: '',
      notes: ''
    })
  }

  async function deleteTrade(id) {
    if (!confirm('Удалить сделку?')) return
    const { error } = await supabase.from('trades').delete().eq('id', id)
    if (error) {
      alert(`Ошибка удаления: ${error.message}`)
      return
    }
    setTrades(trades.filter(t => t.id !== id))
  }

  async function login() {
    if (!supabase) return alert('Добавь Supabase ENV в Vercel')
    await supabase.auth.signInWithOtp({ email: authEmail })
    alert('Письмо для входа отправлено')
  }

  async function analyzeTrade(trade) {
    const res = await fetch('/api/ai-analysis', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ trade })
    })
    setAi(await res.json())
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(trades)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Trades')
    XLSX.writeFile(wb, 'trading-journal.xlsx')
  }

  function exportPDF() {
    const doc = new jsPDF()
    doc.text('Trading Journal Report', 14, 18)
    doc.text(`PnL: ${stats.pnl}`, 14, 30)
    doc.text(`Trades: ${stats.total}`, 14, 40)
    doc.text(`Win Rate: ${stats.winRate}%`, 14, 50)
    doc.save('trading-journal-report.pdf')
  }

  return <div className="app">
    <Sidebar />
    <main>
      <header>
        <div>
          <h1>Дашборд</h1>
          <p>MT5 + TradingView + Supabase + AI аналитика</p>
        </div>
        <div className="actions">
          <button onClick={loadTrades}><Cloud size={16}/> Обновить</button>
          <button onClick={exportExcel}><Download size={16}/> Excel</button>
          <button onClick={exportPDF}><Download size={16}/> PDF</button>
        </div>
      </header>

      <section className="authBox">
        <Lock size={18}/>
        <input placeholder="Email для авторизации Supabase" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} />
        <button onClick={login}>Войти</button>
        <span>{supabase ? 'Supabase подключен' : 'Demo mode: добавь ENV в Vercel'}</span>
      </section>

      {statusMessage && <section className="authBox">{statusMessage}</section>}

      <section className="statsGrid">
        <Stat title="Месячный PnL" value={`$${stats.pnl}`} />
        <Stat title="Всего сделок" value={stats.total} />
        <Stat title="Прибыльные сделки" value={stats.wins} />
        <Stat title="Win Rate" value={`${stats.winRate}%`} />
        <Stat title="Avg Win" value={`$${stats.avgWin}`} />
        <Stat title="Avg Loss" value={`$${stats.avgLoss}`} />
        <Stat title="Profit Factor" value={stats.profitFactor} />
      </section>

      <section className="grid3">
        <div className="panel wide">
          <h3>Equity Curve</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.equityCurve}>
              <XAxis dataKey="name" tick={{fill:'#cbd5e1'}} />
              <YAxis tick={{fill:'#cbd5e1'}} />
              <Tooltip contentStyle={{background:'#0f172a',border:'1px solid #334155'}}/>
              <Area type="monotone" dataKey="equity" stroke="#8b5cf6" fill="#7c3aed55" strokeWidth={3}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h3>PnL по сессиям</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RPieChart>
              <Pie data={sessionData} dataKey="value" innerRadius={55} outerRadius={90}>
                {sessionData.map((_,i)=><Cell key={i} fill={['#7c3aed','#8b5cf6','#a855f7','#c084fc'][i]}/>)}
              </Pie>
            </RPieChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h3>PnL по дням недели</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekData}>
              <XAxis dataKey="name" tick={{fill:'#cbd5e1'}} />
              <YAxis tick={{fill:'#cbd5e1'}} />
              <Bar dataKey="pnl" fill="#7c3aed" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="addTrade panel">
        <h3><Plus size={18}/> Добавить сделку</h3>
        <div className="formGrid">
          {['symbol','entry_price','stop_loss','take_profit','pnl','setup','mistake','emotion_before'].map(k => (
            <input key={k} placeholder={k} value={newTrade[k]} onChange={e=>setNewTrade({...newTrade,[k]:e.target.value})}/>
          ))}
          <select value={newTrade.side} onChange={e=>setNewTrade({...newTrade,side:e.target.value})}>
            <option value="long">Long</option>
            <option value="short">Short</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <textarea placeholder="Заметки, дневник эмоций, причина входа..." value={newTrade.notes} onChange={e=>setNewTrade({...newTrade,notes:e.target.value})}/>
        <button onClick={addTrade}>Сохранить сделку в Supabase</button>
      </section>

      <section className="panel">
        <div className="tableHead">
          <h3>Все сделки {loading ? '(загрузка...)' : ''}</h3>
          <input placeholder="Фильтр по символу, сетапу, ошибке, эмоции..." value={filter} onChange={e=>setFilter(e.target.value)} />
        </div>
        <table>
          <thead>
            <tr><th>Символ</th><th>Сторона</th><th>PnL</th><th>RR</th><th>Сетап</th><th>Ошибка</th><th>Эмоция</th><th>AI</th><th></th></tr>
          </thead>
          <tbody>
            {visibleTrades.map((t)=>(
              <tr key={t.id}>
                <td>{t.symbol}</td>
                <td>{t.side}</td>
                <td className={Number(t.pnl)>=0?'green':'red'}>{t.pnl}</td>
                <td>{t.rr || calcRR(t.entry_price,t.stop_loss,t.take_profit)}</td>
                <td>{t.setup}</td>
                <td>{t.mistake || '-'}</td>
                <td>{t.emotion_before || '-'}</td>
                <td><button onClick={()=>analyzeTrade(t)}><Brain size={15}/> Анализ</button></td>
                <td><button onClick={()=>deleteTrade(t.id)}>Удалить</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {ai && <section className="panel aiBox">
        <h3><Brain size={18}/> AI-анализ сделки</h3>
        <b>Score: {ai.score}/100</b>
        <p>{ai.summary}</p>
        <ul>{ai.issues.map((x,i)=><li key={i}>{x}</li>)}</ul>
      </section>}

      <section className="panel webhookBox">
        <h3>Webhook endpoints</h3>
        <p>TradingView alert URL: <code>/api/tradingview</code></p>
        <p>MT5 EA POST URL: <code>/api/mt5</code></p>
      </section>
    </main>
  </div>
}
