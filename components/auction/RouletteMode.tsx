'use client';

import React, { useState, useCallback } from 'react';
import useAuctionStore from '@/store/auction';
import WheelRoulette from './WheelRoulette';
import CaseRoulette from './CaseRoulette';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type RouletteType = 'wheel' | 'case';

export default function RouletteMode() {
  const [rouletteType, setRouletteType] = useState<RouletteType>('wheel');
  const lots = useAuctionStore(state => Object.values(state.lots));
  const spinning = useAuctionStore(state => state.roulette.spinning);
  const winnerId = useAuctionStore(state => state.ui.winner);
  const spinRoulette = useAuctionStore(state => state.spinRoulette);
  const showWinnerScreen = useAuctionStore(state => state.showWinnerScreen);

  const handleSpin = useCallback(async () => {
    try {
      await spinRoulette();
    } catch (error) {
      console.error('Failed to spin roulette:', error);
    }
  }, [spinRoulette]);

  const handleSpinComplete = useCallback((winnerId: string) => {
    showWinnerScreen(true);
  }, [showWinnerScreen]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <Tabs value={rouletteType} onValueChange={(v) => setRouletteType(v as RouletteType)}>
          <TabsList>
            <TabsTrigger value="wheel">Колесо</TabsTrigger>
            <TabsTrigger value="case">Кейсы</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          onClick={handleSpin}
          disabled={spinning || lots.filter(l => !l.eliminated).length === 0}
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          {spinning ? 'Вращение...' : 'Запустить'}
        </Button>
      </div>

      <div className="flex-1 bg-slate-900">
        {rouletteType === 'wheel' ? (
          <WheelRoulette
            lots={lots}
            spinning={spinning}
            winnerId={winnerId}
            onSpinComplete={handleSpinComplete}
          />
        ) : (
          <CaseRoulette
            lots={lots}
            spinning={spinning}
            winnerId={winnerId}
            onSpinComplete={handleSpinComplete}
          />
        )}
      </div>
    </div>
  );
}
