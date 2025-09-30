'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { List, Trash2, GripVertical, TowerControl as GameController2, Film, ArrowUp, ArrowDown, X } from 'lucide-react'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import useAuctionStore from '@/store/auction'
import type { AuctionLot, Lot } from '@/lib/validators'

interface SortableLotItemProps {
  auctionLot: AuctionLot & { lot: Lot }
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onRemove: () => void
  index: number
}

function SortableLotItem({ auctionLot, isSelected, onSelect, onRemove, index }: SortableLotItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: auctionLot.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const CategoryIcon = auctionLot.lot.category === 'games' ? GameController2 : Film

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-4 border rounded-lg bg-card transition-all',
        isDragging && 'opacity-50 scale-95 shadow-lg',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      {/* Order Number */}
      <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-muted-foreground bg-muted rounded-full shrink-0">
        {index + 1}
      </div>

      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Selection Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelect}
      />

      {/* Lot Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm truncate">{auctionLot.lot.title}</h4>
          <Badge variant="outline">
            <CategoryIcon className="w-3 h-3 mr-1" />
            {auctionLot.lot.category === 'games' ? 'Игра' : 'Фильм'}
          </Badge>
        </div>
        
        {auctionLot.lot.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {auctionLot.lot.description}
          </p>
        )}
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}

export function LotsListSection() {
  const { 
    currentAuction, 
    auctionLots, 
    setAuctionLots, 
    removeLotFromAuction,
    isUpdating 
  } = useAuctionStore()

  const [selectedLots, setSelectedLots] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Clear selection when lots change
  useEffect(() => {
    setSelectedLots(prev => prev.filter(id => 
      auctionLots.some(al => al.id === id)
    ))
  }, [auctionLots])

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = auctionLots.findIndex(item => item.id === active.id)
      const newIndex = auctionLots.findIndex(item => item.id === over.id)
      
      const reorderedLots = arrayMove(auctionLots, oldIndex, newIndex)
      
      // Update local state optimistically
      setAuctionLots(reorderedLots)
      
      // Update server
      if (currentAuction) {
        try {
          const lotOrders = reorderedLots.map((lot, index) => ({
            lotId: lot.lotId,
            order: index + 1
          }))

          const response = await fetch(`/api/auctions/${currentAuction.id}/lots`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              auctionId: currentAuction.id,
              lotOrders
            })
          })

          const result = await response.json()
          
          if (result.success) {
            setAuctionLots(result.data)
            setError(null)
          } else {
            // Revert on error
            setAuctionLots(auctionLots)
            setError(result.error || 'Не удалось изменить порядок')
          }
        } catch (error) {
          // Revert on error
          setAuctionLots(auctionLots)
          setError('Ошибка при изменении порядка')
        }
      }
    }
  }

  const handleLotSelect = (lotId: string, checked: boolean) => {
    if (checked) {
      setSelectedLots(prev => [...prev, lotId])
    } else {
      setSelectedLots(prev => prev.filter(id => id !== lotId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLots(auctionLots.map(al => al.id))
    } else {
      setSelectedLots([])
    }
  }

  const handleRemoveLot = async (auctionLotId: string) => {
    if (!currentAuction) return

    const auctionLot = auctionLots.find(al => al.id === auctionLotId)
    if (!auctionLot) return

    try {
      const response = await fetch(
        `/api/auctions/${currentAuction.id}/lots?lotId=${auctionLot.lotId}`,
        { method: 'DELETE' }
      )

      const result = await response.json()
      
      if (result.success) {
        removeLotFromAuction(auctionLot.lotId)
        setSelectedLots(prev => prev.filter(id => id !== auctionLotId))
        setError(null)
      } else {
        setError(result.error || 'Не удалось удалить лот')
      }
    } catch (error) {
      setError('Ошибка при удалении лота')
    }
  }

  const handleRemoveSelected = async () => {
    if (selectedLots.length === 0 || !currentAuction) return

    try {
      const lotIds = selectedLots
        .map(selectedId => auctionLots.find(al => al.id === selectedId)?.lotId)
        .filter(Boolean)

      const queryParams = lotIds.map(id => `lotId=${id}`).join('&')
      const response = await fetch(
        `/api/auctions/${currentAuction.id}/lots?${queryParams}`,
        { method: 'DELETE' }
      )

      const result = await response.json()
      
      if (result.success) {
        result.data.removedLotIds.forEach((lotId: string) => {
          removeLotFromAuction(lotId)
        })
        setSelectedLots([])
        setError(null)
      } else {
        setError(result.error || 'Не удалось удалить лоты')
      }
    } catch (error) {
      setError('Ошибка при удалении лотов')
    }
  }

  const canEdit = !currentAuction || ['idle', 'configured'].includes(currentAuction.status)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5" />
          Список лотов аукциона
        </CardTitle>
        <CardDescription>
          Настройте порядок показа лотов. Перетащите для изменения порядка.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {error}
          </div>
        )}

        {/* Selection Controls */}
        {auctionLots.length > 0 && canEdit && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedLots.length === auctionLots.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">
                Выбрать все ({auctionLots.length})
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Выбрано: {selectedLots.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveSelected}
                disabled={selectedLots.length === 0 || isUpdating}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить выбранные
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {auctionLots.length === 0 && (
          <div className="empty-state">
            <List className="empty-state-icon" />
            <h3 className="empty-state-title">Список лотов пуст</h3>
            <p className="empty-state-description">
              Добавьте лоты из библиотеки, чтобы настроить аукцион
            </p>
          </div>
        )}

        {/* Lots List */}
        {auctionLots.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={auctionLots.map(al => al.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {auctionLots.map((auctionLot, index) => (
                  <SortableLotItem
                    key={auctionLot.id}
                    auctionLot={auctionLot}
                    index={index}
                    isSelected={selectedLots.includes(auctionLot.id)}
                    onSelect={(checked) => handleLotSelect(auctionLot.id, checked)}
                    onRemove={() => handleRemoveLot(auctionLot.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Stats */}
        {auctionLots.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
            <span>Всего лотов: {auctionLots.length}</span>
            <span>
              Примерное время: {Math.ceil((auctionLots.length * (currentAuction?.durationSec || 60)) / 60)} мин
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}