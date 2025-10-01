import { NextRequest, NextResponse } from 'next/server'
import { ApplicantFieldService } from '@/lib/applicant-field'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const field = await ApplicantFieldService.getById(params.id)
    
    if (!field) {
      return NextResponse.json(
        { success: false, error: 'Applicant field not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: field })
  } catch (error) {
    console.error('Error fetching applicant field:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applicant field' },
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
    const field = await ApplicantFieldService.update({ ...body, id: params.id })
    
    return NextResponse.json({ success: true, data: field })
  } catch (error) {
    console.error('Error updating applicant field:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update applicant field' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const field = await ApplicantFieldService.delete(params.id)
    
    return NextResponse.json({ success: true, data: field })
  } catch (error) {
    console.error('Error deleting applicant field:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete applicant field' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const field = await ApplicantFieldService.toggleActive(params.id)
    
    return NextResponse.json({ success: true, data: field })
  } catch (error) {
    console.error('Error toggling applicant field:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to toggle applicant field' },
      { status: 500 }
    )
  }
}