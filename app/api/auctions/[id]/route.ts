import { NextRequest, NextResponse } from 'next/server'
import { prisma, handleDbError } from '@/lib/db'
import { isTransitionAllowed } from '@/lib/fsm/auction'
import type { AuctionStatus } from '@/lib/validators'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        lots: {
          include: {
            lot: true
          },
          orderBy: { order: 'asc' }
        },
        history: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Аукцион не найден' },
        { status: 404 }
      )
    }

    // Parse history payloads
    const parsedHistory = auction.history.map(record => ({
      ...record,
      payload: record.payload ? JSON.parse(record.payload) : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        ...auction,
        history: parsedHistory
      }
    })
  } catch (error) {
    console.error('GET /api/auctions/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения аукциона' },
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
    const { status, ...updateData } = body

    const auction = await prisma.auction.findUnique({
      where: { id: params.id }
    })

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Аукцион не найден' },
        { status: 404 }
      )
    }

    // Validate FSM transition if status is being updated
    if (status && status !== auction.status) {
      if (!isTransitionAllowed(auction.status as AuctionStatus, status as AuctionStatus)) {
        return NextResponse.json(
          { success: false, error: 'Недопустимый переход состояния' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const now = new Date()
    const updates: any = { ...updateData }
    
    if (status) {
      updates.status = status
      
      // Set timestamps based on status
      if (status === 'running' && auction.status !== 'paused') {
        updates.startedAt = now
      }
      
      if (status === 'finished') {
        updates.finishedAt = now
      }
    }

    const updatedAuction = await prisma.auction.update({
      where: { id: params.id },
      data: updates,
      include: {
        lots: {
          include: {
            lot: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    // Log history event if status changed
    if (status && status !== auction.status) {
      await prisma.historyRecord.create({
        data: {
          auctionId: params.id,
          eventType: `auction_${status}`,
          payload: JSON.stringify({
            previousStatus: auction.status,
            newStatus: status,
            timestamp: now.toISOString()
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedAuction
    })
  } catch (error: any) {
    console.error('PUT /api/auctions/[id] error:', error)
    
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
    const auction = await prisma.auction.findUnique({
      where: { id: params.id }
    })

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Аукцион не найден' },
        { status: 404 }
      )
    }

    // Only allow deletion of idle or archived auctions
    if (!['idle', 'archived'].includes(auction.status)) {
      return NextResponse.json(
        { success: false, error: 'Можно удалить только неактивные аукционы' },
        { status: 400 }
      )
    }

    await prisma.auction.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      data: { id: params.id }
    })
  } catch (error) {
    console.error('DELETE /api/auctions/[id] error:', error)
    
    const dbError = handleDbError(error)
    return NextResponse.json(
      { success: false, error: dbError.message },
      { status: 500 }
    )
  }
}