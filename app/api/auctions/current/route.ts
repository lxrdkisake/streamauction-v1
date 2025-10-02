import { NextRequest, NextResponse } from 'next/server'
import { prisma, handleDbError } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const auction = await prisma.auction.findFirst({
      where: {
        status: {
          in: ['configured', 'running', 'paused']
        }
      },
      include: {
        lots: {
          include: {
            lot: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!auction) {
      return NextResponse.json({
        success: true,
        data: null
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        auction,
        lots: auction.lots
      }
    })
  } catch (error) {
    console.error('GET /api/auctions/current error:', error)
    const dbError = handleDbError(error)
    return NextResponse.json(
      { success: false, error: dbError.message },
      { status: 500 }
    )
  }
}