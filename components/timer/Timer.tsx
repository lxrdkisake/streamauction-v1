'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import useAuctionStore from '@/store/auction'
import { cn } from '@/lib/utils'

export function Timer() {
  const { timer, setTimer, startTimer, pauseTimer, resetTimer } = useAuctionStore()
  const [showSettings, setShowSettings] = useState(false)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSetTimer = () => {
    setTimer(hours, minutes, seconds)
    setShowSettings(false)
  }

  const handleToggleTimer = () => {
    if (timer.running) {
      pauseTimer()
    } else {
      startTimer()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Таймер
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div 
            className={cn(
              "text-4xl font-mono font-bold tracking-wider",
              "text-primary drop-shadow-lg",
              timer.running && "animate-pulse"
            )}
            style={{
              fontFamily: 'ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
              textShadow: '0 0 20px rgba(139, 69, 19, 0.5)'
            }}
          >
            {formatTime(timer.leftMs)}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="flex-1"
          >
            Set
          </Button>
          
          <Button
            variant={timer.running ? "secondary" : "default"}
            size="sm"
            onClick={handleToggleTimer}
            disabled={timer.leftMs === 0}
            className="flex-1"
          >
            {timer.running ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Start
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimer}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Timer Settings */}
        {showSettings && (
          <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Часы</label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                  className="text-center"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Минуты</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                  className="text-center"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Секунды</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                  className="text-center"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleSetTimer}
                className="flex-1"
              >
                Установить
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}