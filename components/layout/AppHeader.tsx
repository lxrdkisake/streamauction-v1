'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Library, 
  Zap, 
  History, 
  MessageSquare,
  Timer
} from 'lucide-react'
import useAuctionStore, { useTimerState } from '@/store/auction'
import { getStatusLabel, getStatusVariant, type AuctionStatus } from '@/lib/fsm/auction'

export function AppHeader() {
  const pathname = usePathname()
  const { currentAuction } = useAuctionStore()
  const { timeLeft, timerActive } = useTimerState()
  
  const navigation = [
    {
      name: 'Подготовка',
      href: '/',
      icon: Play,
      current: pathname === '/'
    },
    {
      name: 'Библиотека',
      href: '/library',
      icon: Library,
      current: pathname === '/library'
    },
    {
      name: 'Аукцион',
      href: '/auction',
      icon: Zap,
      current: pathname === '/auction'
    },
    {
      name: 'История',
      href: '/history',
      icon: History,
      current: pathname === '/history'
    }
  ]

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-600 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 font-bold text-xl text-white hover:text-purple-400 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span>StreamAuction</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.current ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "tab-standard",
                      item.current && "bg-purple-600 text-white",
                      !item.current && "text-gray-300 hover:text-white hover:bg-gray-800"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Status and Actions */}
          <div className="flex items-center space-x-4">
            {/* Mini Timer */}
            {timerActive && timeLeft > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Timer className="w-4 h-4" />
                <span className="timer-display font-mono">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            
            {/* Auction Status */}
            {currentAuction && (
              <Badge
                variant={getStatusVariant(currentAuction.status as AuctionStatus)}
                className="font-medium"
              >
                {getStatusLabel(currentAuction.status as AuctionStatus)}
              </Badge>
            )}
            
            {/* Feedback */}
            <Link href="/feedback">
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "tab-standard",
                  pathname === '/feedback' && "bg-purple-600 text-white",
                  pathname !== '/feedback' && "text-gray-300 hover:text-white hover:bg-gray-800"
                )}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}