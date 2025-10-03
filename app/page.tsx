'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Settings, Zap, Grid2x2 as Grid, Clock } from 'lucide-react'
import useAuctionStore from '@/store/auction'

export default function HomePage() {
  const { 
    currentAuction, 
    fetchCurrentAuction,
    createAuction,
    isUpdating 
  } = useAuctionStore()

  useEffect(() => {
    fetchCurrentAuction()
  }, [fetchCurrentAuction])

  const handleCreateAuction = async () => {
    try {
      await createAuction({
        mode: 'cards',
        durationSec: 60
      })
    } catch (error) {
      console.error('Failed to create auction:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">StreamAuction</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Профессиональная платформа для проведения интерактивных аукционов игр и фильмов
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentAuction ? (
            /* Current Auction */
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Текущий аукцион</CardTitle>
                    <CardDescription>
                      ID: {currentAuction.id.slice(0, 8)}...
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    {currentAuction.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {currentAuction.mode === 'cards' ? (
                        <Grid className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Zap className="w-5 h-5 text-purple-400" />
                      )}
                      <span className="text-white font-medium">
                        {currentAuction.mode === 'cards' ? 'Карточки' : 'Рулетка'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Режим показа</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">
                        {Math.floor(currentAuction.durationSec / 60)}:
                        {(currentAuction.durationSec % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Длительность</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-white">
                        {currentAuction.lots?.length || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Лотов добавлено</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Управлять аукционом
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Create New Auction */
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">Создать новый аукцион</CardTitle>
                <CardDescription>
                  Начните с создания нового интерактивного аукциона
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-12 h-12 text-orange-400" />
                  </div>
                  <p className="text-gray-300 max-w-md mx-auto">
                    Создайте аукцион, добавьте лоты из библиотеки игр и фильмов, 
                    и начните интерактивное шоу для вашей аудитории
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleCreateAuction}
                  disabled={isUpdating}
                  className="bg-orange-600 hover:bg-orange-700 px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isUpdating ? 'Создание...' : 'Создать аукцион'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6 text-center">
                <Grid className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Режим карточек</h3>
                <p className="text-sm text-gray-400">
                  Интерактивное открытие карточек с лотами
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Режим рулетки</h3>
                <p className="text-sm text-gray-400">
                  Динамичная рулетка для выбора победителя
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6 text-center">
                <Settings className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Гибкие настройки</h3>
                <p className="text-sm text-gray-400">
                  Полный контроль над процессом аукциона
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}