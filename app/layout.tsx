import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StreamAuction - Интерактивные аукционы',
  description: 'Платформа для проведения интерактивных аукционов игр и фильмов',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="dark">
      <body>
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  )
}