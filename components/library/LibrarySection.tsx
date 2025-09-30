'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Library, Plus, TowerControl as GameController2, Film, Grid, List, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuctionStore from '@/store/auction'
import type { Lot } from '@/lib/validators'

export default function LibrarySection() {
  const { currentAuction, auctionLots, addLotToAuction } = useAuctionStore()

  const [lots, setLots] = useState<Lot[]>([])
  const [selectedLots, setSelectedLots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'games' | 'movies'>('games')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [error, setError] = useState<string | null>(null)

  const sectionTitle = category === 'games' ? 'Игры' : 'Фильмы и сериалы'

  useEffect(() => {
    let aborted = false
    async function run() {
      setIsLoading(true)
      setError(null)
      try {
        const qs = new URLSearchParams()
        if (search.trim()) qs.set('q', search.trim())
        const url =
            (category === 'games' ? '/api/library/games' : '/api/library/movies') +
            (qs.toString() ? `?${qs}` : '')

        const r = await fetch(url, { cache: 'no-store' })
        const j = await r.json()
        if (aborted) return
        if (!r.ok || !j.ok) throw new Error(j.error || 'LOTS_FETCH_FAILED')
        setLots(j.items as Lot[])
      } catch {
        if (!aborted) setError('Ошибка получения лотов')
      } finally {
        if (!aborted) setIsLoading(false)
      }
    }
    const t = setTimeout(run, 300)
    return () => {
      aborted = true
      clearTimeout(t)
    }
  }, [category, search])

  const availableLots = useMemo(() => {
    const ids = new Set(auctionLots.map(a => a.lotId))
    return lots.filter(l => !ids.has(l.id))
  }, [lots, auctionLots])

  function handleLotSelect(lotId: string, checked: boolean) {
    setSelectedLots(prev => (checked ? [...prev, lotId] : prev.filter(id => id !== lotId)))
  }
  function handleSelectAll(checked: boolean) {
    setSelectedLots(checked ? availableLots.map(l => l.id) : [])
  }

  async function handleAddToAuction() {
    if (selectedLots.length === 0 || !currentAuction) return
    setIsLoading(true)
    try {
      const r = await fetch(`/api/auctions/${currentAuction.id}/lots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lotIds: selectedLots }),
      })
      const j = await r.json()
      if (!r.ok || !j.success) throw new Error()
          ;(j.data as any[]).forEach(al => addLotToAuction(al))
      setSelectedLots([])
      setError(null)
    } catch {
      setError('Ошибка при добавлении лотов')
    } finally {
      setIsLoading(false)
    }
  }

  const CategoryIcon = category === 'games' ? GameController2 : Film
  const categoryBadge = (c: string) => (c === 'games' ? 'Игра' : 'Фильм/сериал')

  return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="w-5 h-5" />
            {sectionTitle}
          </CardTitle>
          <CardDescription>Выберите лоты для добавления в аукцион</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                  placeholder="Поиск по названию или описанию…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 btn-standard"
              />
            </div>

            <Tabs value={category} onValueChange={(v) => setCategory(v as 'games' | 'movies')}>
              <TabsList>
                <TabsTrigger value="games">
                  <GameController2 className="w-4 h-4 mr-1" />
                  Игры
                </TabsTrigger>
                <TabsTrigger value="movies">
                  <Film className="w-4 h-4 mr-1" />
                  Фильмы и сериалы
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
              <TabsList>
                <TabsTrigger value="grid"><Grid className="w-4 h-4" /></TabsTrigger>
                <TabsTrigger value="list"><List className="w-4 h-4" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>}

          {!isLoading && availableLots.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                      checked={selectedLots.length === availableLots.length && availableLots.length > 0}
                      onCheckedChange={(v) => handleSelectAll(!!v)}
                  />
                  <Label className="text-sm">Выбрать все ({availableLots.length})</Label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Выбрано: {selectedLots.length}</span>
                  <Button size="sm" onClick={handleAddToAuction} disabled={selectedLots.length === 0 || !currentAuction}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить в список
                  </Button>
                </div>
              </div>
          )}

          {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Загрузка лотов…</span>
              </div>
          )}

          {!isLoading && availableLots.length === 0 && !error && (
              <div className="empty-state">
                <CategoryIcon className="empty-state-icon" />
                <h3 className="empty-state-title">Лоты не найдены</h3>
                <p className="empty-state-description">Измени фильтр или запрос</p>
              </div>
          )}

          {!isLoading && availableLots.length > 0 && (
              <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2')}>
                {availableLots.map((lot) => {
                  const isSelected = selectedLots.includes(lot.id)
                  const Icon = lot.category === 'games' ? GameController2 : Film
                  return (
                      <div
                          key={lot.id}
                          className={cn(
                              'border rounded-lg p-4 cursor-pointer transition-all hover:bg-accent/50',
                              isSelected && 'ring-2 ring-primary bg-accent/50',
                              viewMode === 'list' && 'flex items-center gap-4'
                          )}
                          onClick={() => handleLotSelect(lot.id, !isSelected)}
                      >
                        <div className={cn('flex items-start gap-3', viewMode === 'list' && 'flex-1')}>
                          <Checkbox
                              checked={isSelected}
                              onCheckedChange={(v) => handleLotSelect(lot.id, !!v)}
                              onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-sm truncate">{lot.title}</h4>
                              <Badge variant="outline" className="shrink-0">
                                <Icon className="w-3 h-3 mr-1" />
                                {categoryBadge(lot.category)}
                              </Badge>
                            </div>
                            {lot.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{lot.description}</p>
                            )}
                          </div>
                        </div>
                        {viewMode === 'grid' && lot.imageUrl && (
                            <div className="mt-3">
                              <img src={lot.imageUrl} alt={lot.title} className="w-full h-32 object-cover rounded" loading="lazy" />
                            </div>
                        )}
                      </div>
                  )
                })}
              </div>
          )}
        </CardContent>
      </Card>
  )
}
