'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function SessionsPage() {
  const [trades, setTrades] = useState([])

  async function loadTrades() {
    const { data } = await supabase
      .from('trades')
      .select('*')

    setTrades(data || [])
  }

  useEffect(() => {
    loadTrades()
  }, [])

  const data = useMemo(() => {
    const sessions = {
      Азия: 0,
      Лондон: 0,
      'Нью-Йорк': 0,
      Другое: 0
    }

    trades.forEach(trade => {
      const hour = new Date(trade.created_at).getHours()

      if (hour >= 0 && hour < 8) sessions['Азия'] += Number(trade.pnl || 0)
      else if (hour >= 8 && hour < 15) sessions['Лондон'] += Number(trade.pnl || 0)
      else if (hour >= 15 && hour < 22) sessions['Нью-Йорк'] += Number(trade.pnl || 0)
      else sessions['Другое'] += Number(trade.pnl || 0)
    })

    return Object.entries(sessions).map(([name, value]) => ({ name, value }))
  }, [trades])

  return (
    <div style={{ color: 'white', padding: 40 }}>
      <h1>Сессии</h1>
      <p>Статистика PnL по торговым сессиям.</p>

      <div style={{
        height: 420,
        marginTop: 30,
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 16,
        padding: 20
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={80} outerRadius={140}>
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={['#7c3aed', '#8b5cf6', '#a855f7', '#c084fc'][index]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 20 }}>
        {data.map(item => (
          <p key={item.name}>
            {item.name}: <b>{item.value}</b>
          </p>
        ))}
      </div>
    </div>
  )
}
