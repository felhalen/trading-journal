import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const trade = body.trade || {}

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured in Vercel' },
        { status: 500 }
      )
    }

    const prompt = `
Ты профессиональный SMC / Smart Money Concepts трейдинг-коуч.

Проанализируй сделку строго по методике Smart Money Concepts.

Проверь:
1. Был ли общий тренд / bias понятен.
2. Была ли ликвидность перед входом.
3. Был ли sweep / снятие ликвидности.
4. Был ли BOS или CHoCH.
5. Был ли вход от OB / FVG / Imbalance / Mitigation.
6. Был ли вход слишком ранним.
7. Был ли SL логично спрятан за liquidity / swing.
8. Был ли TP направлен к ближайшей ликвидности.
9. Был ли RR оправдан.
10. Была ли сделка дисциплинированной.

Данные сделки:
- Источник: ${trade.source}
- Ticket: ${trade.mt5_ticket}
- Символ: ${trade.symbol}
- Сторона: ${trade.side}
- Lot: ${trade.lot}
- Entry: ${trade.entry_price}
- Exit: ${trade.exit_price}
- Stop Loss: ${trade.stop_loss}
- Take Profit: ${trade.take_profit}
- PnL: ${trade.pnl}
- RR: ${trade.rr}
- Сетап: ${trade.setup}
- Ошибка: ${trade.mistake}
- Эмоция до входа: ${trade.emotion_before}
- Notes: ${trade.notes}

Важно:
Если данных недостаточно для полноценного SMC-анализа, не выдумывай.
Чётко напиши, каких данных не хватает:
- скриншот графика
- HTF bias
- POI
- зона ликвидности
- BOS / CHoCH
- OB / FVG
- время входа
- сессия
- причина входа

Дай ответ строго в JSON формате без markdown:
{
  "score": число от 0 до 100,
  "summary": "короткий вывод по сделке",
  "smc_bias": "оценка bias / направления",
  "liquidity": "оценка ликвидности",
  "structure": "оценка BOS / CHoCH / структуры",
  "entry_quality": "качество входа",
  "sl_tp_logic": "логика SL и TP",
  "psychology": "оценка психологии сделки",
  "missing_data": ["каких данных не хватает"],
  "issues": ["ошибка 1", "ошибка 2"],
  "recommendations": ["совет 1", "совет 2"],
  "coach_comment": "жесткий, но полезный комментарий SMC-коуча"
}
`

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error?.message || 'OpenAI API error' },
        { status: 500 }
      )
    }

    const text =
      result.output_text ||
      result.output?.[0]?.content?.[0]?.text ||
      ''

    let parsed

    try {
      const first = text.indexOf('{')
      const last = text.lastIndexOf('}')
      parsed = JSON.parse(text.slice(first, last + 1))
    } catch {
      parsed = {
        score: 50,
        summary: text || 'Не удалось разобрать ответ AI.',
        smc_bias: 'Недостаточно данных.',
        liquidity: 'Недостаточно данных.',
        structure: 'Недостаточно данных.',
        entry_quality: 'Недостаточно данных.',
        sl_tp_logic: 'Недостаточно данных.',
        psychology: 'Недостаточно данных.',
        missing_data: [
          'скриншот графика',
          'HTF bias',
          'POI',
          'ликвидность',
          'BOS / CHoCH'
        ],
        issues: [],
        recommendations: [],
        coach_comment: text || 'Добавь больше контекста по сделке.'
      }
    }

    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'SMC AI analysis endpoint works. Use POST.' })
}
