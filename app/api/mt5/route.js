import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  try {
    const body = await req.json()

    if (body.secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Wrong secret' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const trade = {
      symbol: body.symbol || 'UNKNOWN',
      side: String(body.type || body.side || 'unknown').toLowerCase(),
      entry_price: Number(body.open_price || body.entry || 0),
      exit_price: Number(body.close_price || body.exit || 0),
      pnl: Number(body.profit || body.pnl || 0),
      commission: Number(body.commission || 0),
      swap: Number(body.swap || 0),
      status: body.status || 'closed',
      notes: body.comment || `MT5 ticket: ${body.ticket || ''}`
    }

    const { data, error } = await supabase
      .from('trades')
      .insert(trade)
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
