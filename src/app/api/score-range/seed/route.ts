import { NextRequest, NextResponse } from 'next/server'
import { ScoreRangeService } from '@/lib/score-range'

export async function POST(request: NextRequest) {
  try {
    const ranges = await ScoreRangeService.seedDefaults()
    
    return NextResponse.json({ 
      success: true, 
      data: ranges,
      message: `Successfully seeded ${ranges.length} score ranges`
    })
  } catch (error) {
    console.error('Error seeding score ranges:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to seed score ranges' },
      { status: 500 }
    )
  }
}