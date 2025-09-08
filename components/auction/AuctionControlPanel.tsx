'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Play, 
  Pause, 
  Square, 
  Archive, 
  RotateCcw,
  Zap,
  Grid,
  Clock,
  Users
} from 'lucide-react'
import { getAvailableActions, getStatusLabel, getStatusVariant } from '@/lib/fsm/auction'
import useAuctionStore from '@/store/auction'

export function AuctionControlPanel() {
  const { 
    currentAuction, 
    updateAuctionStatus,
    createAuction,
    isUpdating 
  } = useAuctionStore()

  const [newAuctionConfig, setNewAuctionConfig] = useState({
    mode: 'cards' as 'cards' | 'roulette',
    durationSec: 60
  })

  const handleCreateAuction = async () => {
    try {
      await createAuction(newAuctionConfig)
    } catch (error) {
      console.error('Failed to create auction:', error)
    }
  }

  const handleStatusChange = async (action: string) => {
    if (!currentAuction) return
    
    const statusMap: Record<string, string> = {
      configure: 'configured',
      start: 'running',
      pause: 'paused',
      resume: 'running',
      finish: 'finished',
      archive: 'archived',
      reset: 'idle'
    }
    
    const newStatus = statusMap[action]
    if (newStatus) {
      try {
        await updateAuctionStatus(currentAuction.id, newStatus)
      } catch (error) {
        console.error('Failed to update auction status:', error)
      }
    }
  }

  const availableActions = currentAuction 
    ? getAvailableActions(currentAuction.status as any)
    : []

  const getActionIcon = (action: string) => {
    const icons: Record<string, any> = {
      configure: Settings,
      start: Play,
      pause: Pause,
      resume: Play,
      finish: Square,
      archive: Archive,
      reset: RotateCcw
    }
    return icons[action] || Settings
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Управление аукционом
        </CardTitle>
        <CardDescription>
          Создание и управление состоянием аукциона
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Auction Status */}
        {currentAuction ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Текущий аукцион</h4>
                <p className="text-sm text-muted-foreground">
                  ID: {currentAuction.id.slice(0, 8)}...
                </p>
              </div>
              <Badge variant={getStatusVariant(currentAuction.status as any)}>
                {getStatusLabel(currentAuction.status as any)}
              </Badge>
            </div>

            {/* Auction Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Режим:</span>
                <div className="flex items-center gap-1 mt-1">
                  {currentAuction.mode === 'cards' ? (
                    <Grid className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {currentAuction.mode === 'cards' ? 'Карточки' : 'Рулетка'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Длительность:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(currentAuction.durationSec / 60)}:
                  {(currentAuction.durationSec % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Available Actions */}
            {availableActions.length > 0 && (
              <div className="space-y-2">
                <Label>Доступные действия:</Label>
                <div className="flex flex-wrap gap-2">
                  {availableActions.map((action) => {
                    const Icon = getActionIcon(action.event)
                    return (
                      <Button
                        key={action.event}
                        variant={action.variant as any}
                        size="sm"
                        onClick={() => handleStatusChange(action.event)}
                        disabled={isUpdating}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {action.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Create New Auction */
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Создать новый аукцион</h4>
              <p className="text-sm text-muted-foreground">
                Настройте параметры нового аукциона
              </p>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <Label>Режим показа</Label>
              <Tabs 
                value={newAuctionConfig.mode} 
                onValueChange={(value: any) => 
                  setNewAuctionConfig(prev => ({ ...prev, mode: value }))
                }
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

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Длительность (секунды)</Label>
              <Input
                id="duration"
                type="number"
                min="10"
                max="600"
                value={newAuctionConfig.durationSec}
                onChange={(e) => 
                  setNewAuctionConfig(prev => ({ 
                    ...prev, 
                    durationSec: parseInt(e.target.value) || 60 
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                От 10 до 600 секунд (10 минут)
              </p>
            </div>

            {/* Create Button */}
            <Button 
              onClick={handleCreateAuction}
              disabled={isUpdating}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Создать аукцион
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        {currentAuction && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold">
                  {currentAuction.lots?.length || 0}
                </div>
                <div className="text-muted-foreground">Лотов</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">
                  {currentAuction.history?.length || 0}
                </div>
                <div className="text-muted-foreground">События</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}