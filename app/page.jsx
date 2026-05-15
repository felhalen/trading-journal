'use client'

import { useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { buildStats, calcRR } from '@/lib/analytics'
import {
  Home, CalendarDays, BarChart3, PieChart, Layers, AlertTriangle, Activity,
  ClipboardList, Plus, Upload, Download, Brain, Cloud, Lock, Camera
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RPieChart, Pie, Cell } from 'recharts'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'

const demoTrades = [
  { symbol:'EURUSD', side:'long', pnl:120, setup:'Breakout', mistake:'', emotion_before:'спокойно', opened_at:'2025-05-01', session:'Лондон', entry_price:1.12, stop_loss:1.11, take_profit:1.14 },
  { symbol:'XAUUSD', side:'short', pnl:-70, setup:'Reversal', mistake:'ранний вход', emotion_before:'спешка', opened_at:'2025-05-02', session:'Нью-Йорк', entry_price:2340, stop_loss:2350, take_profit:2320 },
  { symbol:'GBPUSD', side:'long', pnl:210, setup:'Trend', mistake:'', emotion_before:'уверенно', opened_at:'2025-05-03', session:'Лондон', entry_price:1.25, stop_loss:1.245, take_profit:1.265 },
]

function Sidebar() {
  return <aside className="sidebar">
    <div className="logo">TRADING JOURNAL</div>
    <div className="author">Pro версия</div>
    <nav>
      <b><Home size={18}/> Дашборд</b>
      <span><CalendarDays size={18}/> Календарь</span>
      <span><PieChart size={18}/> Сессии</span>
      <span><BarChart3 size={18}/> Дни недели</span>
      <span><Layers size={18}/> Сетапы</span>
      <span><AlertTriangle size={18}/> Ошибки</span>
      <span><Activity size={18}/> Equity Curve</span>
      <span><ClipboardList size={18}/> Все сделки</span>
    </nav>
  </aside>
}

function Stat({ title, value }) {
  return <div className="stat"><small>{title}</small><strong>{value}</strong><em>обновляется автоматически</em></div>
}

export default function App() {
  const [trades, setTrades] = useState(demoTrades)
  const [filter, setFilter] = useState('')
  const [newTrade, setNewTrade] = useState({ symbol:'', side:'long', entry_price:'', stop_loss:'', take_profit:'', pnl:'', setup:'', mistake:'', emotion_before:'', notes:'' })
  const [ai, setAi] = useState(null)
  const [authEmail, setAuthEmail] = useState('')

  const visibleTrades = useMemo(() => {
    return trades.filter(t => !filter || [t.symbol,t.setup,t.mistake,t.session].join(' ').toLowerCase().includes(filter.toLowerCase()))
  }, [trades, filter])

  const stats = useMemo(() => buildStats(visibleTrades), [visibleTrades])

  const weekData = [
    { name:'Пн', pnl:120 }, { name:'Вт', pnl:-70 }, { name:'Ср', pnl:210 }, { name:'Чт', pnl:85 }, { name:'Пт', pnl:160 }
  ]

  const sessionData = [
    { name:'Азия', value:22 }, { name:'Франкфурт', value:18 }, { name:'Лондон', value:38 }, { name:'Нью-Йорк', value:22 }
  ]

  async function addTrade() {
    const trade = {
      ...newTrade,
      pnl: Number(newTrade.pnl || 0),
      entry_price: Number(newTrade.entry_price || 0),
      stop_loss: Number(newTrade.stop_loss || 0),
      take_profit: Number(newTrade.take_profit || 0),
      opened_at: new Date().toISOString(),
      source:'manual'
    }

    if (supabase) {
      await supabase.from('trades').insert(trade)
    }

    setTrades([trade, ...trades])
    setNewTrade({ symbol:'', side:'long', entry_price:'', stop_loss:'', take_profit:'', pnl:'', setup:'', mistake:'', emotion_before:'', notes:'' })
  }

  async function login() {
    if (!supabase) return alert('Добавь Supabase ENV в Vercel')
    await supabase.auth.signInWithOtp({ email: authEmail })
    alert('Письмо для входа отправлено')
  }

  async function analyzeTrade(trade) {
    const res = await fetch('/api/ai-analysis', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ trade }) })
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
          <button onClick={exportExcel}><Download size={16}/> Excel</button>
          <button onClick={exportPDF}><Download size={16}/> PDF</button>
          <button><Cloud size={16}/> Cloud Sync</button>
        </div>
      </header>

      <section className="authBox">
        <Lock size={18}/>
        <input placeholder="Email для авторизации Supabase" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} />
        <button onClick={login}>Войти</button>
        <span>{supabase ? 'Supabase подключен' : 'Demo mode: добавь ENV в Vercel'}</span>
      </section>

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
            <option value="long">Long</option><option value="short">Short</option><option value="buy">Buy</option><option value="sell">Sell</option>
          </select>
          <input type="file" title="Загрузка скриншота" />
        </div>
        <textarea placeholder="Заметки, дневник эмоций, причина входа..." value={newTrade.notes} onChange={e=>setNewTrade({...newTrade,notes:e.target.value})}/>
        <button onClick={addTrade}>Сохранить сделку</button>
      </section>

      <section className="panel">
        <div className="tableHead">
          <h3>Все сделки</h3>
          <input placeholder="Фильтр по символу, сетапу, ошибке, сессии..." value={filter} onChange={e=>setFilter(e.target.value)} />
        </div>
        <table>
          <thead>
            <tr><th>Символ</th><th>Сторона</th><th>PnL</th><th>RR</th><th>Сетап</th><th>Ошибка</th><th>Эмоция</th><th>AI</th></tr>
          </thead>
          <tbody>
            {visibleTrades.map((t,i)=>(
              <tr key={i}>
                <td>{t.symbol}</td><td>{t.side}</td><td className={Number(t.pnl)>=0?'green':'red'}>{t.pnl}</td>
                <td>{calcRR(t.entry_price,t.stop_loss,t.take_profit)}</td><td>{t.setup}</td><td>{t.mistake || '-'}</td><td>{t.emotion_before || '-'}</td>
                <td><button onClick={()=>analyzeTrade(t)}><Brain size={15}/> Анализ</button></td>
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
        <p>Для защиты передавай <code>secret</code>, который равен переменной <code>WEBHOOK_SECRET</code>.</p>
      </section>
    </main>
  </div>
}
