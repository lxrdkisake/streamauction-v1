'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Square } from 'lucide-react'
import useAuctionStore from '@/store/auction'

function getImageUrl(imageUrl: string | null): string {
  return imageUrl || '/placeholder.png'
}

export function RouletteMode() {
  const { lots, order, roulette, spinRoulette, showWinnerScreen } = useAuctionStore()
  const [isSpinning, setIsSpinning] = useState(false)
  const rouletteRef = useRef<HTMLDivElement>(null)

  const availableLots = order
    .map(id => lots[id])
    .filter(lot => lot && !lot.eliminated)

  const handleSpin = async () => {
    if (isSpinning || availableLots.length === 0) return
    
    setIsSpinning(true)
    
    try {
      const winnerId = await spinRoulette()
      
      setTimeout(() => {
        showWinnerScreen(true)
        setIsSpinning(false)
      }, 1000)
    } catch (error) {
      console.error('Roulette spin failed:', error)
      setIsSpinning(false)
    }
  }

  if (availableLots.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎰</div>
        <h3 className="empty-state-title">Нет доступных лотов</h3>
        <p className="empty-state-description">
          Добавьте лоты в список для начала аукциона
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mode Info */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-white">Режим рулетки</h2>
        <p className="text-gray-300">
          Нажмите кнопку для запуска рулетки
        </p>
      </div>

      {/* Roulette Container */}
      <div className="relative">
        <div className="relative h-32 bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 rounded-lg overflow-hidden border border-gray-600">
          {/* Center Marker */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-purple-500 z-10">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-purple-500" />
          </div>
          
          {/* Roulette Items */}
          <div 
            ref={rouletteRef}
            className={`flex h-full items-center ${roulette.spinning ? 'animate-pulse' : ''}`}
            style={{ width: `${availableLots.length * 120}px` }}
          >
            {availableLots.map((lot, index) => (
              <div
                key={`${lot.id}-${index}`}
                className="w-28 h-28 m-1 flex-shrink-0 rounded-lg overflow-hidden border border-gray-600 bg-gray-800"
              >
                <img
                  src={getImageUrl(lot.imageUrl)}
                  alt={lot.title}
                  className="w-full h-20 object-cover"
                />
                <div className="p-1 text-center">
                  <div className="text-xs font-medium truncate text-white">{lot.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <Button
          onClick={handleSpin}
          disabled={isSpinning}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSpinning ? (
            <>
              <Square className="w-5 h-5 mr-2 animate-spin" />
              Крутится...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Крутить рулетку
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-gray-300">
        Участвует лотов: {availableLots.length}
      </div>
    </div>
  )
}