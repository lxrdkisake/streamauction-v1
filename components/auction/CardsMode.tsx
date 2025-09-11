'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import useAuctionStore from '@/store/auction'
import styles from './cards.module.css'

function getImageUrl(imageUrl: string | null): string {
  return imageUrl || '/placeholder.png'
}

export function CardsMode() {
  const { lots, order, subMode, openOneCard, showWinnerScreen } = useAuctionStore()
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [isAnimating, setIsAnimating] = useState(false)

  const availableLots = order
    .map(id => lots[id])
    .filter(lot => lot && !lot.eliminated)

  const handleCardClick = async (lotId: string) => {
    if (isAnimating || flippedCards.has(lotId)) return
    
    setIsAnimating(true)
    setFlippedCards(prev => new Set([...prev, lotId]))
    
    // Wait for flip animation
    setTimeout(() => {
      const winnerId = openOneCard()
      setIsAnimating(false)
      
      if (winnerId) {
        setTimeout(() => {
          showWinnerScreen(true)
        }, 1000)
      }
    }, 500)
  }

  // Reset flipped cards when starting new auction
  useEffect(() => {
    setFlippedCards(new Set())
  }, [order])

  if (availableLots.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎴</div>
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
        <h2 className="text-2xl font-bold mb-2 text-white">Режим карточек</h2>
        <p className="text-gray-300">
          {subMode === 'instant' 
            ? 'Первая открытая карточка — победитель' 
            : 'Открывайте карточки до последнего оставшегося'
          }
        </p>
      </div>

      {/* Cards Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-5 gap-4">
          {availableLots.map((lot) => {
            const isFlipped = flippedCards.has(lot.id)
            const isEliminated = lot.eliminated

            return (
              <div
                key={lot.id}
                className={cn(
                  "card-container",
                  isFlipped && styles.flipped,
                  isEliminated && 'opacity-50'
                )}
                onClick={() => !isEliminated && handleCardClick(lot.id)}
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
                      backgroundImage: `url(${getImageUrl(lot.imageUrl)})`
                    }}
                  >
                    <div className="card-info">
                      <div className="card-title">{lot.title}</div>
                      <div className="card-sum">
                        {lot.sum.toLocaleString()} ₽
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
      <div className="text-center text-sm text-gray-300">
        Открыто: {flippedCards.size} из {availableLots.length} карточек
      </div>
    </div>
  )
}