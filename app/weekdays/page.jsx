'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeekdaysPage() {
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
    const days = {
      'Пн': 0,
      'Вт': 0,
      'Ср': 0,
      'Чт': 0,
      'Пт': 0,
      'Сб': 0,
      'Вс': 0
    }

    trades.forEach(trade => {
      const day = new Date(trade.created_at).getDay()
      const names = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      days[names[day]] += Number(trade.pnl || 0)
    })

    return Object.entries(days).map(([name, pnl]) => ({ name, pnl }))
  }, [trades])

  return (
    <div style={{ color: 'white', padding: 40 }}>
      <h1>Дни недели</h1>
      <p>Анализ PnL по дням недели.</p>

      <div style={{
        height: 420,
        marginTop: 30,
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 16,
        padding: 20
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#cbd5e1" />
            <YAxis stroke="#cbd5e1" />
            <Tooltip />
            <Bar dataKey="pnl" fill="#7c3aed" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
