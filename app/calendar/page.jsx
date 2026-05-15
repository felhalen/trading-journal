'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function CalendarPage() {
  const [trades, setTrades] = useState([])

  async function loadTrades() {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: true })

    setTrades(data || [])
  }

  useEffect(() => {
    loadTrades()
  }, [])

  const days = useMemo(() => {
    const grouped = {}

    trades.forEach(trade => {
      const date = new Date(trade.created_at).toLocaleDateString('ru-RU')

      if (!grouped[date]) {
        grouped[date] = {
          date,
          trades: 0,
          pnl: 0
        }
      }

      grouped[date].trades += 1
      grouped[date].pnl += Number(trade.pnl || 0)
    })

    return Object.values(grouped)
  }, [trades])

  return (
    <div style={{ color: 'white', padding: 40 }}>
      <h1>Календарь</h1>
      <p>Обзор торговых дней по PnL.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 16,
        marginTop: 30
      }}>
        {days.map(day => (
          <div
            key={day.date}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 16,
              padding: 20
            }}
          >
            <h3>{day.date}</h3>
            <p>Сделок: {day.trades}</p>
            <p style={{ color: day.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
              PnL: {day.pnl}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
