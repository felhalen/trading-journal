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
      symbol: body.symbol || body.ticker || 'UNKNOWN',
      side: String(body.side || 'long').toLowerCase(),
      entry_price: Number(body.entry || body.price || body.close || 0),
      stop_loss: Number(body.sl || 0),
      take_profit: Number(body.tp || 0),
      pnl: Number(body.pnl || 0),
      setup: body.setup || 'TradingView',
      mistake: body.mistake || '',
      emotion_before: body.emotion_before || '',
      notes: body.notes || 'TradingView webhook'
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
  return NextResponse.json({ message: 'TradingView webhook works. Use POST.' })
}
