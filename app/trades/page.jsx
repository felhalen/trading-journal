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

  async function deleteTrade(id) {
    const confirmDelete = window.confirm('Удалить эту сделку?')

    if (!confirmDelete) return

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Ошибка удаления: ' + error.message)
      return
    }

    loadTrades()
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
            <th>Источник</th>
            <th>Ticket</th>
            <th>Символ</th>
            <th>Сторона</th>
            <th>Lot</th>
            <th>Entry</th>
            <th>Exit</th>
            <th>SL</th>
            <th>TP</th>
            <th>PnL</th>
            <th>Комиссия</th>
            <th>Swap</th>
            <th>RR</th>
            <th>Сетап</th>
            <th>Ошибка</th>
            <th>Эмоция</th>
            <th>Действие</th>
          </tr>
        </thead>

        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              <td>{trade.source || 'manual'}</td>
              <td>{trade.mt5_ticket || '-'}</td>
              <td>{trade.symbol}</td>
              <td>{trade.side}</td>
              <td>{trade.lot || '-'}</td>
              <td>{trade.entry_price}</td>
              <td>{trade.exit_price || '-'}</td>
              <td>{trade.stop_loss || '-'}</td>
              <td>{trade.take_profit || '-'}</td>
              <td style={{ color: Number(trade.pnl) >= 0 ? '#22c55e' : '#ef4444' }}>
                {trade.pnl}
              </td>
              <td>{trade.commission || 0}</td>
              <td>{trade.swap || 0}</td>
              <td>{trade.rr || '-'}</td>
              <td>{trade.setup || '-'}</td>
              <td>{trade.mistake || '-'}</td>
              <td>{trade.emotion_before || '-'}</td>
              <td>
                <button
                  onClick={() => deleteTrade(trade.id)}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
