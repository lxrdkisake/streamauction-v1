import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppHeader } from '@/components/layout/AppHeader';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'StreamAuction 2.0 - Интерактивные аукционы контента',
  description: 'Профессиональная платформа для проведения интерактивных аукционов игр и фильмов',
  keywords: 'аукцион, игры, фильмы, стрим, интерактив',
  authors: [{ name: 'StreamAuction Team' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#8A2BE2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
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