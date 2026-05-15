import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  if (process.env.WEBHOOK_SECRET && body.secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Wrong secret' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: 'demo', received: body })
  }

  const trade = {
    source: 'tradingview',
    symbol: body.symbol || body.ticker,
    side: String(body.side || body.action || '').toLowerCase(),
    entry_price: Number(body.entry || body.price || 0),
    stop_loss: Number(body.sl || 0),
    take_profit: Number(body.tp || 0),
    notes: body.notes || 'TradingView webhook',
    status: body.status || 'open',
    opened_at: body.time || new Date().toISOString()
  }

  const { error } = await supabase.from('trades').insert(trade)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, trade })
}
