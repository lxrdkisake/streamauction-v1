'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Play } from 'lucide-react'

const testLots = [
  {
    id: '1',
    title: '100',
    imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    sum: 333
  },
  {
    id: '2',
    title: '66-Quartet',
    imageUrl: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    sum: 155
  },
  {
    id: '3',
    title: 'Meridian: Squad',
    imageUrl: 'https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    sum: 55
  },
  {
    id: '4',
    title: 'GSI',
    imageUrl: 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    sum: 67
  },
  {
    id: '5',
    title: 'Steel Division',
    imageUrl: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    sum: 44
  }
]

export default function TestRoulettePage() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinDuration, setSpinDuration] = useState(5)
  const [winner, setWinner] = useState<string | null>(null)
  const rouletteRef = useRef<HTMLDivElement>(null)

  // Create roulette items with weights
  const rouletteItems = []
  testLots.forEach(lot => {
    const weight = Math.ceil(lot.sum / 50) // Simple weight calculation
    for (let i = 0; i < weight; i++) {
      rouletteItems.push(lot)
    }
  })

  const handleSpin = async () => {
    if (isSpinning) return
    
    setIsSpinning(true)
    setWinner(null)
    
    // Reset position
    if (rouletteRef.current) {
      rouletteRef.current.style.transition = 'none'
      rouletteRef.current.style.transform = 'translateX(0)'
    }

    // Start animation after a brief delay
    setTimeout(() => {
      if (rouletteRef.current) {
        const totalWidth = rouletteItems.length * 120
        const randomOffset = Math.random() * totalWidth
        const finalPosition = -(totalWidth * 3 + randomOffset)
        
        rouletteRef.current.style.transition = `transform ${spinDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)`
        rouletteRef.current.style.transform = `translateX(${finalPosition}px)`
      }
    }, 100)
    
    // Determine winner after spin
    setTimeout(() => {
      const winnerLot = rouletteItems[Math.floor(Math.random() * rouletteItems.length)]
      setWinner(winnerLot.title)
      setIsSpinning(false)
    }, spinDuration * 1000 + 1000)
  }

  const handleReset = () => {
    setWinner(null)
    if (rouletteRef.current) {
      rouletteRef.current.style.transition = 'none'
      rouletteRef.current.style.transform = 'translateX(0)'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container-custom py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Тест рулетки</h1>
            <p className="text-gray-300">
              Настройте длительность и запустите рулетку
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="spin-duration" className="text-white">Длительность (сек):</Label>
              <Input
                id="spin-duration"
                type="number"
                min="1"
                max="30"
                value={spinDuration}
                onChange={(e) => setSpinDuration(parseInt(e.target.value) || 5)}
                className="w-20 text-center bg-gray-800 border-gray-600 text-white"
                disabled={isSpinning}
              />
            </div>
            
            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isSpinning ? 'Крутится...' : 'Крутить'}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              disabled={isSpinning}
            >
              Сбросить
            </Button>
          </div>

          {/* Winner Display */}
          {winner && (
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                🎉 Победитель: {winner} 🎉
              </div>
            </div>
          )}

          {/* Roulette */}
          <div className="relative">
            <div className="relative h-32 bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 rounded-lg overflow-hidden border border-gray-600">
              {/* Center Marker */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-purple-500 z-10">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-purple-500" />
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
                    className="w-28 h-28 m-1 flex-shrink-0 rounded-lg overflow-hidden border border-gray-600 bg-gray-800"
                  >
                    <img
                      src={lot.imageUrl}
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

          {/* Lots Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-white">Участвующие лоты</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {testLots.map((lot) => (
                <Card key={lot.id} className="bg-gray-800 border-gray-600">
                  <CardContent className="p-3">
                    <div className="aspect-[3/4] rounded overflow-hidden mb-2">
                      <img
                        src={lot.imageUrl}
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
      </div>
    </div>
  )
}