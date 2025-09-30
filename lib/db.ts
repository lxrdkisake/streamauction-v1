import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Database utility functions
 */

export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}

export async function disconnectDB() {
  await prisma.$disconnect()
}

/**
 * Helper function to handle database errors
 */
export function handleDbError(error: any): { message: string; code?: string } {
  console.error('Database error:', error)
  
  if (error.code === 'P2002') {
    return { message: 'Запись с такими данными уже существует', code: 'DUPLICATE' }
  }
  
  if (error.code === 'P2025') {
    return { message: 'Запись не найдена', code: 'NOT_FOUND' }
  }
  
  if (error.code === 'P2003') {
    return { message: 'Нарушение внешнего ключа', code: 'FOREIGN_KEY' }
  }
  
  return { message: 'Ошибка базы данных', code: 'UNKNOWN' }
}