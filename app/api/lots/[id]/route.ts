import { NextRequest, NextResponse } from 'next/server'
import { prisma, handleDbError } from '@/lib/db'
import { UpdateLotSchema } from '@/lib/validators'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lot = await prisma.lot.findUnique({
      where: { id: params.id }
    })

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Лот не найден' },
        { status: 404 }
      )
    }

    const parsedLot = {
      ...lot,
      meta: lot.meta ? JSON.parse(lot.meta) : null
    }

    return NextResponse.json({
      success: true,
      data: parsedLot
    })
  } catch (error) {
    console.error('GET /api/lots/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения лота' },
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
    const validatedData = UpdateLotSchema.parse(body)
    
    const lot = await prisma.lot.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        meta: validatedData.meta ? JSON.stringify(validatedData.meta) : undefined,
        imageUrl: validatedData.imageUrl === '' ? null : validatedData.imageUrl
      }
    })

    const parsedLot = {
      ...lot,
      meta: lot.meta ? JSON.parse(lot.meta) : null
    }

    return NextResponse.json({
      success: true,
      data: parsedLot
    })
  } catch (error: any) {
    console.error('PUT /api/lots/[id] error:', error)
    
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
    await prisma.lot.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      data: { id: params.id }
    })
  } catch (error) {
    console.error('DELETE /api/lots/[id] error:', error)
    
    const dbError = handleDbError(error)
    return NextResponse.json(
      { success: false, error: dbError.message },
      { status: 500 }
    )
  }
}