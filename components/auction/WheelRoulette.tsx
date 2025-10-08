'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lot } from '@/store/auction';
import { Trophy } from 'lucide-react';

interface WheelRouletteProps {
  lots: Lot[];
  spinning: boolean;
  winnerId: string | null;
  onSpinComplete?: (winnerId: string) => void;
}

export default function WheelRoulette({ lots, spinning, winnerId, onSpinComplete }: WheelRouletteProps) {
  const [rotation, setRotation] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);

  const availableLots = lots.filter(lot => !lot.eliminated);
  const segmentAngle = availableLots.length > 0 ? 360 / availableLots.length : 0;

  const colors = [
    '#22c55e',
    '#16a34a',
    '#15803d',
    '#84cc16',
    '#65a30d',
    '#4d7c0f',
  ];

  useEffect(() => {
    if (spinning && availableLots.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableLots.length);
      const targetAngle = randomIndex * segmentAngle;
      const spins = 5;
      const totalRotation = currentRotation + (spins * 360) + (360 - targetAngle);

      setRotation(totalRotation);

      setTimeout(() => {
        const selectedLot = availableLots[randomIndex];
        if (onSpinComplete && selectedLot) {
          onSpinComplete(selectedLot.id);
        }
      }, 5000);
    }
  }, [spinning]);

  useEffect(() => {
    if (!spinning) {
      setCurrentRotation(rotation % 360);
    }
  }, [spinning, rotation]);

  if (availableLots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Нет доступных лотов</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
      </div>

      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-b from-slate-800 to-slate-900 px-6 py-2 rounded-lg border-2 border-white shadow-2xl">
        <span className="text-white font-bold text-xl">Победитель</span>
      </div>

      <motion.div
        className="relative"
        style={{
          width: '600px',
          height: '600px',
        }}
        animate={{ rotate: rotation }}
        transition={{
          duration: spinning ? 5 : 0,
          ease: spinning ? [0.25, 0.46, 0.45, 0.94] : 'linear',
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-2xl"
        >
          <defs>
            {availableLots.map((lot, index) => (
              <clipPath key={`clip-${lot.id}`} id={`segment-${index}`}>
                <path
                  d={describeArc(100, 100, 98, index * segmentAngle, (index + 1) * segmentAngle)}
                />
              </clipPath>
            ))}
          </defs>

          <circle cx="100" cy="100" r="100" fill="white" />

          {availableLots.map((lot, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const midAngle = (startAngle + endAngle) / 2;
            const color = colors[index % colors.length];

            const textRadius = 65;
            const textX = 100 + textRadius * Math.sin((midAngle * Math.PI) / 180);
            const textY = 100 - textRadius * Math.cos((midAngle * Math.PI) / 180);

            return (
              <g key={lot.id}>
                <path
                  d={describeArc(100, 100, 98, startAngle, endAngle)}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />

                <g transform={`rotate(${midAngle} 100 100)`}>
                  <text
                    x="100"
                    y="40"
                    textAnchor="middle"
                    fill="white"
                    fontSize="6"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {lot.title.length > 15 ? lot.title.substring(0, 15) + '...' : lot.title}
                  </text>
                  <text
                    x="100"
                    y="48"
                    textAnchor="middle"
                    fill="white"
                    fontSize="5"
                    className="select-none"
                    opacity="0.9"
                  >
                    {lot.sum} ₽
                  </text>
                </g>
              </g>
            );
          })}

          <circle cx="100" cy="100" r="15" fill="white" stroke="#334155" strokeWidth="2" />

          <g transform="translate(100, 100)">
            <circle r="12" fill="#1e293b" />
            <path
              d="M -4 -2 L 4 -2 L 0 4 Z"
              fill="white"
            />
          </g>
        </svg>
      </motion.div>

      <AnimatePresence>
        {winnerId && !spinning && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-3xl p-8 shadow-2xl border-4 border-white max-w-md">
              <div className="flex flex-col items-center gap-4">
                <Trophy className="w-16 h-16 text-white animate-bounce" />
                <h2 className="text-3xl font-bold text-white text-center">
                  Победитель!
                </h2>
                <p className="text-xl text-white/90 text-center">
                  {lots.find(l => l.id === winnerId)?.title}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z'
  ].join(' ');
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
