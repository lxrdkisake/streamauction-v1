'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Zap, Grid, Trash2 } from 'lucide-react'
import useAuctionStore from '@/store/auction'
import { Timer } from '@/components/timer/Timer'

export function AuctionParamsPanel() {
  const { mode, subMode, setMode, setSubMode, resetAll } = useAuctionStore()

  return (
      <div className="space-y-6">
        <Timer />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Настройки аукциона
            </CardTitle>
            <CardDescription>
              Выберите режим и параметры для проведения аукциона.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auction Mode */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground ml-1">Режим показа</h4>
              <Tabs
                  value={mode}
                  onValueChange={(value) => setMode(value as 'cards' | 'roulette')}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cards">
                    <Grid className="w-4 h-4 mr-2" />
                    Карточки
                  </TabsTrigger>
                  <TabsTrigger value="roulette">
                    <Zap className="w-4 h-4 mr-2" />
                    Рулетка
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Sub Mode */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground ml-1">Подрежим</h4>
              <Tabs
                  value={subMode}
                  onValueChange={(value) => setSubMode(value as 'instant' | 'elimination')}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="instant">Моментальный</TabsTrigger>
                  <TabsTrigger value="elimination">На выбывание</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Reset Button */}
            <div className="pt-6">
              <Button
                  variant="destructive"
                  onClick={resetAll}
                  className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Сбросить всё
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}