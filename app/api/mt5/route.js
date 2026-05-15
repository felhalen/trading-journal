import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  try {
    let raw = await req.text()

    raw = raw.replace(/\0/g, '').trim()

    const first = raw.indexOf('{')
    const last = raw.lastIndexOf('}')

    if (first === -1 || last === -1) {
      return NextResponse.json({ error: 'Invalid JSON body', raw }, { status: 400 })
    }

    raw = raw.slice(first, last + 1)

    const body = JSON.parse(raw)

    if (body.secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Wrong secret' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const trade = {
      source: 'mt5',
      mt5_ticket: String(body.ticket || ''),
      symbol: body.symbol || 'UNKNOWN',
      side: String(body.type || body.side || 'unknown').toLowerCase(),
      entry_price: Number(body.open_price || body.entry || 0),
      exit_price: Number(body.close_price || body.exit || 0),
      pnl: Number(body.profit || body.pnl || 0),
      commission: Number(body.commission || 0),
      swap: Number(body.swap || 0),
      status: body.status || 'closed',
      setup: 'MT5',
      notes: body.comment || 'MT5 trade'
    }

    const { data, error } = await supabase
      .from('trades')
      .upsert(trade, { onConflict: 'mt5_ticket' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, trade: data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'MT5 webhook works. Use POST.' })
}
