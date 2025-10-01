import { NextRequest, NextResponse } from 'next/server'
import { ScoreRangeService } from '@/lib/score-range'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const range = await ScoreRangeService.getById(params.id)
    
    if (!range) {
      return NextResponse.json(
        { success: false, error: 'Score range not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: range })
  } catch (error) {
    console.error('Error fetching score range:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch score range' },
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
    const range = await ScoreRangeService.update({ ...body, id: params.id })
    
    return NextResponse.json({ success: true, data: range })
  } catch (error) {
    console.error('Error updating score range:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update score range' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const range = await ScoreRangeService.delete(params.id)
    
    return NextResponse.json({ success: true, data: range })
  } catch (error) {
    console.error('Error deleting score range:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete score range' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const range = await ScoreRangeService.toggleActive(params.id)
    
    return NextResponse.json({ success: true, data: range })
  } catch (error) {
    console.error('Error toggling score range:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to toggle score range' },
      { status: 500 }
    )
  }
}