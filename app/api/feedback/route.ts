import { NextRequest, NextResponse } from 'next/server'
import { prisma, handleDbError } from '@/lib/db'
import { CreateFeedbackSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.feedback.count()
    ])

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('GET /api/feedback error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения обратной связи' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateFeedbackSchema.parse(body)
    
    const feedback = await prisma.feedback.create({
      data: {
        theme: validatedData.theme,
        description: validatedData.description,
        email: validatedData.email || null
      }
    })

    return NextResponse.json({
      success: true,
      data: feedback
    })
  } catch (error: any) {
    console.error('POST /api/feedback error:', error)
    
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