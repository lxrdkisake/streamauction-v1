import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Auction, AuctionLot, Lot, AuctionConfig, AuctionStatus } from '@/lib/validators'

interface AuctionState {
  // Current auction
  currentAuction: Auction | null
  auctionLots: (AuctionLot & { lot: Lot })[]
  
  // Timer
  timeLeft: number
  timerActive: boolean
  currentLotIndex: number
  
  // Configuration
  config: AuctionConfig | null
  
  // Loading states
  isLoading: boolean
  isUpdating: boolean
  error: string | null
  
  // WebSocket connection
  wsConnected: boolean
  
  // Actions
  setCurrentAuction: (auction: Auction | null) => void
  setAuctionLots: (lots: (AuctionLot & { lot: Lot })[]) => void
  updateAuctionStatus: (status: AuctionStatus) => void
  
  // Timer actions
  setTimeLeft: (time: number) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tick: () => void
  
  // Lot management
  addLotToAuction: (lot: AuctionLot & { lot: Lot }) => void
  removeLotFromAuction: (lotId: string) => void
  reorderAuctionLots: (reorderedLots: (AuctionLot & { lot: Lot })[]) => void
  setCurrentLotIndex: (index: number) => void
  nextLot: () => void
  
  // Configuration
  setConfig: (config: AuctionConfig) => void
  
  // Loading states
  setLoading: (loading: boolean) => void
  setUpdating: (updating: boolean) => void
  setError: (error: string | null) => void
  
  // WebSocket
  setWsConnected: (connected: boolean) => void
  
  // Reset
  reset: () => void
}

const useAuctionStore = create<AuctionState>()(
  devtools((set, get) => ({
    // Initial state
    currentAuction: null,
    auctionLots: [],
    timeLeft: 0,
    timerActive: false,
    currentLotIndex: 0,
    config: null,
    isLoading: false,
    isUpdating: false,
    error: null,
    wsConnected: false,
    
    // Actions
    setCurrentAuction: (auction) => {
      set({ currentAuction: auction }, false, 'setCurrentAuction')
    },
    
    setAuctionLots: (lots) => {
      set({ auctionLots: lots }, false, 'setAuctionLots')
    },
    
    updateAuctionStatus: (status) => {
      const { currentAuction } = get()
      if (currentAuction) {
        set({
          currentAuction: { ...currentAuction, status }
        }, false, 'updateAuctionStatus')
      }
    },
    
    // Timer actions
    setTimeLeft: (time) => {
      set({ timeLeft: time }, false, 'setTimeLeft')
    },
    
    startTimer: () => {
      const { config } = get()
      set({
        timerActive: true,
        timeLeft: config?.durationSec || 60
      }, false, 'startTimer')
    },
    
    pauseTimer: () => {
      set({ timerActive: false }, false, 'pauseTimer')
    },
    
    resetTimer: () => {
      const { config } = get()
      set({
        timerActive: false,
        timeLeft: config?.durationSec || 60,
        currentLotIndex: 0
      }, false, 'resetTimer')
    },
    
    tick: () => {
      const { timeLeft, timerActive } = get()
      if (timerActive && timeLeft > 0) {
        set({ timeLeft: timeLeft - 1 }, false, 'tick')
      }
    },
    
    // Lot management
    addLotToAuction: (lot) => {
      const { auctionLots } = get()
      set({
        auctionLots: [...auctionLots, lot]
      }, false, 'addLotToAuction')
    },
    
    removeLotFromAuction: (lotId) => {
      const { auctionLots } = get()
      set({
        auctionLots: auctionLots.filter(al => al.lotId !== lotId)
      }, false, 'removeLotFromAuction')
    },
    
    reorderAuctionLots: (reorderedLots) => {
      set({ auctionLots: reorderedLots }, false, 'reorderAuctionLots')
    },
    
    setCurrentLotIndex: (index) => {
      set({ currentLotIndex: index }, false, 'setCurrentLotIndex')
    },
    
    nextLot: () => {
      const { currentLotIndex, auctionLots, config } = get()
      const nextIndex = currentLotIndex + 1
      
      if (nextIndex < auctionLots.length) {
        set({
          currentLotIndex: nextIndex,
          timeLeft: config?.durationSec || 60
        }, false, 'nextLot')
      }
    },
    
    // Configuration
    setConfig: (config) => {
      set({ config }, false, 'setConfig')
    },
    
    // Loading states
    setLoading: (loading) => {
      set({ isLoading: loading }, false, 'setLoading')
    },
    
    setUpdating: (updating) => {
      set({ isUpdating: updating }, false, 'setUpdating')
    },
    
    setError: (error) => {
      set({ error }, false, 'setError')
    },
    
    // WebSocket
    setWsConnected: (connected) => {
      set({ wsConnected: connected }, false, 'setWsConnected')
    },
    
    // Reset
    reset: () => {
      set({
        currentAuction: null,
        auctionLots: [],
        timeLeft: 0,
        timerActive: false,
        currentLotIndex: 0,
        config: null,
        isLoading: false,
        isUpdating: false,
        error: null,
        wsConnected: false
      }, false, 'reset')
    }
  }), {
    name: 'auction-store'
  })
)

export default useAuctionStore

// Utility hooks
export const useCurrentAuction = () => useAuctionStore(state => state.currentAuction)
export const useAuctionLots = () => useAuctionStore(state => state.auctionLots)
export const useAuctionTimer = () => useAuctionStore(state => ({
  timeLeft: state.timeLeft,
  timerActive: state.timerActive,
  currentLotIndex: state.currentLotIndex
}))
export const useAuctionConfig = () => useAuctionStore(state => state.config)
export const useAuctionLoading = () => useAuctionStore(state => ({
  isLoading: state.isLoading,
  isUpdating: state.isUpdating,
  error: state.error
}))