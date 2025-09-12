'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Sparkles } from 'lucide-react'
import useAuctionStore from '@/store/auction'

function getImageUrl(imageUrl: string | null): string {
  return imageUrl || '/placeholder.png'
}

export function WinnerOverlay() {
  const { lots, ui, showWinnerScreen } = useAuctionStore()
  
  const winner = ui.winner ? lots[ui.winner] : null
  const isOpen = ui.showWinner && winner !== null

  const handleClose = () => {
    showWinnerScreen(false)
  }

  if (!winner) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl border-0 bg-gradient-to-br from-purple-900/80 via-gray-900/90 to-purple-900/80 backdrop-blur-sm winner-display-container">
        <div className="text-center space-y-6 py-8">
          {/* Trophy Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
              <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -bottom-1 -left-2 animate-pulse delay-300" />
            </div>
          </div>

          {/* Winner Title */}
          <div>
            <h1 className="text-4xl font-bold mb-2 winner-announcement">
              🎉 ПОБЕДИТЕЛЬ! 🎉
            </h1>
            <p className="text-gray-300">
              Поздравляем с выигрышем!
            </p>
          </div>

          {/* Winner Card */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-panel-bg-color rounded-xl p-6 max-w-sm border border-winner-color">
                <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4">
                  <img
                    src={getImageUrl(winner.imageUrl)}
                    alt={winner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-bold line-clamp-2 text-white">
                    {winner.title}
                  </h2>
                  
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-green-400">
                      {winner.sum.toLocaleString()} ₽
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {winner.category === 'games' ? 'Игра' : 'Фильм/сериал'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleClose}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-bold px-8"
          >
            Продолжить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}