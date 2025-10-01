import { NextRequest, NextResponse } from 'next/server'
import { ApplicantFieldService } from '@/lib/applicant-field'

export async function POST(request: NextRequest) {
  try {
    const fields = await ApplicantFieldService.seedDefaults()
    
    return NextResponse.json({ 
      success: true, 
      data: fields,
      message: `Successfully seeded ${fields.length} applicant fields`
    })
  } catch (error) {
    console.error('Error seeding applicant fields:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to seed applicant fields' },
      { status: 500 }
    )
  }
}