'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, List, Trash2, Edit3, Check, X, TowerControl as GameController2, Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuctionStore from '@/store/auction'

function getImageUrl(imageUrl: string | null): string {
  return imageUrl || '/placeholder.png'
}

export function SidebarList() {
  const { lots, searchQuery, setSearchQuery, editSum, remove, clearAll } = useAuctionStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const lotsList = Object.values(lots)
  const filteredLots = lotsList.filter(lot =>
    lot.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalAmount = lotsList.reduce((sum, lot) => sum + lot.sum, 0)

  const handleEditStart = (lot: any) => {
    setEditingId(lot.id)
    setEditValue(lot.sum.toString())
  }

  const handleEditSave = () => {
    if (editingId) {
      const newSum = parseInt(editValue) || 1
      editSum(editingId, newSum)
      setEditingId(null)
      setEditValue('')
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5" />
          Список лотов
          <Badge variant="secondary" className="ml-auto">
            {lotsList.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Clear All Button */}
        {lotsList.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Очистить список
          </Button>
        )}

        {/* Total Amount */}
        {lotsList.length > 0 && (
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Общая сумма</div>
            <div className="text-lg font-bold text-primary">
              {totalAmount.toLocaleString()} ₽
            </div>
          </div>
        )}

        {/* Lots List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {filteredLots.length === 0 && lotsList.length === 0 && (
            <div className="empty-state">
              <List className="empty-state-icon" />
              <h3 className="empty-state-title">Список пуст</h3>
              <p className="empty-state-description">
                Добавьте лоты из библиотеки
              </p>
            </div>
          )}

          {filteredLots.length === 0 && lotsList.length > 0 && (
            <div className="empty-state">
              <Search className="empty-state-icon" />
              <h3 className="empty-state-title">Ничего не найдено</h3>
              <p className="empty-state-description">
                Попробуйте изменить поисковый запрос
              </p>
            </div>
          )}

          {filteredLots.map((lot) => {
            const CategoryIcon = lot.category === 'games' ? GameController2 : Film
            const isEditing = editingId === lot.id

            return (
              <div
                key={lot.id}
                className={cn(
                  "flex items-center gap-3 p-3 border rounded-lg transition-all",
                  lot.eliminated && "opacity-50 bg-muted/20",
                  lot.eliminated && "line-through"
                )}
              >
                {/* Thumbnail */}
                <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                  <img
                    src={getImageUrl(lot.imageUrl)}
                    alt={lot.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{lot.title}</h4>
                    <CategoryIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  </div>
                  
                  {/* Amount */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-20 h-6 text-xs"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditSave}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditCancel}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-primary">
                          {lot.sum.toLocaleString()} ₽
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditStart(lot)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                {!isEditing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(lot.id)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}