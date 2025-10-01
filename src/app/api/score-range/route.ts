import { NextRequest, NextResponse } from 'next/server'
import { ScoreRangeService } from '@/lib/score-range'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    let ranges
    if (active === 'true') {
      ranges = await ScoreRangeService.getActive()
    } else {
      ranges = await ScoreRangeService.getAll()
    }

    return NextResponse.json({ success: true, data: ranges })
  } catch (error) {
    console.error('Error fetching score ranges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch score ranges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const range = await ScoreRangeService.create(body)
    
    return NextResponse.json({ success: true, data: range }, { status: 201 })
  } catch (error) {
    console.error('Error creating score range:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create score range' },
      { status: 500 }
    )
  }
}