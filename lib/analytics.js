export function calcRR(entry, stopLoss, takeProfit) {
  const risk = Math.abs(Number(entry) - Number(stopLoss))
  const reward = Math.abs(Number(takeProfit) - Number(entry))
  if (!risk) return 0
  return Number((reward / risk).toFixed(2))
}

export function calcPnL(trade) {
  if (trade.pnl !== undefined && trade.pnl !== null) return Number(trade.pnl)
  const entry = Number(trade.entry_price || 0)
  const exit = Number(trade.exit_price || 0)
  const lot = Number(trade.lot || 1)
  const side = trade.side === 'short' ? -1 : 1
  return Number(((exit - entry) * side * lot).toFixed(2))
}

export function buildStats(trades = []) {
  const total = trades.length
  const pnl = trades.reduce((sum, t) => sum + calcPnL(t), 0)
  const wins = trades.filter(t => calcPnL(t) > 0)
  const losses = trades.filter(t => calcPnL(t) < 0)
  const winRate = total ? Math.round((wins.length / total) * 100) : 0
  const grossWin = wins.reduce((s,t)=>s+calcPnL(t),0)
  const grossLoss = Math.abs(losses.reduce((s,t)=>s+calcPnL(t),0))
  const profitFactor = grossLoss ? (grossWin / grossLoss).toFixed(2) : grossWin ? '∞' : '0'
  const avgWin = wins.length ? (grossWin / wins.length).toFixed(2) : '0'
  const avgLoss = losses.length ? (grossLoss / losses.length).toFixed(2) : '0'

  let equity = 0
  const equityCurve = trades.map((t, i) => {
    equity += calcPnL(t)
    return { name: `${i + 1}`, equity }
  })

  return { total, pnl: pnl.toFixed(2), wins: wins.length, winRate, profitFactor, avgWin, avgLoss, equityCurve }
}
