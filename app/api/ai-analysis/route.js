import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const trade = body.trade || {}

    const pnl = Number(trade.pnl || 0)
    const entry = Number(trade.entry_price || 0)
    const sl = Number(trade.stop_loss || 0)
    const tp = Number(trade.take_profit || 0)
    const rr = Number(trade.rr || 0)

    const issues = []
    const recommendations = []

    if (!sl || sl === 0) {
      issues.push('Не указан Stop Loss.')
      recommendations.push('Всегда фиксируй SL до входа в сделку.')
    }

    if (!tp || tp === 0) {
      issues.push('Не указан Take Profit.')
      recommendations.push('Добавляй TP, чтобы понимать ожидаемое соотношение риска к прибыли.')
    }

    if (!trade.setup || trade.setup === '-') {
      issues.push('Не указан сетап.')
      recommendations.push('Записывай сетап: Breakout, Reversal, SMC, Liquidity Sweep и т.д.')
    }

    if (!trade.emotion_before || trade.emotion_before === '-') {
      issues.push('Не указана эмоция перед входом.')
      recommendations.push('Фиксируй эмоцию до сделки: спокойно, FOMO, злость, уверенность.')
    }

    if (pnl < 0 && (!trade.mistake || trade.mistake === '-')) {
      issues.push('Убыточная сделка без указанной ошибки.')
      recommendations.push('После каждой убыточной сделки записывай причину: ранний вход, поздний выход, FOMO, revenge trade.')
    }

    if (rr > 0 && rr < 1) {
      issues.push('RR ниже 1.')
      recommendations.push('Старайся брать сделки хотя бы с RR 1.5–2+, если стратегия это позволяет.')
    }

    if (pnl > 0 && issues.length === 0) {
      recommendations.push('Сделка выглядит дисциплинированно. Продолжай собирать статистику по этому сетапу.')
    }

    const score = Math.max(20, 100 - issues.length * 15)

    return NextResponse.json({
      score,
      summary: issues.length
        ? 'В сделке есть моменты, которые стоит улучшить.'
        : 'Сделка заполнена хорошо.',
      issues,
      recommendations
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'AI analysis endpoint works. Use POST.' })
}
