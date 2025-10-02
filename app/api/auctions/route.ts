import { NextRequest, NextResponse } from 'next/server'
import { prisma, handleDbError } from '@/lib/db'

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
    const { mode, durationSec } = body
    
    // Validate input
    if (!mode || !['cards', 'roulette'].includes(mode)) {
      return NextResponse.json(
        { success: false, error: 'Неверный режим аукциона' },
        { status: 400 }
      )
    }
    
    if (!durationSec || durationSec < 10 || durationSec > 600) {
      return NextResponse.json(
        { success: false, error: 'Длительность должна быть от 10 до 600 секунд' },
        { status: 400 }
      )
    }
    
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
        mode,
        durationSec,
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
    
    const dbError = handleDbError(error)
    return NextResponse.json(
      { success: false, error: dbError.message },
      { status: 500 }
    )
  }
}