'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function EquityPage() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadTrades() {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error) setTrades(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadTrades()
  }, [])

  const equityData = useMemo(() => {
    let equity = 0

    return trades.map((trade, index) => {
      equity += Number(trade.pnl || 0)

      return {
        name: `#${index + 1}`,
        equity
      }
    })
  }, [trades])

  return (
    <div style={{ color: 'white', padding: 40 }}>
      <h1>Equity Curve</h1>
      <p>График роста/просадки депозита по сделкам.</p>

      {loading && <p>Загрузка...</p>}

      <div style={{
        height: 420,
        marginTop: 30,
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 16,
        padding: 20
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={equityData}>
            <XAxis dataKey="name" stroke="#cbd5e1" />
            <YAxis stroke="#cbd5e1" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#8b5cf6"
              fill="#7c3aed55"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
