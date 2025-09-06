import { NextRequest, NextResponse } from 'next/server'
import { prisma, handleDbError } from '@/lib/db'
import { AuctionConfigSchema } from '@/lib/validators'
import { isTransitionAllowed } from '@/lib/fsm/auction'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const where: any = {}
    
    if (status && ['idle', 'configured', 'running', 'paused', 'finished', 'archived'].includes(status)) {
      where.status = status
    }

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        include: {
          lots: {
            include: {
              lot: true
            },
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              lots: true,
              history: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.auction.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        auctions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('GET /api/auctions error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения аукционов' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = AuctionConfigSchema.parse(body)
    
    // Check if there's an active auction
    const activeAuction = await prisma.auction.findFirst({
      where: {
        status: {
          in: ['configured', 'running', 'paused']
        }
      }
    })

    if (activeAuction) {
      return NextResponse.json(
        { success: false, error: 'Есть активный аукцион' },
        { status: 400 }
      )
    }
    
    const auction = await prisma.auction.create({
      data: {
        mode: validatedData.mode,
        durationSec: validatedData.durationSec,
        status: 'idle'
      },
      include: {
        lots: {
          include: {
            lot: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: auction
    })
  } catch (error: any) {
    console.error('POST /api/auctions error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неверные данные',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    const dbError = handleDbError(error)
    return NextResponse.json(
      { success: false, error: dbError.message },
      { status: 500 }
    )
  }
}