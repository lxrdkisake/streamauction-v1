import { z } from 'zod'

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Имя обязательно'),
  role: z.enum(['admin', 'operator']),
  createdAt: z.date()
})

// Lot schemas
export const LotSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Название обязательно'),
  category: z.enum(['games', 'movies']),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  meta: z.string().optional(), // JSON string
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateLotSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(255, 'Максимум 255 символов'),
  category: z.enum(['games', 'movies'], {
    errorMap: () => ({ message: 'Выберите категорию' })
  }),
  description: z.string().max(1000, 'Максимум 1000 символов').optional(),
  imageUrl: z.string().url('Неверный формат URL').optional().or(z.literal('')),
  meta: z.record(z.any()).optional() // Will be stringified
})

export const UpdateLotSchema = CreateLotSchema.partial()

// Auction schemas
export const AuctionSchema = z.object({
  id: z.string(),
  mode: z.enum(['cards', 'roulette']),
  durationSec: z.number().positive(),
  status: z.enum(['idle', 'configured', 'running', 'paused', 'finished', 'archived']),
  startedAt: z.date().optional(),
  finishedAt: z.date().optional(),
  createdAt: z.date()
})

export const AuctionConfigSchema = z.object({
  mode: z.enum(['cards', 'roulette'], {
    errorMap: () => ({ message: 'Выберите режим аукциона' })
  }),
  durationSec: z.number()
    .min(10, 'Минимум 10 секунд')
    .max(600, 'Максимум 600 секунд'),
  defaultCategory: z.enum(['games', 'movies']).optional()
})

// AuctionLot schemas
export const AuctionLotSchema = z.object({
  id: z.string(),
  auctionId: z.string(),
  lotId: z.string(),
  order: z.number().nonnegative(),
  addedAt: z.date()
})

export const AddLotsToAuctionSchema = z.object({
  lotIds: z.array(z.string()).min(1, 'Выберите хотя бы один лот'),
  auctionId: z.string().optional()
})

export const ReorderAuctionLotsSchema = z.object({
  auctionId: z.string(),
  lotOrders: z.array(z.object({
    lotId: z.string(),
    order: z.number().nonnegative()
  }))
})

// History schemas
export const HistoryRecordSchema = z.object({
  id: z.string(),
  auctionId: z.string(),
  eventType: z.string(),
  payload: z.string(), // JSON string
  createdAt: z.date()
})

// Feedback schemas
export const FeedbackSchema = z.object({
  id: z.string(),
  theme: z.string(),
  description: z.string(),
  email: z.string().optional(),
  createdAt: z.date()
})

export const CreateFeedbackSchema = z.object({
  theme: z.string().min(1, 'Тема обязательна').max(255, 'Максимум 255 символов'),
  description: z.string().min(1, 'Описание обязательно').max(2000, 'Максимум 2000 символов'),
  email: z.string().email('Неверный формат email').optional().or(z.literal(''))
})

// CSV Import schemas
export const ImportLotCsvRowSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['games', 'movies']),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  genre: z.string().optional(),
  year: z.number().optional(),
  rating: z.number().optional()
})

export const ImportLotsCsvSchema = z.array(ImportLotCsvRowSchema)

// WebSocket message schemas
export const WebSocketMessageSchema = z.object({
  type: z.enum(['auction_status', 'timer_tick', 'lot_change', 'error']),
  payload: z.any()
})

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional()
})

export type User = z.infer<typeof UserSchema>
export type Lot = z.infer<typeof LotSchema>
export type CreateLot = z.infer<typeof CreateLotSchema>
export type UpdateLot = z.infer<typeof UpdateLotSchema>
export type Auction = z.infer<typeof AuctionSchema>
export type AuctionStatus = 'idle' | 'configured' | 'running' | 'paused' | 'finished' | 'archived'
export type AuctionConfig = z.infer<typeof AuctionConfigSchema>
export type AuctionLot = z.infer<typeof AuctionLotSchema>
export type AddLotsToAuction = z.infer<typeof AddLotsToAuctionSchema>
export type ReorderAuctionLots = z.infer<typeof ReorderAuctionLotsSchema>
export type HistoryRecord = z.infer<typeof HistoryRecordSchema>
export type Feedback = z.infer<typeof FeedbackSchema>
export type CreateFeedback = z.infer<typeof CreateFeedbackSchema>
export type ImportLotCsvRow = z.infer<typeof ImportLotCsvRowSchema>
export type ImportLotsCsv = z.infer<typeof ImportLotsCsvSchema>
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>