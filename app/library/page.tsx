'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Library, 
  Plus, 
  Search, 
  TowerControl as GameController2, 
  Film, 
  Edit, 
  Trash2,
  Loader2,
  Grid,
  List
} from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import type { Lot } from '@/lib/validators'

// Column definitions for the data table
const columns: ColumnDef<Lot>[] = [
  {
    accessorKey: 'title',
    header: 'Название',
    cell: ({ row }) => {
      const lot = row.original
      const CategoryIcon = lot.category === 'games' ? GameController2 : Film
      
      return (
        <div className="flex items-center gap-3">
          {lot.imageUrl && (
            <img 
              src={lot.imageUrl} 
              alt={lot.title}
              className="w-12 h-16 object-cover rounded"
            />
          )}
          <div>
            <div className="font-medium">{lot.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                <CategoryIcon className="w-3 h-3 mr-1" />
                {lot.category === 'games' ? 'Игра' : 'Фильм'}
              </Badge>
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: 'Описание',
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return description ? (
        <div className="max-w-xs truncate">{description}</div>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Создан',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return date.toLocaleDateString('ru-RU')
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const lot = row.original
      
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  },
]

export default function LibraryPage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'games' | 'movies'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Form state for creating new lot
  const [newLot, setNewLot] = useState({
    title: '',
    category: 'games' as 'games' | 'movies',
    description: '',
    imageUrl: ''
  })

  useEffect(() => {
    fetchLots()
  }, [searchQuery, categoryFilter])

  const fetchLots = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      
      const response = await fetch(`/api/lots?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setLots(result.data.lots)
      } else {
        setError(result.error || 'Ошибка загрузки лотов')
      }
    } catch (err) {
      setError('Ошибка сети')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/lots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLot)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setLots(prev => [result.data, ...prev])
        setIsCreateModalOpen(false)
        setNewLot({
          title: '',
          category: 'games',
          description: '',
          imageUrl: ''
        })
      } else {
        setError(result.error || 'Ошибка создания лота')
      }
    } catch (err) {
      setError('Ошибка сети')
    }
  }

  const filteredLots = lots.filter(lot => {
    const matchesSearch = !searchQuery || 
      lot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lot.description && lot.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || lot.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container-custom py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Библиотека лотов</h1>
            <p className="text-muted-foreground">
              Управление коллекцией игр и фильмов для аукционов
            </p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Добавить лот
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новый лот</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateLot} className="space-y-4">
                <div>
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={newLot.title}
                    onChange={(e) => setNewLot(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Введите название лота"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Select 
                    value={newLot.category} 
                    onValueChange={(value: 'games' | 'movies') => 
                      setNewLot(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="games">
                        <div className="flex items-center gap-2">
                          <GameController2 className="w-4 h-4" />
                          Игры
                        </div>
                      </SelectItem>
                      <SelectItem value="movies">
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4" />
                          Фильмы и сериалы
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={newLot.description}
                    onChange={(e) => setNewLot(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Краткое описание лота"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="imageUrl">URL изображения</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={newLot.imageUrl}
                    onChange={(e) => setNewLot(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                    Отмена
                  </Button>
                  <Button type="submit" className="flex-1">
                    Создать
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="w-5 h-5" />
              Фильтры и поиск
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск по названию или описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="games">
                    <div className="flex items-center gap-2">
                      <GameController2 className="w-4 h-4" />
                      Игры
                    </div>
                  </SelectItem>
                  <SelectItem value="movies">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4" />
                      Фильмы и сериалы
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="grid">
                    <Grid className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="table">
                    <List className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

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
            <span>Загрузка лотов...</span>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <Tabs value={viewMode} className="space-y-4">
            <TabsContent value="grid">
              {filteredLots.length === 0 ? (
                <div className="empty-state">
                  <Library className="empty-state-icon" />
                  <h3 className="empty-state-title">Лоты не найдены</h3>
                  <p className="empty-state-description">
                    Попробуйте изменить фильтры или создайте новый лот
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredLots.map((lot) => {
                    const CategoryIcon = lot.category === 'games' ? GameController2 : Film
                    
                    return (
                      <Card key={lot.id} className="group hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="aspect-[3/4] rounded-lg overflow-hidden mb-3 bg-muted">
                            {lot.imageUrl ? (
                              <img
                                src={lot.imageUrl}
                                alt={lot.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <CategoryIcon className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-medium text-sm line-clamp-2">{lot.title}</h3>
                            
                            <Badge variant="outline">
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {lot.category === 'games' ? 'Игра' : 'Фильм'}
                            </Badge>
                            
                            {lot.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {lot.description}
                              </p>
                            )}
                            
                            <div className="flex gap-1 pt-2">
                              <Button variant="ghost" size="sm" className="flex-1">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="table">
              <Card>
                <CardContent className="p-6">
                  <DataTable 
                    columns={columns} 
                    data={filteredLots}
                    searchKey="title"
                    searchPlaceholder="Поиск лотов..."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Stats */}
        {!isLoading && filteredLots.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Показано {filteredLots.length} из {lots.length} лотов
            </span>
            <div className="flex gap-4">
              <span>
                Игр: {filteredLots.filter(l => l.category === 'games').length}
              </span>
              <span>
                Фильмов: {filteredLots.filter(l => l.category === 'movies').length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}