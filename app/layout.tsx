import './globals.css';
import type { Metadata } from 'next';
import { AppHeader } from '@/components/layout/AppHeader';

export const metadata: Metadata = {
  title: 'StreamAuction 2.0 - Интерактивные аукционы контента',
  description: 'Профессиональная платформа для проведения интерактивных аукционов игр и фильмов',
  keywords: 'аукцион, игры, фильмы, стрим, интерактив',
  authors: [{ name: 'StreamAuction Team' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#8A2BE2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh font-sans antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="min-h-screen bg-background">
          <AppHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}