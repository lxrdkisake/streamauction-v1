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
import useAuctionStore from '@/store/auction'
import { getStatusLabel, getStatusVariant } from '@/lib/fsm/auction'

export function AppHeader() {
  const pathname = usePathname()
  const { currentAuction, timeLeft, timerActive } = useAuctionStore()
  
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 font-bold text-xl hover:text-primary transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
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
                      item.current && "bg-primary text-primary-foreground"
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
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span className="timer-display font-mono">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            
            {/* Auction Status */}
            {currentAuction && (
              <Badge 
                variant={getStatusVariant(currentAuction.status)}
                className="font-medium"
              >
                {getStatusLabel(currentAuction.status)}
              </Badge>
            )}
            
            {/* Feedback */}
            <Link href="/feedback">
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "tab-standard",
                  pathname === '/feedback' && "bg-primary text-primary-foreground"
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