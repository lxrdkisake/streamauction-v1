'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play } from 'lucide-react'
import useAuctionStore from '@/store/auction'

function getImageUrl(imageUrl: string | null): string {
  return imageUrl || '/placeholder.png'
}

export function RouletteMode() {
  const { lots, order, spinRoulette, roulette, showWinnerScreen } = useAuctionStore()
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
      console.error('Roulette spin error:', error)
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

      {/* Spin Button */}
      <div className="text-center">
        <Button
          onClick={handleSpin}
          disabled={isSpinning}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Play className="w-4 h-4 mr-2" />
          {isSpinning ? 'Крутится...' : 'Крутить рулетку'}
        </Button>
      </div>

      {/* Roulette Display */}
      <div className="relative">
        <div className="relative h-32 bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 rounded-lg overflow-hidden border border-gray-600">
          {/* Center Marker */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-purple-500 z-10">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-purple-500" />
          </div>
          
          {/* Roulette Items */}
          <div 
            ref={rouletteRef}
            className={`flex h-full items-center transition-transform duration-5000 ease-out ${
              roulette.spinning ? 'animate-spin-roulette' : ''
            }`}
            style={{ width: `${roulette.items.length * 120}px` }}
          >
            {roulette.items.map((lotId, index) => {
              const lot = lots[lotId]
              if (!lot) return null
              
              return (
                <div
                  key={`${lotId}-${index}`}
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
              )
            })}
          </div>
        </div>
      </div>

      {/* Lots Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center text-white">Участвующие лоты</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {availableLots.map((lot) => (
            <Card key={lot.id} className="bg-gray-800 border-gray-600">
              <CardContent className="p-3">
                <div className="aspect-[3/4] rounded overflow-hidden mb-2">
                  <img
                    src={getImageUrl(lot.imageUrl)}
                    alt={lot.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm line-clamp-2 text-white">{lot.title}</h4>
                  <div className="text-xs text-green-400 font-bold">
                    {lot.sum} ₽
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}