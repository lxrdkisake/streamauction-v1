'use client'

import { useEffect } from 'react'
import { AuctionControlPanel } from '@/components/auction/AuctionControlPanel'
import { LotsListSection } from '@/components/auction/LotsListSection'
import LibrarySection from '@/components/library/LibrarySection'
import { CardsMode } from '@/components/auction/CardsMode'
import RouletteMode from '@/components/auction/RouletteMode'
import { WinnerOverlay } from '@/components/common/WinnerOverlay'
import useAuctionStore from '@/store/auction'

export default function AuctionPage() {
  const { currentAuction, fetchCurrentAuction } = useAuctionStore()
  
  useEffect(() => {
    fetchCurrentAuction()
  }, [fetchCurrentAuction])
  
  const isAuctionRunning = currentAuction?.status === 'running'
  const auctionMode = currentAuction?.mode || 'cards'

  return (
    <div className="container-custom py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Управление аукционом</h1>
          <p className="text-muted-foreground">
            Настройка, запуск и управление интерактивными аукционами
          </p>
        </div>

        {!isAuctionRunning ? (
          /* Setup Mode */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Control Panel */}
            <div className="lg:col-span-1">
              <AuctionControlPanel />
            </div>

            {/* Right Columns - Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Library for adding lots */}
              <LibrarySection />
              
              {/* Current auction lots */}
              <LotsListSection />
            </div>
          </div>
        ) : (
          /* Running Mode */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Control Panel */}
            <div className="lg:col-span-1">
              <AuctionControlPanel />
            </div>

            {/* Main Content - Auction Display */}
            <div className="lg:col-span-3">
              {auctionMode === 'cards' ? <CardsMode /> : <RouletteMode />}
            </div>
          </div>
        )}
      </div>

      {/* Winner Overlay */}
      <WinnerOverlay />
    </div>
  )
}