'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TradesPage() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadTrades() {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setTrades(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadTrades()
  }, [])

  return (
    <div style={{ color: 'white', padding: 40 }}>
      <h1>Все сделки</h1>

      {loading && <p>Загрузка...</p>}

      <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Символ</th>
            <th>Сторона</th>
            <th>Entry</th>
            <th>SL</th>
            <th>TP</th>
            <th>PnL</th>
            <th>RR</th>
            <th>Сетап</th>
            <th>Ошибка</th>
            <th>Эмоция</th>
          </tr>
        </thead>

        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              <td>{trade.symbol}</td>
              <td>{trade.side}</td>
              <td>{trade.entry_price}</td>
              <td>{trade.stop_loss}</td>
              <td>{trade.take_profit}</td>
              <td style={{ color: Number(trade.pnl) >= 0 ? '#22c55e' : '#ef4444' }}>
                {trade.pnl}
              </td>
              <td>{trade.rr}</td>
              <td>{trade.setup}</td>
              <td>{trade.mistake || '-'}</td>
              <td>{trade.emotion_before || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
