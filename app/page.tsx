'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Play, Search, Plus, Trash2, Settings, RotateCcw } from 'lucide-react'
import useAuctionStore from '@/store/auction'
import { AuctionParamsPanel } from '@/components/auction/AuctionParamsPanel'
import LibrarySection from '@/components/library/LibrarySection'
import { LotsListSection } from '@/components/auction/LotsListSection'
import type { Auction } from '@/lib/validators'

export default function PreparationPage() {
  const {
    currentAuction,
    config,
    auctionLots,
    isLoading,
    error,
    setCurrentAuction,
    setConfig,
    setError
  } = useAuctionStore()

  const [localError, setLocalError] = useState<string | null>(null)

  // Initialize current auction on page load
  useEffect(() => {
    const initializeAuction = async () => {
      try {
        // Check for existing active auction
        const response = await fetch('/api/auctions?status=configured')
        const result = await response.json()
        
        if (result.success && result.data.auctions.length > 0) {
          setCurrentAuction(result.data.auctions[0])
          return
        }

        // Check for idle auctions
        const idleResponse = await fetch('/api/auctions?status=idle')
        const idleResult = await idleResponse.json()
        
        if (idleResult.success && idleResult.data.auctions.length > 0) {
          setCurrentAuction(idleResult.data.auctions[0])
        }
      } catch (error) {
        console.error('Failed to initialize auction:', error)
        setError('Не удалось загрузить аукцион')
      }
    }

    initializeAuction()
  }, [setCurrentAuction, setError])

  const handleStartAuction = async () => {
    if (!currentAuction) {
      setLocalError('Аукцион не настроен')
      return
    }

    if (auctionLots.length === 0) {
      setLocalError('Добавьте лоты в список аукциона')
      return
    }

    try {
      const response = await fetch(`/api/auctions/${currentAuction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'running'
        })
      })

      const result = await response.json()

      if (result.success) {
        setCurrentAuction(result.data)
        // Redirect to auction page
        window.location.href = '/auction'
      } else {
        setLocalError(result.error || 'Не удалось начать аукцион')
      }
    } catch (error) {
      setLocalError('Ошибка при запуске аукциона')
    }
  }

  const displayError = error || localError

  return (
    <div className="container-custom py-6">
      <div className="sidebar-layout">
        {/* Left Panel - Auction Parameters */}
        <div className="space-y-6">
          <AuctionParamsPanel />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Error Display */}
          {displayError && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="flex items-center gap-2 pt-6">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{displayError}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setError(null)
                    setLocalError(null)
                  }}
                  className="ml-auto"
                >
                  Закрыть
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Library Section */}
          <LibrarySection />

          {/* Lots List Section */}
          <LotsListSection />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                // Reset lots list
                // This would typically call an API to clear the auction lots
              }}
              disabled={isLoading || auctionLots.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Очистить список
            </Button>
            
            <Button
              onClick={handleStartAuction}
              disabled={isLoading || auctionLots.length === 0 || !currentAuction}
              className="btn-standard"
            >
              <Play className="w-4 h-4 mr-2" />
              Начать аукцион
            </Button>
          </div>

          {/* Status Info */}
          {currentAuction && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Статус аукциона:</span>
                  <Badge variant={currentAuction.status === 'configured' ? 'default' : 'outline'}>
                    {currentAuction.status === 'idle' && 'Готов к настройке'}
                    {currentAuction.status === 'configured' && 'Настроен'}
                    {currentAuction.status === 'running' && 'Идёт'}
                    {currentAuction.status === 'paused' && 'Пауза'}
                    {currentAuction.status === 'finished' && 'Завершён'}
                    {currentAuction.status === 'archived' && 'Архивирован'}
                  </Badge>
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Режим:</span>
                    <div className="font-medium">
                      {config?.mode === 'cards' ? 'Карточки' : 'Рулетка'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Длительность:</span>
                    <div className="font-medium">{config?.durationSec || 0}с</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Лотов:</span>
                    <div className="font-medium">{auctionLots.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}