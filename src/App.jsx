
import React from 'react'
import {
  Home, CalendarDays, BarChart3, PieChart, Layers, AlertTriangle,
  Activity, ClipboardList, ChevronLeft, ChevronRight, Plus, X,
  Wallet, TrendingUp, Target, RefreshCcw, ArrowUpRight, ImageIcon
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RPieChart, Pie, Cell
} from 'recharts'

const pnlData = [
  { day:'1 мая', pnl:80 }, { day:'3 мая', pnl:260 }, { day:'5 мая', pnl:180 },
  { day:'7 мая', pnl:140 }, { day:'9 мая', pnl:280 }, { day:'11 мая', pnl:410 },
  { day:'13 мая', pnl:500 }, { day:'15 мая', pnl:720 }, { day:'17 мая', pnl:560 },
  { day:'19 мая', pnl:580 }, { day:'21 мая', pnl:600 }, { day:'23 мая', pnl:540 },
  { day:'25 мая', pnl:650 }, { day:'27 мая', pnl:610 }, { day:'29 мая', pnl:760 },
  { day:'30 мая', pnl:850 }
]

const weekData = [
  { name:'Пн', pnl:330 }, { name:'Вт', pnl:680 }, { name:'Ср', pnl:520 },
  { name:'Чт', pnl:340 }, { name:'Пт', pnl:430 }
]

const sessions = [
  { name:'Азия', value:32 }, { name:'Франкфурт', value:23 },
  { name:'Лондон', value:29 }, { name:'Нью-Йорк', value:16 }
]

const trades = [
  { pair:'EURUSD', side:'Long', time:'09:15', result:'win' },
  { pair:'XAUUSD', side:'Short', time:'11:40', result:'loss' },
  { pair:'GBPUSD', side:'Long', time:'14:05', result:'win' }
]

function Stars({ type='neutral' }) {
  return <span className={'stars ' + type}>*****</span>
}

function Sidebar({ active }) {
  const analytics = [
    ['По сессиям', PieChart], ['По дням недели', BarChart3],
    ['По сетапам', Layers], ['По ошибкам', AlertTriangle], ['Результативность', Activity]
  ]
  return (
    <aside className="sidebar">
      <div className="logo">TRADING JOURNAL</div>
      <div className="author">by MikaTrades</div>

      <div className="navBlock">
        <div className="navItem active"><Home size={18}/> Дашборд</div>
        <div className="navItem"><CalendarDays size={18}/> Обзор календаря</div>
      </div>

      <div className="sectionName">Аналитика</div>
      <div className="navBlock">
        {analytics.map(([name, Icon]) => <div className="navItem" key={name}><Icon size={18}/> {name}</div>)}
      </div>

      <div className="sectionName">Разбор сделок</div>
      <div className="navBlock">
        <div className="navItem"><ClipboardList size={18}/> Все сделки</div>
      </div>

      <div className="currentMonth">
        <span>Текущий месяц</span>
        <b>Май 2025</b>
        <CalendarDays size={18}/>
      </div>
    </aside>
  )
}

function StatCard({ title, sub, Icon }) {
  return (
    <div className="statCard">
      <div>
        <div className="statTitle">{title}</div>
        <div className="statValue">*****</div>
        <div className="statSub">{sub}</div>
      </div>
      <div className="statIcon"><Icon size={21}/></div>
    </div>
  )
}

function TableCard({ title, first='Сетап', action='Посмотреть все' }) {
  return (
    <div className="panel tablePanel">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr><th>{first}</th><th>Сделки</th><th>PnL</th><th>Средний PnL</th></tr>
        </thead>
        <tbody>
          {[1,2,3,4,5].map(n => (
            <tr key={n}><td>{n}. *****</td><td>*****</td><td>*****</td><td>*****</td></tr>
          ))}
        </tbody>
      </table>
      <button className="linkBtn">{action} →</button>
    </div>
  )
}

function DashboardTop() {
  return (
    <>
      <div className="pageHeader">
        <h1>Дашборд</h1>
        <div className="monthControls">
          <button><ChevronLeft size={18}/></button>
          <button className="monthBtn"><CalendarDays size={17}/> Май 2025</button>
        </div>
      </div>

      <div className="statsGrid">
        <StatCard title="Месячный PnL" sub="***** к прошлому месяцу" Icon={Wallet}/>
        <StatCard title="Всего сделок" sub="***** к прошлому месяцу" Icon={TrendingUp}/>
        <StatCard title="Прибыльные сделки" sub="***** от общего числа" Icon={Target}/>
        <StatCard title="Win Rate" sub="*****" Icon={RefreshCcw}/>
        <StatCard title="Средняя прибыль" sub="*****" Icon={ArrowUpRight}/>
        <StatCard title="Средний убыток" sub="*****" Icon={ImageIcon}/>
        <StatCard title="Profit Factor" sub="*****" Icon={RefreshCcw}/>
      </div>

      <div className="chartsGrid">
        <div className="panel pnlPanel">
          <div className="panelHeader"><h3>Обзор PnL</h3><button className="smallSelect">День</button></div>
          <div className="chartBox">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlData}>
                <defs>
                  <linearGradient id="pnlFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.65}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{fill:'#c8cedb', fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{background:'#10151f',border:'1px solid #293041',borderRadius:12,color:'#fff'}}/>
                <Area type="monotone" dataKey="pnl" stroke="#8b5cf6" strokeWidth={3} fill="url(#pnlFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel sessionPanel">
          <h3>PnL по сессиям</h3>
          <div className="sessionWrap">
            <ResponsiveContainer width="52%" height={190}>
              <RPieChart>
                <Pie data={sessions} dataKey="value" innerRadius={52} outerRadius={84}>
                  {sessions.map((_, i) => <Cell key={i} fill={['#7c3aed','#8b5cf6','#a855f7','#c084fc'][i]} />)}
                </Pie>
              </RPieChart>
            </ResponsiveContainer>
            <div className="legend">
              {sessions.map((s, i) => <div key={s.name}><span style={{background:['#7c3aed','#8b5cf6','#a855f7','#c084fc'][i]}}/> {s.name} <b>*****</b></div>)}
            </div>
          </div>
        </div>

        <div className="panel weekPanel">
          <h3>PnL по дням недели</h3>
          <div className="chartBox small">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis dataKey="name" tick={{fill:'#c8cedb', fontSize:12}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Bar dataKey="pnl" fill="#7c3aed" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <TableCard title="Лучшие сетапы" first="Сетап" action="Все сетапы"/>
        <TableCard title="Обзор ошибок" first="Ошибка" action="Все ошибки"/>

        <div className="panel quickPanel">
          <div className="panelHeader">
            <h3>Быстро добавить сделку</h3>
            <button className="purpleBtn"><Plus size={16}/> Новая сделка</button>
          </div>
          <textarea placeholder="Быстрая заметка по сделке..."></textarea>
          <div className="orLine"><span></span>или<span></span></div>
          <button className="outlineBtn">Перейти ко всем сделкам</button>
        </div>
      </div>
    </>
  )
}

function CalendarSection() {
  const days = [28,29,30,1,2,5,6,7,8,9,12,13,14,15,16,19,20,21,22,23,26,27,28,29,30]
  const tones = ['muted','muted','muted','win','loss','win','loss','win','win','loss','win','loss','win','win','loss','win','neutral','win','loss','win','win','loss','win','neutral','win']

  return (
    <section className="calendarSection">
      <div className="calendarHeader">
        <h2>Обзор календаря</h2>
        <div className="calendarTools">
          <button>Сегодня</button>
          <button><ChevronLeft size={17}/></button>
          <button><ChevronRight size={17}/></button>
          <button className="monthBtn"><CalendarDays size={17}/> Май 2025</button>
        </div>
        <div className="filters">
          <button>PnL</button>
          <button>Месяц</button>
        </div>
      </div>

      <div className="calendarLayout">
        <div className="calendarPanel">
          <div className="weekNames">
            {['Пн','Вт','Ср','Чт','Пт'].map(d => <b key={d}>{d}</b>)}
          </div>
          <div className="calendarGrid">
            {days.map((d, i) => (
              <div className={'dayCell ' + (d===29 && i>20 ? 'selected' : '')} key={i}>
                <strong className={i<3 ? 'mutedDay' : ''}>{d}</strong>
                <Stars type={tones[i]}/>
              </div>
            ))}
          </div>
          <div className="calendarLegend">
            <span><i className="greenDot"/> Прибыльный день</span>
            <span><i className="redDot"/> Убыточный день</span>
            <span><i className="whiteDot"/> Нет сделок</span>
          </div>
        </div>

        <div className="dayDetails">
          <div className="detailsHeader">
            <h3>Четверг, 29 мая 2025</h3>
            <button><X size={17}/></button>
          </div>

          <div className="detailsStats">
            {['Дневной PnL','Сделки','Win Rate','Заметки'].map((x, i) => (
              <div key={x}><span>{x}</span><Stars type={i===0?'win':'neutral'}/></div>
            ))}
          </div>

          <div className="tradesHeader">
            <h3>Сделки</h3>
            <button className="purpleBtn"><Plus size={16}/> Добавить сделку</button>
          </div>

          <div className="tradeList">
            {trades.map((t, i) => (
              <div className="tradeItem" key={t.pair}>
                <div><b>{i+1}. {t.pair}</b> <em>{t.side}</em></div>
                <span>{t.time}</span>
                <p>Сетап: ***** &nbsp; | &nbsp; Ошибка: *****</p>
                <Stars type={t.result}/>
              </div>
            ))}
          </div>

          <button className="notesBtn">Заметки дня</button>
          <p className="noteText">*****</p>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main>
        <DashboardTop />
        <CalendarSection />
      </main>
    </div>
  )
}
