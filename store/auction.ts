import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LotId = string

export type Lot = {
  id: LotId
  title: string
  imageUrl: string | null
  category: 'games' | 'movies'
  sum: number
  eliminated: boolean
}

export type Mode = 'cards' | 'roulette'
export type SubMode = 'instant' | 'elimination'

export type TimerState = {
  running: boolean
  endsAt: number | null
  leftMs: number
  totalMs: number
}

export type RouletteState = {
  spinSec: number
  spinning: boolean
  items: LotId[]
}

export type UIState = {
  winner: LotId | null
  addingLot: Lot | null
  showWinner: boolean
}

export type AuctionState = {
  lots: Record<LotId, Lot>
  order: LotId[]
  mode: Mode
  subMode: SubMode
  timer: TimerState
  roulette: RouletteState
  ui: UIState
  searchQuery: string
  
  // Actions
  addOrIncrease: (lot: Omit<Lot, 'sum' | 'eliminated'>, delta: number) => void
  editSum: (id: LotId, sum: number) => void
  remove: (id: LotId) => void
  clearAll: () => void
  setSearchQuery: (query: string) => void
  
  // Auction control
  start: (mode: Mode) => void
  stop: () => void
  setMode: (mode: Mode) => void
  setSubMode: (subMode: SubMode) => void
  
  // Timer
  setTimer: (hours: number, minutes: number, seconds: number) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tick: () => void
  
  // Cards mode
  openOneCard: () => LotId | null
  
  // Roulette mode
  setSpinDuration: (seconds: number) => void
  spinRoulette: () => Promise<LotId>
  
  // UI
  setWinner: (id: LotId | null) => void
  setAddingLot: (lot: Lot | null) => void
  showWinnerScreen: (show: boolean) => void
  
  // Reset
  resetAll: () => void
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Calculate elimination probability
function getEliminationProbability(sum: number, base = 0.5, k = 0.01): number {
  return Math.max(0.02, Math.min(0.6, base / (1 + k * sum)))
}

// Get selection weight (inverse of elimination probability)
function getSelectionWeight(sum: number): number {
  return 1 - getEliminationProbability(sum)
}

// Weighted random selection
function weightedRandom<T>(items: T[], getWeight: (item: T) => number): T {
  const weights = items.map(getWeight)
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  
  let random = Math.random() * totalWeight
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return items[i]
    }
  }
  
  return items[items.length - 1]
}

const useAuctionStore = create<AuctionState>()(
  persist(
    (set, get) => ({
      lots: {},
      order: [],
      mode: 'cards',
      subMode: 'instant',
      timer: {
        running: false,
        endsAt: null,
        leftMs: 0,
        totalMs: 0
      },
      roulette: {
        spinSec: 5,
        spinning: false,
        items: []
      },
      ui: {
        winner: null,
        addingLot: null,
        showWinner: false
      },
      searchQuery: '',

      addOrIncrease: (lotData, delta) => {
        set((state) => {
          const existing = state.lots[lotData.id]
          const newLots = { ...state.lots }
          
          if (existing) {
            newLots[lotData.id] = {
              ...existing,
              sum: existing.sum + delta
            }
          } else {
            newLots[lotData.id] = {
              ...lotData,
              sum: delta,
              eliminated: false
            }
          }
          
          return { lots: newLots }
        })
      },

      editSum: (id, sum) => {
        set((state) => ({
          lots: {
            ...state.lots,
            [id]: {
              ...state.lots[id],
              sum: Math.max(1, sum)
            }
          }
        }))
      },

      remove: (id) => {
        set((state) => {
          const newLots = { ...state.lots }
          delete newLots[id]
          
          return {
            lots: newLots,
            order: state.order.filter(lotId => lotId !== id)
          }
        })
      },

      clearAll: () => {
        set({
          lots: {},
          order: [],
          ui: { winner: null, addingLot: null, showWinner: false }
        })
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      start: (mode) => {
        set((state) => {
          const lotIds = Object.keys(state.lots)
          const shuffledOrder = shuffle(lotIds)
          
          // Reset eliminated status
          const resetLots = Object.fromEntries(
            Object.entries(state.lots).map(([id, lot]) => [
              id,
              { ...lot, eliminated: false }
            ])
          )
          
          return {
            mode,
            order: shuffledOrder,
            lots: resetLots,
            ui: { ...state.ui, winner: null, showWinner: false }
          }
        })
      },

      stop: () => {
        set((state) => ({
          ui: { ...state.ui, winner: null, showWinner: false }
        }))
      },

      setMode: (mode) => {
        set({ mode })
      },

      setSubMode: (subMode) => {
        set({ subMode })
      },

      setTimer: (hours, minutes, seconds) => {
        const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000
        set((state) => ({
          timer: {
            ...state.timer,
            leftMs: totalMs,
            totalMs
          }
        }))
      },

      startTimer: () => {
        set((state) => ({
          timer: {
            ...state.timer,
            running: true,
            endsAt: Date.now() + state.timer.leftMs
          }
        }))
      },

      pauseTimer: () => {
        set((state) => ({
          timer: {
            ...state.timer,
            running: false,
            endsAt: null
          }
        }))
      },

      resetTimer: () => {
        set((state) => ({
          timer: {
            ...state.timer,
            running: false,
            endsAt: null,
            leftMs: state.timer.totalMs
          }
        }))
      },

      tick: () => {
        set((state) => {
          if (!state.timer.running || !state.timer.endsAt) return state
          
          const now = Date.now()
          const leftMs = Math.max(0, state.timer.endsAt - now)
          
          return {
            timer: {
              ...state.timer,
              leftMs,
              running: leftMs > 0
            }
          }
        })
      },

      openOneCard: () => {
        const state = get()
        const availableLots = state.order
          .map(id => state.lots[id])
          .filter(lot => lot && !lot.eliminated)
        
        if (availableLots.length === 0) return null
        
        // In instant mode, just pick a winner
        if (state.subMode === 'instant') {
          const winner = weightedRandom(availableLots, lot => getSelectionWeight(lot.sum))
          set((state) => ({
            ui: { ...state.ui, winner: winner.id, showWinner: true }
          }))
          return winner.id
        }
        
        // In elimination mode, check if lot gets eliminated
        const selectedLot = weightedRandom(availableLots, lot => getSelectionWeight(lot.sum))
        const eliminationProb = getEliminationProbability(selectedLot.sum)
        const isEliminated = Math.random() < eliminationProb
        
        if (isEliminated) {
          // Eliminate the lot
          set((state) => ({
            lots: {
              ...state.lots,
              [selectedLot.id]: {
                ...selectedLot,
                eliminated: true
              }
            }
          }))
          
          // Check if we have a winner (only one left)
          const remainingLots = availableLots.filter(lot => 
            lot.id !== selectedLot.id
          )
          
          if (remainingLots.length === 1) {
            set((state) => ({
              ui: { ...state.ui, winner: remainingLots[0].id, showWinner: true }
            }))
            return remainingLots[0].id
          }
        }
        
        return selectedLot.id
      },

      setSpinDuration: (seconds) => {
        set((state) => ({
          roulette: {
            ...state.roulette,
            spinSec: seconds
          }
        }))
      },

      spinRoulette: async () => {
        const state = get()
        const availableLots = Object.values(state.lots).filter(lot => !lot.eliminated)
        
        if (availableLots.length === 0) {
          throw new Error('No available lots')
        }
        
        // Create weighted roulette items
        const items: LotId[] = []
        availableLots.forEach(lot => {
          const weight = Math.ceil(getSelectionWeight(lot.sum) * 10)
          for (let i = 0; i < weight; i++) {
            items.push(lot.id)
          }
        })
        
        set((state) => ({
          roulette: {
            ...state.roulette,
            spinning: true,
            items: shuffle(items)
          }
        }))
        
        // Wait for spin duration
        await new Promise(resolve => setTimeout(resolve, state.roulette.spinSec * 1000))
        
        // Select winner
        const winnerIndex = Math.floor(Math.random() * items.length)
        const winnerId = items[winnerIndex]
        
        set((state) => ({
          roulette: {
            ...state.roulette,
            spinning: false
          },
          ui: {
            ...state.ui,
            winner: winnerId,
            showWinner: true
          }
        }))
        
        return winnerId
      },

      setWinner: (id) => {
        set((state) => ({
          ui: { ...state.ui, winner: id }
        }))
      },

      setAddingLot: (lot) => {
        set((state) => ({
          ui: { ...state.ui, addingLot: lot }
        }))
      },

      showWinnerScreen: (show) => {
        set((state) => ({
          ui: { ...state.ui, showWinner: show }
        }))
      },

      resetAll: () => {
        set({
          lots: {},
          order: [],
          mode: 'cards',
          subMode: 'instant',
          timer: {
            running: false,
            endsAt: null,
            leftMs: 0,
            totalMs: 0
          },
          roulette: {
            spinSec: 5,
            spinning: false,
            items: []
          },
          ui: {
            winner: null,
            addingLot: null,
            showWinner: false
          },
          searchQuery: ''
        })
      }
    }),
    {
      name: 'sa@v1',
      partialize: (state) => ({
        lots: state.lots,
        order: state.order,
        mode: state.mode,
        subMode: state.subMode,
        timer: state.timer,
        roulette: state.roulette
      })
    }
  )
)

export default useAuctionStore

// Timer hook with auto-restore
export function useTimerRestore() {
  const store = useAuctionStore()
  
  // Restore timer state on mount
  React.useEffect(() => {
    const { timer } = store
    if (timer.running && timer.endsAt) {
      const now = Date.now()
      const leftMs = Math.max(0, timer.endsAt - now)
      
      if (leftMs > 0) {
        store.setTimer(0, 0, Math.ceil(leftMs / 1000))
        store.startTimer()
      } else {
        store.pauseTimer()
      }
    }
  }, [])
  
  // Auto-tick timer
  React.useEffect(() => {
    if (!store.timer.running) return
    
    const interval = setInterval(() => {
      store.tick()
    }, 100)
    
    return () => clearInterval(interval)
  }, [store.timer.running])
}