import { NextRequest, NextResponse } from 'next/server'
import { ScoreRangeService } from '@/lib/score-range'

export async function GET(request: NextRequest) {
  try {
    const validation = await ScoreRangeService.validateRanges()
    
    return NextResponse.json({ 
      success: true, 
      data: validation,
      message: validation.isValid ? 
        'Score ranges are valid (no overlaps or gaps)' : 
        `Found ${validation.overlaps.length} overlaps and ${validation.gaps.length} gaps`
    })
  } catch (error) {
    console.error('Error validating score ranges:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to validate score ranges' },
      { status: 500 }
    )
  }
}