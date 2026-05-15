'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TradesPage() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [analysis, setAnalysis] = useState(null)

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
      .update({ screenshot_url: publicUrl })
      .eq('id', tradeId)

    if (updateError) {
      alert(updateError.message)
      return
    }

    loadTrades()
  }

  async function deleteTrade(id) {
    if (!window.confirm('Удалить эту сделку?')) return

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

  async function analyzeTrade(trade) {
    setAnalysis({ loading: true, trade, result: null })

    const res = await fetch('/api/ai-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trade })
    })

    const data = await res.json()

    setAnalysis({
      loading: false,
      trade,
      result: data
    })
  }

  function startEdit(trade) {
    setEditingId(trade.id)
    setEditData({
      stop_loss: trade.stop_loss || '',
      take_profit: trade.take_profit || '',
      rr: trade.rr || '',
      setup: trade.setup || '',
      mistake: trade.mistake || '',
      emotion_before: trade.emotion_before || '',
      notes: trade.notes || ''
    })
  }

  async function saveEdit(id) {
    const { error } = await supabase
      .from('trades')
      .update({
        stop_loss: Number(editData.stop_loss || 0),
        take_profit: Number(editData.take_profit || 0),
        rr: Number(editData.rr || 0),
        setup: editData.setup,
        mistake: editData.mistake,
        emotion_before: editData.emotion_before,
        notes: editData.notes
      })
      .eq('id', id)

    if (error) {
      alert('Ошибка сохранения: ' + error.message)
      return
    }

    setEditingId(null)
    setEditData({})
    loadTrades()
  }

  useEffect(() => {
    loadTrades()
  }, [])

  return (
    <div style={{ color: 'white', padding: 40 }}>
      <h1>Все сделки</h1>

      {analysis && (
        <div style={analysisBox}>
          <button onClick={() => setAnalysis(null)} style={closeBtn}>×</button>

          <h2>AI-анализ сделки</h2>

          {analysis.loading ? (
            <p>Анализирую сделку...</p>
          ) : (
            <>
              <p><b>Сделка:</b> {analysis.trade.symbol} / {analysis.trade.side} / PnL: {analysis.trade.pnl}</p>
              <p><b>Оценка:</b> {analysis.result.score}/100</p>
              <p><b>Вывод:</b> {analysis.result.summary}</p>

              <h3>SMC Bias</h3>
              <p>{analysis.result.smc_bias || '-'}</p>

              <h3>Ликвидность</h3>
              <p>{analysis.result.liquidity || '-'}</p>

              <h3>Структура</h3>
              <p>{analysis.result.structure || '-'}</p>

              <h3>Качество входа</h3>
              <p>{analysis.result.entry_quality || '-'}</p>

              <h3>SL / TP логика</h3>
              <p>{analysis.result.sl_tp_logic || '-'}</p>

              <h3>Проблемы</h3>
              {analysis.result.issues?.length ? (
                <ul>
                  {analysis.result.issues.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>Критичных проблем не найдено.</p>
              )}

              <h3>Рекомендации</h3>
              {analysis.result.recommendations?.length ? (
                <ul>
                  {analysis.result.recommendations.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>Рекомендаций нет.</p>
              )}

              <h3>Комментарий коуча</h3>
              <p>{analysis.result.coach_comment || '-'}</p>
            </>
          )}
        </div>
      )}

      {loading && <p>Загрузка...</p>}

      <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse', fontSize: 13 }}>
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
            <th>RR</th>
            <th>Сетап</th>
            <th>Ошибка</th>
            <th>Эмоция</th>
            <th>Скрин</th>
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

              <td>
                {editingId === trade.id ? (
                  <input
                    value={editData.stop_loss}
                    onChange={(e) => setEditData({ ...editData, stop_loss: e.target.value })}
                    style={inputStyle}
                  />
                ) : (
                  trade.stop_loss || '-'
                )}
              </td>

              <td>
                {editingId === trade.id ? (
                  <input
                    value={editData.take_profit}
                    onChange={(e) => setEditData({ ...editData, take_profit: e.target.value })}
                    style={inputStyle}
                  />
                ) : (
                  trade.take_profit || '-'
                )}
              </td>

              <td style={{ color: Number(trade.pnl) >= 0 ? '#22c55e' : '#ef4444' }}>
                {trade.pnl}
              </td>

              <td>
                {editingId === trade.id ? (
                  <input
                    value={editData.rr}
                    onChange={(e) => setEditData({ ...editData, rr: e.target.value })}
                    style={inputStyle}
                  />
                ) : (
                  trade.rr || '-'
                )}
              </td>

              <td>
                {editingId === trade.id ? (
                  <input
                    value={editData.setup}
                    onChange={(e) => setEditData({ ...editData, setup: e.target.value })}
                    style={inputStyle}
                  />
                ) : (
                  trade.setup || '-'
                )}
              </td>

              <td>
                {editingId === trade.id ? (
                  <input
                    value={editData.mistake}
                    onChange={(e) => setEditData({ ...editData, mistake: e.target.value })}
                    style={inputStyle}
                  />
                ) : (
                  trade.mistake || '-'
                )}
              </td>

              <td>
                {editingId === trade.id ? (
                  <input
                    value={editData.emotion_before}
                    onChange={(e) => setEditData({ ...editData, emotion_before: e.target.value })}
                    style={inputStyle}
                  />
                ) : (
                  trade.emotion_before || '-'
                )}
              </td>

              <td>
                {trade.screenshot_url ? (
                  <a href={trade.screenshot_url} target="_blank" style={{ color: '#38bdf8' }}>
                    Открыть
                  </a>
                ) : (
                  '-'
                )}
              </td>

              <td>
                {editingId === trade.id ? (
                  <>
                    <button onClick={() => saveEdit(trade.id)} style={saveBtn}>Сохранить</button>
                    <button onClick={() => setEditingId(null)} style={cancelBtn}>Отмена</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => analyzeTrade(trade)} style={analysisBtn}>Анализ</button>
                    <button onClick={() => startEdit(trade)} style={editBtn}>Редактировать</button>

                    <label style={uploadBtn}>
                      Скрин
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => uploadScreenshot(e, trade.id)}
                      />
                    </label>

                    <button onClick={() => deleteTrade(trade.id)} style={deleteBtn}>Удалить</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const inputStyle = {
  width: 90,
  background: '#0f172a',
  color: 'white',
  border: '1px solid #334155',
  borderRadius: 6,
  padding: 6
}

const analysisBox = {
  position: 'fixed',
  top: 80,
  right: 40,
  width: 460,
  maxHeight: '75vh',
  overflowY: 'auto',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 16,
  padding: 24,
  zIndex: 1000,
  boxShadow: '0 20px 60px rgba(0,0,0,.4)'
}

const closeBtn = {
  position: 'absolute',
  top: 12,
  right: 16,
  background: 'transparent',
  color: 'white',
  border: 'none',
  fontSize: 24,
  cursor: 'pointer'
}

const analysisBtn = {
  background: '#0ea5e9',
  color: 'white',
  border: 'none',
  padding: '7px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  marginRight: 6
}

const editBtn = {
  background: '#7c3aed',
  color: 'white',
  border: 'none',
  padding: '7px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  marginRight: 6
}

const uploadBtn = {
  background: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '7px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  marginRight: 6,
  display: 'inline-block'
}

const deleteBtn = {
  background: '#dc2626',
  color: 'white',
  border: 'none',
  padding: '7px 10px',
  borderRadius: 8,
  cursor: 'pointer'
}

const saveBtn = {
  background: '#16a34a',
  color: 'white',
  border: 'none',
  padding: '7px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  marginRight: 6
}

const cancelBtn = {
  background: '#475569',
  color: 'white',
  border: 'none',
  padding: '7px 10px',
  borderRadius: 8,
  cursor: 'pointer'
}
