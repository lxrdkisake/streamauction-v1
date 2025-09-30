'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const testLots = [
  {
    id: '1',
    title: '100',
    imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    sum: 333,
    eliminated: false
  },
  {
    id: '2',
    title: '66-Quartet',
    imageUrl: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    sum: 155,
    eliminated: false
  },
  {
    id: '3',
    title: 'Meridian: Squad',
    imageUrl: 'https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    sum: 55,
    eliminated: false
  },
  {
    id: '4',
    title: 'GSI',
    imageUrl: 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    sum: 67,
    eliminated: false
  },
  {
    id: '5',
    title: 'Steel Division: Normandy 44',
    imageUrl: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    sum: 44,
    eliminated: false
  }
]

export default function TestCardsPage() {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [isAnimating, setIsAnimating] = useState(false)

  const handleCardClick = (lotId: string) => {
    if (isAnimating || flippedCards.has(lotId)) return
    
    setIsAnimating(true)
    setFlippedCards(prev => new Set([...prev, lotId]))
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }

  const handleReset = () => {
    setFlippedCards(new Set())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container-custom py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Тест карточек</h1>
            <p className="text-gray-300">
              Нажмите на карточки чтобы их открыть
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button onClick={handleReset} variant="outline">
              Сбросить карточки
            </Button>
          </div>

          {/* Cards Grid */}
          <div className="flex justify-center">
            <div className="grid grid-cols-5 gap-4">
              {testLots.map((lot) => {
                const isFlipped = flippedCards.has(lot.id)

                return (
                  <div
                    key={lot.id}
                    className={cn(
                      "card-container",
                      isFlipped && "flipped"
                    )}
                    onClick={() => handleCardClick(lot.id)}
                  >
                    <div className="card-inner">
                      {/* Back Face */}
                      <div className="card-face card-back">
                        ?
                      </div>
                      
                      {/* Front Face */}
                      <div 
                        className="card-face card-front"
                        style={{
                          backgroundImage: `url(${lot.imageUrl})`
                        }}
                      >
                        <div className="card-info">
                          <div className="card-title">{lot.title}</div>
                          <div className="card-sum">
                            {lot.sum} ₽
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="text-center text-gray-300">
            Открыто: {flippedCards.size} из {testLots.length} карточек
          </div>
        </div>
      </div>
    </div>
  )
}