'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TradesPage() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [aiLoadingId, setAiLoadingId] = useState(null)

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

  function startEdit(trade) {
    setEditingId(trade.id)
    setEditForm({
      symbol: trade.symbol || '',
      side: trade.side || '',
      pnl: trade.pnl ?? '',
      analysis: trade.analysis || ''
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(tradeId) {
    const { error } = await supabase
      .from('trades')
      .update({
        symbol: editForm.symbol,
        side: editForm.side,
        pnl: editForm.pnl === '' ? null : Number(editForm.pnl),
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

  async function analyzeTrade(trade) {
    setAiLoadingId(trade.id)

    const text = `
Сделай короткий анализ трейдерской сделки:

Символ: ${trade.symbol}
Сторона: ${trade.side}
PnL: ${trade.pnl}

Напиши:
1. Что можно улучшить
2. Возможная ошибка
3. Короткий вывод
`

    const { data, error } = await supabase.functions.invoke('analyze-trade', {
      body: { text }
    })

    if (error) {
      alert(error.message)
      setAiLoadingId(null)
      return
    }

    const aiText = data?.analysis || data?.text || data?.result || ''

    const { error: updateError } = await supabase
      .from('trades')
      .update({ analysis: aiText })
      .eq('id', trade.id)

    if (updateError) {
      alert(updateError.message)
      setAiLoadingId(null)
      return
    }

    setAiLoadingId(null)
    loadTrades()
  }

  useEffect(() => {
    loadTrades()
  }, [])

  const inputStyle = {
    background: '#171b26',
    color: 'white',
    border: '1px solid #2b3242',
    borderRadius: 8,
    padding: '10px 12px',
    width: '100%'
  }

  const buttonStyle = {
    color: 'white',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #374151',
    cursor: 'pointer',
    fontWeight: 700
  }

  return (
    <div style={{ color: 'white', padding: 24 }}>
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
          <tr style={{ color: '#a9c0e8', textAlign: 'left' }}>
            <th style={{ padding: 12 }}>Символ</th>
            <th style={{ padding: 12 }}>Сторона</th>
            <th style={{ padding: 12 }}>PnL</th>
            <th style={{ padding: 12 }}>Анализ</th>
            <th style={{ padding: 12 }}>Скрин</th>
            <th style={{ padding: 12 }}>Действие</th>
          </tr>
        </thead>

        <tbody>
          {trades.map((trade) => {
            const isEditing = editingId === trade.id

            return (
              <tr
                key={trade.id}
                style={{ borderTop: '1px solid #1f2937' }}
              >
                <td style={{ padding: 12 }}>
                  {isEditing ? (
                    <input
                      style={inputStyle}
                      value={editForm.symbol}
                      onChange={(e) =>
                        setEditForm({ ...editForm, symbol: e.target.value })
                      }
                    />
                  ) : (
                    trade.symbol
                  )}
                </td>

                <td style={{ padding: 12 }}>
                  {isEditing ? (
                    <select
                      style={inputStyle}
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
                    padding: 12,
                    color: Number(trade.pnl) >= 0 ? '#22c55e' : '#ef4444'
                  }}
                >
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      style={inputStyle}
                      value={editForm.pnl}
                      onChange={(e) =>
                        setEditForm({ ...editForm, pnl: e.target.value })
                      }
                    />
                  ) : (
                    trade.pnl
                  )}
                </td>

                <td style={{ padding: 12, maxWidth: 300 }}>
                  {isEditing ? (
                    <textarea
                      style={{
                        ...inputStyle,
                        minHeight: 70,
                        resize: 'vertical'
                      }}
                      placeholder="Анализ сделки"
                      value={editForm.analysis}
                      onChange={(e) =>
                        setEditForm({ ...editForm, analysis: e.target.value })
                      }
                    />
                  ) : (
                    trade.analysis || '-'
                  )}
                </td>

                <td style={{ padding: 12 }}>
                  {trade.screenshot_url ? (
                    <a
                      href={trade.screenshot_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#38bdf8' }}
                    >
                      Открыть скрин
                    </a>
                  ) : (
                    '-'
                  )}
                </td>

                <td style={{ padding: 12 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <label
                      style={{
                        ...buttonStyle,
                        background: '#2563eb'
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

                    <button
                      onClick={() => analyzeTrade(trade)}
                      disabled={aiLoadingId === trade.id}
                      style={{
                        ...buttonStyle,
                        background: '#7c3aed'
                      }}
                    >
                      {aiLoadingId === trade.id ? 'Анализ...' : 'AI анализ'}
                    </button>

                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(trade.id)}
                          style={{
                            ...buttonStyle,
                            background: '#16a34a'
                          }}
                        >
                          Сохранить
                        </button>

                        <button
                          onClick={cancelEdit}
                          style={{
                            ...buttonStyle,
                            background: '#374151'
                          }}
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(trade)}
                        style={{
                          ...buttonStyle,
                          background: '#1f2937'
                        }}
                      >
                        Редактировать
                      </button>
                    )}

                    <button
                      onClick={() => deleteTrade(trade.id)}
                      style={{
                        ...buttonStyle,
                        background: '#dc2626'
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
