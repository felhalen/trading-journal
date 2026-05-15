import React from 'react'

const stats = [
  'Monthly PnL',
  'Total Trades',
  'Profitable Trades',
  'Win Rate',
  'Avg Win',
  'Avg Loss'
]

export default function App(){
  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">TRADING JOURNAL</div>
        <div className="small">by MikaTrades</div>

        <div className="menu">
          <div className="menu-item">Dashboard</div>
          <div className="menu-item" style={{background:'#141b34'}}>Calendar Review</div>
          <div className="menu-item" style={{background:'#141b34'}}>Analytics</div>
        </div>
      </div>

      <div className="content">
        <div className="title">Dashboard</div>

        <div className="top-grid">
          {stats.map((item)=>(
            <div className="card" key={item}>
              <div className="small">{item}</div>
              <div className="value">*****</div>
            </div>
          ))}
        </div>

        <div className="big-grid">
          <div className="card chart">
            <div className="small">PnL Overview</div>
            <div style={{marginTop:30,height:160,borderRadius:16,background:'linear-gradient(180deg,#7c3aed55,#00000000)'}}></div>
          </div>

          <div className="card chart">
            <div className="small">PnL by Session</div>
            <div style={{
              width:180,
              height:180,
              borderRadius:'50%',
              border:'24px solid #7c3aed',
              margin:'30px auto'
            }}></div>
          </div>

          <div className="card chart">
            <div className="small">Quick Add Trade</div>
            <div style={{
              marginTop:20,
              height:160,
              borderRadius:12,
              background:'#141b34'
            }}></div>
          </div>
        </div>

        <div className="title" style={{marginTop:40}}>Calendar Review</div>

        <div className="calendar">
          {Array.from({length:25}).map((_,i)=>(
            <div className="day" key={i}>
              <div style={{fontWeight:700,fontSize:22}}>{i+1}</div>
              <div style={{marginTop:20,color:i%2===0?'#4ade80':'#f43f5e'}}>
                *****
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
