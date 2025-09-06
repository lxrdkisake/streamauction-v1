import { NextRequest, NextResponse } from 'next/server'
import { prisma, handleDbError } from '@/lib/db'
import { CreateLotSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category && (category === 'games' || category === 'movies')) {
      where.category = category
    }

    const [lots, total] = await Promise.all([
      prisma.lot.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.lot.count({ where })
    ])

    const parsedLots = lots.map(lot => ({
      ...lot,
      meta: lot.meta ? JSON.parse(lot.meta) : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        lots: parsedLots,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('GET /api/lots error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения лотов' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateLotSchema.parse(body)
    
    const lot = await prisma.lot.create({
      data: {
        ...validatedData,
        meta: validatedData.meta ? JSON.stringify(validatedData.meta) : null,
        imageUrl: validatedData.imageUrl || null
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
    console.error('POST /api/lots error:', error)
    
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