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
    source: 'mt5',
    mt5_ticket: String(body.ticket || ''),
    symbol: body.symbol,
    side: String(body.type || body.side || '').toLowerCase(),
    lot: Number(body.lot || body.volume || 0),
    entry_price: Number(body.open_price || body.entry || 0),
    exit_price: Number(body.close_price || body.exit || 0),
    pnl: Number(body.profit || body.pnl || 0),
    commission: Number(body.commission || 0),
    swap: Number(body.swap || 0),
    status: body.status || 'closed',
    opened_at: body.open_time || new Date().toISOString(),
    closed_at: body.close_time || null,
    notes: body.comment || ''
  }

  const { error } = await supabase.from('trades').upsert(trade, { onConflict: 'mt5_ticket' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, trade })
}
