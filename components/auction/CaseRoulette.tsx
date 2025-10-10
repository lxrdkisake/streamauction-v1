'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lot } from '@/store/auction';
import { Trophy, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface CaseRouletteProps {
  lots: Lot[];
  spinning: boolean;
  winnerId: string | null;
  onSpinComplete?: (winnerId: string) => void;
}

export default function CaseRoulette({ lots, spinning, winnerId, onSpinComplete }: CaseRouletteProps) {
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<Lot[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const spinningRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const availableLots = lots.filter(lot => !lot.eliminated);

  useEffect(() => {
    if (availableLots.length > 0 && items.length === 0) {
      const repeatedItems: Lot[] = [];
      for (let i = 0; i < 50; i++) {
        repeatedItems.push(...availableLots);
      }
      setItems(repeatedItems);
    }
  }, [availableLots.length, items.length]);

  useEffect(() => {
    if (spinning && !spinningRef.current && items.length > 0 && availableLots.length > 0) {
      spinningRef.current = true;

      const winnerIndex = Math.floor(Math.random() * availableLots.length);
      const winnerLot = availableLots[winnerIndex];

      const centerPosition = items.length / 2;
      const winnerPosition = centerPosition + winnerIndex;

      const itemWidth = 200;
      const targetOffset = -(winnerPosition * itemWidth - (window.innerWidth / 2) + itemWidth / 2);

      setOffset(targetOffset);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        if (onSpinComplete && winnerLot) {
          onSpinComplete(winnerLot.id);
        }
        spinningRef.current = false;
      }, 5000);
    } else if (!spinning) {
      spinningRef.current = false;
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [spinning]);

  const getRarityColor = (sum: number) => {
    if (sum >= 5000) return 'from-amber-500 via-yellow-400 to-amber-500';
    if (sum >= 3000) return 'from-red-500 via-pink-500 to-red-500';
    if (sum >= 1500) return 'from-purple-500 via-violet-500 to-purple-500';
    if (sum >= 500) return 'from-blue-500 via-cyan-500 to-blue-500';
    return 'from-slate-500 via-slate-400 to-slate-500';
  };

  const getRarityGlow = (sum: number) => {
    if (sum >= 5000) return 'shadow-[0_0_30px_rgba(251,191,36,0.6)]';
    if (sum >= 3000) return 'shadow-[0_0_30px_rgba(239,68,68,0.6)]';
    if (sum >= 1500) return 'shadow-[0_0_30px_rgba(168,85,247,0.6)]';
    if (sum >= 500) return 'shadow-[0_0_30px_rgba(59,130,246,0.6)]';
    return 'shadow-[0_0_20px_rgba(100,116,139,0.4)]';
  };

  if (availableLots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Нет доступных лотов</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700/20 via-transparent to-transparent" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-full bg-gradient-to-b from-transparent via-amber-500 to-transparent z-20 shadow-[0_0_20px_rgba(251,191,36,0.8)]" />

      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-8 py-3 rounded-full border-2 border-amber-400 shadow-2xl">
          <span className="text-white font-bold text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Вращение
            <Sparkles className="w-6 h-6" />
          </span>
        </div>
      </div>

      <div className="relative w-full h-96 overflow-hidden" ref={containerRef}>
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10" />

        <motion.div
          className="flex items-center h-full"
          animate={{ x: offset }}
          transition={{
            duration: spinning ? 5 : 0,
            ease: spinning ? [0.25, 0.46, 0.45, 0.94] : 'linear',
          }}
          style={{
            x: 0,
          }}
        >
          {items.map((lot, index) => (
            <div
              key={`${lot.id}-${index}`}
              className="flex-shrink-0 px-2"
              style={{ width: '200px' }}
            >
              <div className={`relative h-80 rounded-xl bg-gradient-to-br ${getRarityColor(lot.sum)} p-[3px] ${getRarityGlow(lot.sum)} transition-all duration-300`}>
                <div className="h-full rounded-xl bg-slate-800/90 backdrop-blur-sm p-4 flex flex-col items-center justify-between">
                  <div className="w-full h-40 relative rounded-lg overflow-hidden bg-slate-700/50">
                    {lot.imageUrl ? (
                      <Image
                        src={lot.imageUrl}
                        alt={lot.title}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-slate-500" />
                      </div>
                    )}
                  </div>

                  <div className="w-full text-center space-y-2">
                    <h3 className="text-white font-bold text-sm line-clamp-2">
                      {lot.title}
                    </h3>

                    <div className={`inline-block bg-gradient-to-r ${getRarityColor(lot.sum)} px-4 py-2 rounded-lg`}>
                      <span className="text-white font-bold text-lg">
                        {lot.sum} ₽
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {winnerId && !spinning && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 50 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-3xl p-6 shadow-2xl border-4 border-white min-w-[400px]">
              <div className="flex flex-col items-center gap-3">
                <Trophy className="w-12 h-12 text-white animate-bounce" />
                <h2 className="text-2xl font-bold text-white">
                  Победитель!
                </h2>
                <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-white/20">
                  {lots.find(l => l.id === winnerId)?.imageUrl && (
                    <Image
                      src={lots.find(l => l.id === winnerId)!.imageUrl!}
                      alt="Winner"
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  )}
                </div>
                <p className="text-xl font-semibold text-white text-center">
                  {lots.find(l => l.id === winnerId)?.title}
                </p>
                <p className="text-2xl font-bold text-white">
                  {lots.find(l => l.id === winnerId)?.sum} ₽
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
