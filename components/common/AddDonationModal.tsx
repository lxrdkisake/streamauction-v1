'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useAuctionStore from '@/store/auction'

function getImageUrl(imageUrl: string | null): string {
  return imageUrl || '/placeholder.png'
}

export function AddDonationModal() {
  const { ui, addOrIncrease, setAddingLot } = useAuctionStore()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const lot = ui.addingLot
  const isOpen = lot !== null

  const handleClose = () => {
    setAddingLot(null)
    setAmount('')
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const numAmount = parseInt(amount)
    
    if (!numAmount || numAmount < 1) {
      setError('Сумма должна быть не менее 1 ₽')
      return
    }
    
    if (lot) {
      addOrIncrease(lot, numAmount)
      handleClose()
    }
  }

  if (!lot) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить донат</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Lot Preview */}
          <div className="flex gap-4">
            <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              <img
                src={getImageUrl(lot.imageUrl)}
                alt={lot.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 mb-2">
                {lot.title}
              </h3>
              <div className="text-xs text-muted-foreground">
                {lot.category === 'games' ? 'Игра' : 'Фильм/сериал'}
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Сумма (₽)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError('')
                }}
                placeholder="Введите сумму"
                className="text-center"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1"
              >
                Добавить
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}