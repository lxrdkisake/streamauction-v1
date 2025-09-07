'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuctionStore from '@/store/auction'

function getImageUrl(imageUrl: string | null): string {
  return imageUrl || '/placeholder.png'
}

function getEliminationProbability(sum: number, base = 0.5, k = 0.01): number {
  return Math.max(0.02, Math.min(0.6, base / (1 + k * sum)))
}

export function RouletteMode() {
  const { 
    lots, 
    roulette, 
    subMode,
    setSpinDuration, 
    spinRoulette, 
    showWinnerScreen 
  } = useAuctionStore()
  
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinDuration, setSpinDurationLocal] = useState(roulette.spinSec)
  const rouletteRef = useRef<HTMLDivElement>(null)

  const availableLots = Object.values(lots).filter(lot => !lot.eliminated)

  // Create roulette items with weights
  const rouletteItems = []
  availableLots.forEach(lot => {
    const weight = Math.ceil((1 - getEliminationProbability(lot.sum)) * 10)
    for (let i = 0; i < weight; i++) {
      rouletteItems.push(lot)
    }
  })

  const handleSpin = async () => {
    if (isSpinning || availableLots.length === 0) return
    
    setIsSpinning(true)
    
    try {
      // Animate roulette
      if (rouletteRef.current) {
        const totalWidth = rouletteItems.length * 120 // 120px per item
        const randomOffset = Math.random() * totalWidth
        const finalPosition = -(totalWidth * 3 + randomOffset) // Spin multiple times
        
        rouletteRef.current.style.transition = `transform ${roulette.spinSec}s cubic-bezier(0.25, 0.1, 0.25, 1)`
        rouletteRef.current.style.transform = `translateX(${finalPosition}px)`
      }
      
      const winnerId = await spinRoulette()
      
      setTimeout(() => {
        showWinnerScreen(true)
        setIsSpinning(false)
      }, 1000)
      
    } catch (error) {
      setIsSpinning(false)
    }
  }

  const handleDurationChange = () => {
    setSpinDuration(spinDuration)
  }

  // Reset roulette position when lots change
  useEffect(() => {
    if (rouletteRef.current && !isSpinning) {
      rouletteRef.current.style.transition = 'none'
      rouletteRef.current.style.transform = 'translateX(0)'
    }
  }, [availableLots, isSpinning])

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
        <h2 className="text-2xl font-bold mb-2">Режим рулетки</h2>
        <p className="text-muted-foreground">
          {subMode === 'instant' 
            ? 'Результат рулетки определяет победителя' 
            : 'Проигравшие исключаются до последнего оставшегося'
          }
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="spin-duration">Длительность (сек):</Label>
          <Input
            id="spin-duration"
            type="number"
            min="1"
            max="30"
            value={spinDuration}
            onChange={(e) => setSpinDurationLocal(parseInt(e.target.value) || 5)}
            onBlur={handleDurationChange}
            className="w-20 text-center"
            disabled={isSpinning}
          />
        </div>
        
        <Button
          onClick={handleSpin}
          disabled={isSpinning || availableLots.length === 0}
          size="lg"
        >
          <Play className="w-4 h-4 mr-2" />
          {isSpinning ? 'Крутится...' : 'Крутить'}
        </Button>
      </div>

      {/* Roulette */}
      <div className="relative">
        {/* Roulette Container */}
        <div className="relative h-32 bg-gradient-to-r from-background via-muted/20 to-background rounded-lg overflow-hidden border">
          {/* Center Marker */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary z-10">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary" />
          </div>
          
          {/* Roulette Items */}
          <div 
            ref={rouletteRef}
            className="flex h-full items-center"
            style={{ width: `${rouletteItems.length * 120}px` }}
          >
            {rouletteItems.map((lot, index) => (
              <div
                key={`${lot.id}-${index}`}
                className="w-28 h-28 m-1 flex-shrink-0 rounded-lg overflow-hidden border bg-card"
              >
                <img
                  src={getImageUrl(lot.imageUrl)}
                  alt={lot.title}
                  className="w-full h-20 object-cover"
                />
                <div className="p-1 text-center">
                  <div className="text-xs font-medium truncate">{lot.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lots Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Участвующие лоты</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {availableLots.map((lot) => {
            const eliminationProb = getEliminationProbability(lot.sum)
            const winChance = Math.round((1 - eliminationProb) * 100)

            return (
              <Card 
                key={lot.id} 
                className={cn(
                  "transition-all",
                  lot.eliminated && "opacity-50 grayscale"
                )}
              >
                <CardContent className="p-3">
                  <div className="aspect-[3/4] rounded overflow-hidden mb-2">
                    <img
                      src={getImageUrl(lot.imageUrl)}
                      alt={lot.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm line-clamp-2">{lot.title}</h4>
                    <div className="text-xs text-primary font-bold">
                      {lot.sum.toLocaleString()} ₽
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Шанс: {winChance}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}