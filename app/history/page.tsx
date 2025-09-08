'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  History, 
  Calendar, 
  Clock, 
  Trophy, 
  Play, 
  Pause, 
  Square,
  Archive,
  RotateCcw,
  TowerControl as GameController2,
  Film,
  Loader2
} from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { getStatusLabel, getStatusVariant } from '@/lib/fsm/auction'
import type { Auction, HistoryRecord } from '@/lib/validators'

// Auction columns
const auctionColumns: ColumnDef<Auction>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Дата создания',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return (
        <div>
          <div>{date.toLocaleDateString('ru-RU')}</div>
          <div className="text-xs text-muted-foreground">
            {date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'mode',
    header: 'Режим',
    cell: ({ row }) => {
      const mode = row.getValue('mode') as string
      return (
        <Badge variant="outline">
          {mode === 'cards' ? 'Карточки' : 'Рулетка'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.getValue('status') as any
      return (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'durationSec',
    header: 'Длительность',
    cell: ({ row }) => {
      const duration = row.getValue('durationSec') as number
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
  },
  {
    id: 'lots',
    header: 'Лоты',
    cell: ({ row }) => {
      const auction = row.original as any
      return auction._count?.lots || 0
    },
  },
  {
    id: 'duration',
    header: 'Время проведения',
    cell: ({ row }) => {
      const auction = row.original as any
      if (!auction.startedAt) return '—'
      
      const start = new Date(auction.startedAt)
      const end = auction.finishedAt ? new Date(auction.finishedAt) : new Date()
      const durationMs = end.getTime() - start.getTime()
      const minutes = Math.floor(durationMs / 60000)
      
      return `${minutes} мин`
    },
  },
]

// History columns
const historyColumns: ColumnDef<HistoryRecord>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Время',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return (
        <div className="text-sm">
          <div>{date.toLocaleDateString('ru-RU')}</div>
          <div className="text-xs text-muted-foreground">
            {date.toLocaleTimeString('ru-RU')}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'eventType',
    header: 'Событие',
    cell: ({ row }) => {
      const eventType = row.getValue('eventType') as string
      const eventLabels: Record<string, { label: string; icon: any; variant: any }> = {
        auction_configured: { label: 'Аукцион настроен', icon: Play, variant: 'secondary' },
        auction_running: { label: 'Аукцион запущен', icon: Play, variant: 'default' },
        auction_paused: { label: 'Аукцион приостановлен', icon: Pause, variant: 'secondary' },
        auction_finished: { label: 'Аукцион завершён', icon: Square, variant: 'destructive' },
        auction_archived: { label: 'Аукцион архивирован', icon: Archive, variant: 'outline' },
        lot_displayed: { label: 'Лот показан', icon: Trophy, variant: 'outline' },
      }
      
      const event = eventLabels[eventType] || { label: eventType, icon: Clock, variant: 'outline' }
      const Icon = event.icon
      
      return (
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <Badge variant={event.variant as any}>
            {event.label}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'payload',
    header: 'Детали',
    cell: ({ row }) => {
      const payload = row.getValue('payload') as any
      if (!payload) return '—'
      
      // Try to display meaningful information from payload
      if (payload.lotTitle) {
        return <span className="text-sm">{payload.lotTitle}</span>
      }
      
      if (payload.previousStatus && payload.newStatus) {
        return (
          <span className="text-sm text-muted-foreground">
            {getStatusLabel(payload.previousStatus)} → {getStatusLabel(payload.newStatus)}
          </span>
        )
      }
      
      return <span className="text-xs text-muted-foreground">—</span>
    },
  },
]

export default function HistoryPage() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAuction, setSelectedAuction] = useState<string | null>(null)

  useEffect(() => {
    fetchAuctions()
  }, [])

  useEffect(() => {
    if (selectedAuction) {
      fetchAuctionHistory(selectedAuction)
    }
  }, [selectedAuction])

  const fetchAuctions = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auctions?status=archived')
      const result = await response.json()
      
      if (result.success) {
        setAuctions(result.data.auctions)
        // Auto-select first auction if available
        if (result.data.auctions.length > 0) {
          setSelectedAuction(result.data.auctions[0].id)
        }
      } else {
        setError(result.error || 'Ошибка загрузки аукционов')
      }
    } catch (err) {
      setError('Ошибка сети')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAuctionHistory = async (auctionId: string) => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}`)
      const result = await response.json()
      
      if (result.success) {
        setHistoryRecords(result.data.history || [])
      } else {
        setError(result.error || 'Ошибка загрузки истории')
      }
    } catch (err) {
      setError('Ошибка сети')
    }
  }

  const getAuctionStats = () => {
    const total = auctions.length
    const byMode = auctions.reduce((acc, auction) => {
      acc[auction.mode] = (acc[auction.mode] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return { total, byMode }
  }

  const stats = getAuctionStats()

  return (
    <div className="container-custom py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">История аукционов</h1>
          <p className="text-muted-foreground">
            Просмотр завершённых аукционов и их детальной истории
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <History className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Всего аукционов</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TowerControl as GameController2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.byMode.cards || 0}</div>
                  <div className="text-sm text-muted-foreground">Режим карточек</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Film className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.byMode.roulette || 0}</div>
                  <div className="text-sm text-muted-foreground">Режим рулетки</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Загрузка истории...</span>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <Tabs defaultValue="auctions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="auctions">
                <History className="w-4 h-4 mr-2" />
                Аукционы
              </TabsTrigger>
              <TabsTrigger value="events" disabled={!selectedAuction}>
                <Clock className="w-4 h-4 mr-2" />
                События
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="auctions">
              <Card>
                <CardHeader>
                  <CardTitle>Завершённые аукционы</CardTitle>
                  <CardDescription>
                    Список всех архивированных аукционов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auctions.length === 0 ? (
                    <div className="empty-state">
                      <History className="empty-state-icon" />
                      <h3 className="empty-state-title">История пуста</h3>
                      <p className="empty-state-description">
                        Завершённые аукционы будут отображаться здесь
                      </p>
                    </div>
                  ) : (
                    <DataTable 
                      columns={auctionColumns} 
                      data={auctions}
                      searchKey="mode"
                      searchPlaceholder="Поиск аукционов..."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>События аукциона</CardTitle>
                  <CardDescription>
                    Детальная история выбранного аукциона
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historyRecords.length === 0 ? (
                    <div className="empty-state">
                      <Clock className="empty-state-icon" />
                      <h3 className="empty-state-title">События не найдены</h3>
                      <p className="empty-state-description">
                        История событий для этого аукциона пуста
                      </p>
                    </div>
                  ) : (
                    <DataTable 
                      columns={historyColumns} 
                      data={historyRecords}
                      searchKey="eventType"
                      searchPlaceholder="Поиск событий..."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}