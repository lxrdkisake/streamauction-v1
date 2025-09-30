import { NextRequest, NextResponse } from 'next/server'
import { prisma, handleDbError } from '@/lib/db'
import { AddLotsToAuctionSchema, ReorderAuctionLotsSchema } from '@/lib/validators'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = AddLotsToAuctionSchema.parse(body)
    
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        lots: true
      }
    })

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Аукцион не найден' },
        { status: 404 }
      )
    }

    // Only allow adding lots to idle or configured auctions
    if (!['idle', 'configured'].includes(auction.status)) {
      return NextResponse.json(
        { success: false, error: 'Нельзя изменять лоты активного аукциона' },
        { status: 400 }
      )
    }

    // Get current max order
    const maxOrder = auction.lots.length > 0 
      ? Math.max(...auction.lots.map(al => al.order))
      : 0

    // Create auction lots
    const auctionLots = []
    for (let i = 0; i < validatedData.lotIds.length; i++) {
      const lotId = validatedData.lotIds[i]
      
      // Check if lot already exists in auction
      const existing = auction.lots.find(al => al.lotId === lotId)
      if (existing) continue

      try {
        const auctionLot = await prisma.auctionLot.create({
          data: {
            auctionId: params.id,
            lotId,
            order: maxOrder + i + 1
          },
          include: {
            lot: true
          }
        })
        auctionLots.push(auctionLot)
      } catch (error) {
        // Skip if lot doesn't exist or duplicate key error
        console.warn(`Failed to add lot ${lotId} to auction:`, error)
      }
    }

    // Update auction status to configured if it was idle and has lots
    if (auction.status === 'idle' && (auction.lots.length + auctionLots.length) > 0) {
      await prisma.auction.update({
        where: { id: params.id },
        data: { status: 'configured' }
      })
    }

    return NextResponse.json({
      success: true,
      data: auctionLots
    })
  } catch (error: any) {
    console.error('POST /api/auctions/[id]/lots error:', error)
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = ReorderAuctionLotsSchema.parse(body)
    
    const auction = await prisma.auction.findUnique({
      where: { id: params.id }
    })

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Аукцион не найден' },
        { status: 404 }
      )
    }

    // Only allow reordering lots for idle or configured auctions
    if (!['idle', 'configured'].includes(auction.status)) {
      return NextResponse.json(
        { success: false, error: 'Нельзя изменять порядок лотов активного аукциона' },
        { status: 400 }
      )
    }

    // Update orders in transaction
    await prisma.$transaction(
      validatedData.lotOrders.map(({ lotId, order }) =>
        prisma.auctionLot.updateMany({
          where: {
            auctionId: params.id,
            lotId: lotId
          },
          data: { order }
        })
      )
    )

    // Get updated auction lots
    const updatedLots = await prisma.auctionLot.findMany({
      where: { auctionId: params.id },
      include: {
        lot: true
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: updatedLots
    })
  } catch (error: any) {
    console.error('PUT /api/auctions/[id]/lots error:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const lotIds = searchParams.getAll('lotId')
    
    if (lotIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Не указаны лоты для удаления' },
        { status: 400 }
      )
    }

    const auction = await prisma.auction.findUnique({
      where: { id: params.id }
    })

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Аукцион не найден' },
        { status: 404 }
      )
    }

    // Only allow removing lots from idle or configured auctions
    if (!['idle', 'configured'].includes(auction.status)) {
      return NextResponse.json(
        { success: false, error: 'Нельзя удалять лоты из активного аукциона' },
        { status: 400 }
      )
    }

    // Remove auction lots
    await prisma.auctionLot.deleteMany({
      where: {
        auctionId: params.id,
        lotId: {
          in: lotIds
        }
      }
    })

    // Check if auction should go back to idle status
    const remainingLots = await prisma.auctionLot.count({
      where: { auctionId: params.id }
    })

    if (remainingLots === 0 && auction.status === 'configured') {
      await prisma.auction.update({
        where: { id: params.id },
        data: { status: 'idle' }
      })
    }

    return NextResponse.json({
      success: true,
      data: { removedLotIds: lotIds }
    })
  } catch (error) {
    console.error('DELETE /api/auctions/[id]/lots error:', error)
    
    const dbError = handleDbError(error)
    return NextResponse.json(
      { success: false, error: dbError.message },
      { status: 500 }
    )
  }
}