'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useAuctionStore from '@/store/auction'

export function RouletteMode() {
  const { lots, timer, ui, selectWinner } = useAuctionStore()
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)

  const lotsList = Object.values(lots)

  const spinRoulette = () => {
    if (lotsList.length === 0 || isSpinning) return

    setIsSpinning(true)
    const spins = 5 + Math.random() * 5 // 5-10 full rotations
    const finalRotation = rotation + spins * 360 + Math.random() * 360
    
    setRotation(finalRotation)

    // Calculate winner after animation
    setTimeout(() => {
      const normalizedRotation = finalRotation % 360
      const segmentSize = 360 / lotsList.length
      const winnerIndex = Math.floor((360 - normalizedRotation) / segmentSize) % lotsList.length
      const winningLot = lotsList[winnerIndex]
      
      selectWinner(winningLot.id)
      setIsSpinning(false)
    }, 3000)
  }

  const resetRoulette = () => {
    setRotation(0)
    setIsSpinning(false)
  }

  if (lotsList.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>Добавьте лоты для запуска рулетки</p>
      </div>
    )
  }

  const segmentAngle = 360 / lotsList.length

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className="text-4xl font-mono text-white mb-2">
          {String(timer.hours).padStart(2, '0')}:
          {String(timer.minutes).padStart(2, '0')}:
          {String(timer.seconds).padStart(2, '0')}
        </div>
        <div className="text-purple-300">
          Осталось карт: {lotsList.length}. Нажмите «Продолжить».
        </div>
      </div>

      {/* Roulette Wheel */}
      <div className="relative">
        <div className="w-80 h-80 relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-purple-400"></div>
          </div>

          {/* Wheel */}
          <motion.div
            className="w-full h-full rounded-full border-4 border-purple-400/50 relative overflow-hidden"
            style={{
              background: 'radial-gradient(circle, rgba(139, 69, 19, 0.3) 0%, rgba(30, 30, 50, 0.8) 100%)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
            }}
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            {lotsList.map((lot, index) => {
              const startAngle = index * segmentAngle
              const hue = (index * 137.5) % 360 // Golden angle for color distribution
              
              return (
                <div
                  key={lot.id}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `rotate(${startAngle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`,
                    backgroundColor: `hsla(${hue}, 60%, 40%, 0.7)`,
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div 
                    className="text-white text-xs font-bold text-center px-2"
                    style={{ transform: `rotate(${segmentAngle / 2}deg)` }}
                  >
                    <div className="truncate max-w-16">{lot.title}</div>
                    <div className="text-xs opacity-75">{lot.price}₽</div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <Button
          onClick={spinRoulette}
          disabled={isSpinning}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
        >
          <Play className="w-4 h-4 mr-2" />
          {isSpinning ? 'Крутится...' : 'Крутить'}
        </Button>
        
        <Button
          onClick={resetRoulette}
          variant="outline"
          className="border-purple-400/50 text-purple-300 hover:bg-purple-500/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Сброс
        </Button>
      </div>
    </div>
  )
}