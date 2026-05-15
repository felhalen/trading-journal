'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MistakesPage() {
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

  const mistakes = useMemo(() => {
    const result = {}

    trades.forEach(trade => {
      const name = trade.mistake || 'Без ошибки'

      if (!result[name]) {
        result[name] = {
          mistake: name,
          trades: 0,
          pnl: 0,
          losses: 0
        }
      }

      result[name].trades += 1
      result[name].pnl += Number(trade.pnl || 0)

      if (Number(trade.pnl || 0) < 0) {
        result[name].losses += 1
      }
    })

    return Object.values(result).map(item => ({
      ...item,
      lossRate: item.trades ? Math.round((item.losses / item.trades) * 100) : 0,
      avgPnl: item.trades ? (item.pnl / item.trades).toFixed(2) : 0
    }))
  }, [trades])

  return (
    <div style={{ color: 'white', padding: 40 }}>
      <h1>Ошибки</h1>
      <p>Какие ошибки чаще всего забирают прибыль.</p>

      <table style={{ width: '100%', marginTop: 30, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Ошибка</th>
            <th>Сделок</th>
            <th>PnL</th>
            <th>Loss Rate</th>
            <th>Avg PnL</th>
          </tr>
        </thead>

        <tbody>
          {mistakes.map(item => (
            <tr key={item.mistake}>
              <td>{item.mistake}</td>
              <td>{item.trades}</td>
              <td style={{ color: item.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                {item.pnl}
              </td>
              <td>{item.lossRate}%</td>
              <td>{item.avgPnl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
