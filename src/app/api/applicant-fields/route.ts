import { NextRequest, NextResponse } from 'next/server'
import { ApplicantFieldService } from '@/lib/applicant-field'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    let fields
    if (category) {
      fields = await ApplicantFieldService.getByCategory(category as any)
    } else if (active === 'true') {
      fields = await ApplicantFieldService.getActive()
    } else {
      fields = await ApplicantFieldService.getAll()
    }

    return NextResponse.json({ success: true, data: fields })
  } catch (error) {
    console.error('Error fetching applicant fields:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applicant fields' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const field = await ApplicantFieldService.create(body)
    
    return NextResponse.json({ success: true, data: field }, { status: 201 })
  } catch (error) {
    console.error('Error creating applicant field:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create applicant field' },
      { status: 500 }
    )
  }
}