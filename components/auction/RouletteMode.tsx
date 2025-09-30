'use client';

import React, { useState, useEffect } from 'react';
import { useAuctionStore } from '@/store/auction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader as Loader2, Play, Pause } from 'lucide-react';

export default function RouletteMode() {
  const { 
    currentAuction, 
    currentLot, 
    isSpinning, 
    startSpin, 
    stopSpin,
    selectWinner 
  } = useAuctionStore();
  
  const [spinAngle, setSpinAngle] = useState(0);
  const [animationId, setAnimationId] = useState<number | null>(null);

  useEffect(() => {
    if (isSpinning && !animationId) {
      const animate = () => {
        setSpinAngle(prev => (prev + 10) % 360);
        const id = requestAnimationFrame(animate);
        setAnimationId(id);
      };
      animate();
    } else if (!isSpinning && animationId) {
      cancelAnimationFrame(animationId);
      setAnimationId(null);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isSpinning, animationId]);

  const handleStartSpin = () => {
    if (currentLot) {
      startSpin();
    }
  };

  const handleStopSpin = () => {
    stopSpin();
    // Simulate winner selection after stopping
    setTimeout(() => {
      if (currentLot?.participants && currentLot.participants.length > 0) {
        const randomIndex = Math.floor(Math.random() * currentLot.participants.length);
        const winner = currentLot.participants[randomIndex];
        selectWinner(winner.id);
      }
    }, 1000);
  };

  if (!currentAuction || !currentLot) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading auction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Roulette Mode - {currentLot.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            {/* Roulette Wheel */}
            <div className="relative">
              <div 
                className="w-64 h-64 border-8 border-primary rounded-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 transition-transform duration-100"
                style={{ transform: `rotate(${spinAngle}deg)` }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">🎯</div>
                  <div className="text-sm font-medium mt-2">
                    {currentLot.participants?.length || 0} Participants
                  </div>
                </div>
              </div>
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <Button
                onClick={handleStartSpin}
                disabled={isSpinning || !currentLot.participants?.length}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Spin
              </Button>
              <Button
                onClick={handleStopSpin}
                disabled={!isSpinning}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Stop Spin
              </Button>
            </div>

            {/* Participants List */}
            {currentLot.participants && currentLot.participants.length > 0 && (
              <div className="w-full max-w-md">
                <h3 className="font-semibold mb-2">Participants ({currentLot.participants.length})</h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {currentLot.participants.map((participant, index) => (
                    <div 
                      key={participant.id} 
                      className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                    >
                      <span>{participant.name}</span>
                      <span className="text-muted-foreground">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}