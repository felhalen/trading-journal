'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TradesPage() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    symbol: '',
    side: '',
    pnl: '',
    analysis: ''
  })

  async function loadTrades() {
    setLoading(true)

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
      .update({ screenshot_url: publicUrl })
      .eq('id', tradeId)

    if (updateError) {
      alert(updateError.message)
      return
    }

    loadTrades()
  }

  function startEdit(trade) {
    setEditingId(trade.id)
    setEditForm({
      symbol: trade.symbol || '',
      side: trade.side || '',
      pnl: trade.pnl || '',
      analysis: trade.analysis || ''
    })
  }

  async function saveEdit(tradeId) {
    const { error } = await supabase
      .from('trades')
      .update({
        symbol: editForm.symbol,
        side: editForm.side,
        pnl: Number(editForm.pnl),
        analysis: editForm.analysis
      })
      .eq('id', tradeId)

    if (error) {
      alert(error.message)
      return
    }

    setEditingId(null)
    loadTrades()
  }

  async function deleteTrade(tradeId) {
    const confirmed = confirm('Удалить эту сделку?')
    if (!confirmed) return

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId)

    if (error) {
      alert(error.message)
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
            <th>Анализ</th>
            <th>Скрин</th>
            <th>Действие</th>
          </tr>
        </thead>

        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              <td>
                {editingId === trade.id ? (
                  <input
                    value={editForm.symbol}
                    onChange={(e) =>
                      setEditForm({ ...editForm, symbol: e.target.value })
                    }
                  />
                ) : (
                  trade.symbol
                )}
              </td>

              <td>
                {editingId === trade.id ? (
                  <select
                    value={editForm.side}
                    onChange={(e) =>
                      setEditForm({ ...editForm, side: e.target.value })
                    }
                  >
                    <option value="buy">buy</option>
                    <option value="sell">sell</option>
                  </select>
                ) : (
                  trade.side
                )}
              </td>

              <td
                style={{
                  color: Number(trade.pnl) >= 0 ? '#22c55e' : '#ef4444'
                }}
              >
                {editingId === trade.id ? (
                  <input
                    type="number"
                    value={editForm.pnl}
                    onChange={(e) =>
                      setEditForm({ ...editForm, pnl: e.target.value })
                    }
                  />
                ) : (
                  trade.pnl
                )}
              </td>

              <td>
                {editingId === trade.id ? (
                  <textarea
                    value={editForm.analysis}
                    onChange={(e) =>
                      setEditForm({ ...editForm, analysis: e.target.value })
                    }
                    placeholder="Анализ сделки"
                    style={{ width: 220, minHeight: 60 }}
                  />
                ) : (
                  trade.analysis || '-'
                )}
              </td>

              <td>
                {trade.screenshot_url ? (
                  <a
                    href={trade.screenshot_url}
                    target="_blank"
                    style={{ color: '#38bdf8' }}
                  >
                    Открыть скрин
                  </a>
                ) : (
                  '-'
                )}
              </td>

              <td style={{ display: 'flex', gap: 8 }}>
                <label
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  Скрин
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => uploadScreenshot(e, trade.id)}
                  />
                </label>

                {editingId === trade.id ? (
                  <>
                    <button onClick={() => saveEdit(trade.id)}>
                      Сохранить
                    </button>

                    <button onClick={() => setEditingId(null)}>
                      Отмена
                    </button>
                  </>
                ) : (
                  <button onClick={() => startEdit(trade)}>
                    Редактировать
                  </button>
                )}

                <button
                  onClick={() => deleteTrade(trade.id)}
                  style={{ background: '#dc2626', color: 'white' }}
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
