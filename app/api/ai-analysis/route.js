import { NextResponse } from 'next/server'

export async function POST(req) {
  const body = await req.json().catch(() => ({}))
  const trade = body.trade || {}

  // Тут можно подключить OpenAI API. Пока возвращаем встроенный анализ.
  const issues = []
  if (!trade.stop_loss) issues.push('Не указан Stop Loss — риск сделки не контролируется.')
  if (!trade.take_profit) issues.push('Не указан Take Profit — сложно посчитать RR.')
  if (Number(trade.pnl) < 0 && !trade.mistake) issues.push('Убыточная сделка без отмеченной ошибки.')
  if (!trade.setup) issues.push('Не указан сетап — статистика по стратегиям будет неполной.')

  return NextResponse.json({
    score: Math.max(20, 100 - issues.length * 18),
    summary: issues.length ? 'Есть моменты для улучшения дисциплины.' : 'Сделка заполнена хорошо.',
    issues,
    recommendations: [
      'Всегда фиксируй причину входа.',
      'Добавляй скриншот до и после сделки.',
      'Записывай эмоции до входа и после закрытия.',
      'Не оценивай сделку только по прибыли — оцени исполнение плана.'
    ]
  })
}
