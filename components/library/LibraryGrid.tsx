'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Library, TowerControl as GameController2, Film, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuctionStore from '@/store/auction'

type LibraryItem = {
  id: string
  title: string
  imageUrl: string | null
  category: 'games' | 'movies'
}

function getImageUrl(imageUrl: string | null): string {
  return imageUrl || '/placeholder.png'
}

export function LibraryGrid() {
  const { setAddingLot } = useAuctionStore()
  const [items, setItems] = useState<LibraryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'games' | 'movies'>('games')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let aborted = false
    
    async function fetchItems() {
      if (!search.trim()) {
        setItems([])
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const endpoint = category === 'games' ? '/api/library/games' : '/api/library/movies'
        const url = `${endpoint}?q=${encodeURIComponent(search.trim())}`
        
        const response = await fetch(url, { cache: 'no-store' })
        const data = await response.json()
        
        if (aborted) return
        
        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Failed to fetch items')
        }
        
        setItems(data.items || [])
      } catch (err) {
        if (!aborted) {
          setError('Ошибка загрузки данных')
          setItems([])
        }
      } finally {
        if (!aborted) {
          setIsLoading(false)
        }
      }
    }
    
    const timer = setTimeout(fetchItems, 300)
    return () => {
      aborted = true
      clearTimeout(timer)
    }
  }, [search, category])

  const handleItemClick = (item: LibraryItem) => {
    setAddingLot({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      category: item.category,
      sum: 0,
      eliminated: false
    })
  }

  const CategoryIcon = category === 'games' ? GameController2 : Film
  const categoryLabel = category === 'games' ? 'Игры' : 'Фильмы и сериалы'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Library className="w-5 h-5" />
          Библиотека
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Category */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Tabs value={category} onValueChange={(v) => setCategory(v as 'games' | 'movies')}>
            <TabsList>
              <TabsTrigger value="games">
                <GameController2 className="w-4 h-4 mr-2" />
                Игры
              </TabsTrigger>
              <TabsTrigger value="movies">
                <Film className="w-4 h-4 mr-2" />
                Фильмы и сериалы
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Загрузка {categoryLabel.toLowerCase()}...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 && search.trim() && (
          <div className="empty-state">
            <CategoryIcon className="empty-state-icon" />
            <h3 className="empty-state-title">Ничего не найдено</h3>
            <p className="empty-state-description">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        )}

        {!search.trim() && !isLoading && (
          <div className="empty-state">
            <Search className="empty-state-icon" />
            <h3 className="empty-state-title">Начните поиск</h3>
            <p className="empty-state-description">
              Введите название для поиска в библиотеке
            </p>
          </div>
        )}

        {/* Items Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg border bg-muted transition-all group-hover:scale-105 group-hover:shadow-lg">
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}