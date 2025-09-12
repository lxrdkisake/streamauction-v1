'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Lot {
  id: string;
  title: string;
  image: string;
  price: number;
  type: 'game' | 'movie';
}

interface RouletteModeProps {
  lots: Lot[];
  onWinner: (lot: Lot) => void;
  isSpinning: boolean;
  onSpin: () => void;
}

export default function RouletteMode({ lots, onWinner, isSpinning, onSpin }: RouletteModeProps) {
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Lot | null>(null);

  const spinRoulette = () => {
    if (lots.length === 0 || isSpinning) return;

    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const finalRotation = rotation + spins * 360 + Math.random() * 360;
    
    setRotation(finalRotation);
    onSpin();

    // Calculate winner after animation
    setTimeout(() => {
      const normalizedRotation = finalRotation % 360;
      const segmentSize = 360 / lots.length;
      const winnerIndex = Math.floor((360 - normalizedRotation) / segmentSize) % lots.length;
      const winningLot = lots[winnerIndex];
      
      setWinner(winningLot);
      onWinner(winningLot);
    }, 3000);
  };

  const resetRoulette = () => {
    setRotation(0);
    setWinner(null);
  };

  if (lots.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>Добавьте лоты для запуска рулетки</p>
      </div>
    );
  }

  const segmentAngle = 360 / lots.length;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Roulette Wheel */}
      <div className="relative">
        <div className="w-80 h-80 relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-purple-500"></div>
          </div>

          {/* Wheel */}
          <motion.div
            className="w-full h-full rounded-full border-4 border-purple-500 relative overflow-hidden bg-gray-800"
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            {lots.map((lot, index) => {
              const startAngle = index * segmentAngle;
              const hue = (index * 137.5) % 360; // Golden angle for color distribution
              
              return (
                <div
                  key={lot.id}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `rotate(${startAngle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`,
                    backgroundColor: `hsla(${hue}, 70%, 50%, 0.8)`,
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
              );
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
          className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Сброс
        </Button>
      </div>

      {/* Winner Display */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-purple-600/20 border border-purple-500 rounded-lg p-6 text-center"
          >
            <h3 className="text-xl font-bold text-purple-400 mb-2">Победитель!</h3>
            <div className="flex items-center justify-center space-x-4">
              <img 
                src={winner.image} 
                alt={winner.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <p className="text-white font-semibold">{winner.title}</p>
                <p className="text-purple-300">{winner.price}₽</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}