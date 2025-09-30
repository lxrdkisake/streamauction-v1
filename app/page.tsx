'use client'

import { useEffect } from 'react'
import useAuctionStore from '@/store/auction'
import { AuctionParamsPanel } from '@/components/auction/AuctionParamsPanel'
import { LibraryGrid } from '@/components/library/LibraryGrid'
import { SidebarList } from '@/components/auction/SidebarList'
import { CardsMode } from '@/components/auction/CardsMode'
import { RouletteMode } from '@/components/auction/RouletteMode'
import { AddDonationModal } from '@/components/common/AddDonationModal'
import { WinnerOverlay } from '@/components/common/WinnerOverlay'
import { Button } from '@/components/ui/button'
import { Play, Square } from 'lucide-react'

export default function HomePage() {
  const { 
    lots, 
    mode, 
    ui,
    start,
    stop,
    resetAll
  } = useAuctionStore()

  const lotsList = Object.values(lots)
  const isAuctionRunning = ui.winner !== null || ui.showWinner
  const canStartAuction = lotsList.length >= 2 && !isAuctionRunning

  // Auto-restore timer state
  useEffect(() => {
    const { timer, setTimer, startTimer } = useAuctionStore.getState()
    
    if (timer.running && timer.endsAt) {
      const now = Date.now()
      const leftMs = Math.max(0, timer.endsAt - now)
      
      if (leftMs > 0) {
        const totalSeconds = Math.ceil(leftMs / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        
        setTimer(hours, minutes, seconds)
        startTimer()
      }
    }
  }, [])

  // Auto-tick timer
  useEffect(() => {
    const { timer, tick } = useAuctionStore.getState()
    
    if (!timer.running) return
    
    const interval = setInterval(() => {
      tick()
    }, 100)
    
    return () => clearInterval(interval)
  }, [])

  const handleStartAuction = () => {
    if (canStartAuction) {
      start(mode)
    }
  }

  const handleStopAuction = () => {
    stop()
  }

  return (
    <div className="min-h-screen">
      <div className="container-custom py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-6rem)]">
          {/* Left Sidebar - Timer & Settings */}
          <div className="lg:col-span-3 space-y-6">
            <AuctionParamsPanel />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-6">
            {!isAuctionRunning ? (
              <>
                {/* Library */}
                <LibraryGrid />
                
                {/* Start Auction Button */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={handleStartAuction}
                    disabled={!canStartAuction}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Начать аукцион
                  </Button>
                  
                  {lotsList.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={resetAll}
                      size="lg"
                    >
                      Сбросить всё
                    </Button>
                  )}
                </div>
                
                {/* Minimum lots warning */}
                {lotsList.length > 0 && lotsList.length < 2 && (
                  <div className="text-center text-yellow-400 text-sm">
                    Добавьте минимум 2 лота для начала аукциона
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Auction Mode Display */}
                {mode === 'cards' ? <CardsMode /> : <RouletteMode />}
                
                {/* Stop Auction Button */}
                <div className="flex items-center justify-center">
                  <Button
                    onClick={handleStopAuction}
                    variant="destructive"
                    size="lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Остановить аукцион
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Lots List */}
          <div className="lg:col-span-3">
            <div className="sticky top-6 h-[calc(100vh-6rem)]">
              <SidebarList />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDonationModal />
      <WinnerOverlay />
    </div>
  )
}