'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SetupsPage() {
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

  const setups = useMemo(() => {
    const result = {}

    trades.forEach(trade => {
      const name = trade.setup || 'Без сетапа'

      if (!result[name]) {
        result[name] = {
          setup: name,
          trades: 0,
          pnl: 0,
          wins: 0
        }
      }

      result[name].trades += 1
      result[name].pnl += Number(trade.pnl || 0)

      if (Number(trade.pnl || 0) > 0) {
        result[name].wins += 1
      }
    })

    return Object.values(result).map(item => ({
      ...item,
      winRate: item.trades ? Math.round((item.wins / item.trades) * 100) : 0,
      avgPnl: item.trades ? (item.pnl / item.trades).toFixed(2) : 0
    }))
  }, [trades])

  return (
    <div style={{ color: 'white', padding: 40 }}>
      <h1>Сетапы</h1>
      <p>Статистика по торговым сетапам.</p>

      <table style={{ width: '100%', marginTop: 30, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Сетап</th>
            <th>Сделок</th>
            <th>PnL</th>
            <th>Win Rate</th>
            <th>Avg PnL</th>
          </tr>
        </thead>

        <tbody>
          {setups.map(item => (
            <tr key={item.setup}>
              <td>{item.setup}</td>
              <td>{item.trades}</td>
              <td style={{ color: item.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                {item.pnl}
              </td>
              <td>{item.winRate}%</td>
              <td>{item.avgPnl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
