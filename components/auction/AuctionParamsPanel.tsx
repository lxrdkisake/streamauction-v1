'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Settings, RotateCcw, Zap, Grid, TowerControl as GameController2, Film } from 'lucide-react'
import useAuctionStore from '@/store/auction'
import type { AuctionConfig } from '@/lib/validators'

const DURATION_PRESETS = [30, 60, 120]

export function AuctionParamsPanel() {
  const { config, setConfig, currentAuction, setCurrentAuction } = useAuctionStore()
  const [localConfig, setLocalConfig] = useState<AuctionConfig>({
    mode: 'cards',
    durationSec: 60,
    defaultCategory: 'games'
  })
  const [isUpdating, setIsUpdating] = useState(false)

  // Initialize local config
  useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  const handleSaveConfig = async () => {
    setIsUpdating(true)
    
    try {
      let auctionId = currentAuction?.id

      // Create new auction if none exists
      if (!auctionId) {
        const createResponse = await fetch('/api/auctions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(localConfig)
        })

        const createResult = await createResponse.json()
        
        if (createResult.success) {
          setCurrentAuction(createResult.data)
          auctionId = createResult.data.id
        } else {
          throw new Error(createResult.error || 'Не удалось создать аукцион')
        }
      }

      // Update existing auction
      if (auctionId && currentAuction?.status === 'idle') {
        const updateResponse = await fetch(`/api/auctions/${auctionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mode: localConfig.mode,
            durationSec: localConfig.durationSec,
            status: 'configured'
          })
        })

        const updateResult = await updateResponse.json()
        
        if (updateResult.success) {
          setCurrentAuction(updateResult.data)
        } else {
          throw new Error(updateResult.error || 'Не удалось обновить аукцион')
        }
      }

      setConfig(localConfig)
    } catch (error: any) {
      console.error('Config save error:', error)
      // Handle error appropriately
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReset = () => {
    const defaultConfig: AuctionConfig = {
      mode: 'cards',
      durationSec: 60,
      defaultCategory: 'games'
    }
    setLocalConfig(defaultConfig)
  }

  const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(config)
  const canEdit = !currentAuction || ['idle', 'configured'].includes(currentAuction.status)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Параметры аукциона
        </CardTitle>
        <CardDescription>
          Настройте режим и параметры проведения аукциона
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auction Mode */}
        <div className="space-y-3">
          <Label>Режим аукциона</Label>
          <Tabs 
            value={localConfig.mode} 
            onValueChange={(value) => 
              setLocalConfig({ ...localConfig, mode: value as 'cards' | 'roulette' })
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cards" disabled={!canEdit}>
                <Grid className="w-4 h-4 mr-2" />
                Карточки
              </TabsTrigger>
              <TabsTrigger value="roulette" disabled={!canEdit}>
                <Zap className="w-4 h-4 mr-2" />
                Рулетка
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <Label htmlFor="duration">Длительность показа (секунды)</Label>
          <div className="space-y-3">
            <Input
              id="duration"
              type="number"
              min="10"
              max="600"
              value={localConfig.durationSec}
              onChange={(e) => 
                setLocalConfig({ ...localConfig, durationSec: parseInt(e.target.value) || 60 })
              }
              disabled={!canEdit}
              className="btn-standard"
            />
            
            {/* Duration Presets */}
            <div className="flex gap-2">
              {DURATION_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setLocalConfig({ ...localConfig, durationSec: preset })}
                  disabled={!canEdit}
                  className={localConfig.durationSec === preset ? 'bg-primary/10' : ''}
                >
                  {preset}с
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Default Category */}
        <div className="space-y-3">
          <Label>Категория по умолчанию</Label>
          <ToggleGroup
            type="single"
            value={localConfig.defaultCategory}
            onValueChange={(value) => 
              setLocalConfig({ 
                ...localConfig, 
                defaultCategory: (value as 'games' | 'movies') || 'games' 
              })
            }
            className="justify-start"
          >
            <ToggleGroupItem value="games" disabled={!canEdit}>
              <GameController2 className="w-4 h-4 mr-2" />
              Игры
            </ToggleGroupItem>
            <ToggleGroupItem value="movies" disabled={!canEdit}>
              <Film className="w-4 h-4 mr-2" />
              Фильмы и сериалы
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Action Buttons */}
        {canEdit && (
          <div className="flex gap-2">
            <Button
              onClick={handleSaveConfig}
              disabled={isUpdating || !hasChanges}
              className="flex-1"
            >
              {isUpdating ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isUpdating}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {!canEdit && (
          <div className="text-sm text-muted-foreground">
            Настройки нельзя изменить во время активного аукциона
          </div>
        )}
      </CardContent>
    </Card>
  )
}