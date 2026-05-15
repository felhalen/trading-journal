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

  async function uploadScreenshot(event, tradeId) {
    const file = event.target.files?.[0]

    if (!file) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${tradeId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('trade-screenshots')
      .upload(fileName, file)

    if (uploadError) {
      alert(uploadError.message)
      return
    }

    const {
      data: { publicUrl }
    } = supabase.storage
      .from('trade-screenshots')
      .getPublicUrl(fileName)

    const { error: updateError } = await supabase
      .from('trades')
      .update({
        screenshot_url: publicUrl
      })
      .eq('id', tradeId)

    if (updateError) {
      alert(updateError.message)
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

      <table
        style={{
          width: '100%',
          marginTop: 20,
          borderCollapse: 'collapse',
          fontSize: 13
        }}
      >
        <thead>
          <tr>
            <th>Символ</th>
            <th>Сторона</th>
            <th>PnL</th>
            <th>Скрин</th>
            <th>Действие</th>
          </tr>
        </thead>

        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              <td>{trade.symbol}</td>

              <td>{trade.side}</td>

              <td
                style={{
                  color:
                    Number(trade.pnl) >= 0
                      ? '#22c55e'
                      : '#ef4444'
                }}
              >
                {trade.pnl}
              </td>

              <td>
                {trade.screenshot_url ? (
                  <a
                    href={trade.screenshot_url}
                    target="_blank"
                    style={{
                      color: '#38bdf8'
                    }}
                  >
                    Открыть скрин
                  </a>
                ) : (
                  '-'
                )}
              </td>

              <td>
                <label
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}
                >
                  Загрузить скрин

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      uploadScreenshot(e, trade.id)
                    }
                  />
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
