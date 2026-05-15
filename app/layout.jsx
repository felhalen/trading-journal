import './globals.css'

export const metadata = {
  title: 'Trading Journal Pro',
  description: 'Trading journal with MT5, TradingView, Supabase and analytics'
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
