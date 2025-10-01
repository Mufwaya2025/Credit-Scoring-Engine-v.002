import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scoring-config/[id] - Get specific scoring configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = await db.scoringConfig.findUnique({
      where: { id: params.id }
    })
    
    if (!config) {
      return NextResponse.json(
        { error: 'Scoring configuration not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching scoring config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scoring configuration' },
      { status: 500 }
    )
  }
}

// PUT /api/scoring-config/[id] - Update scoring configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const config = await db.scoringConfig.update({
      where: { id: params.id },
      data: {
        factor: body.factor,
        name: body.name,
        description: body.description,
        maxPoints: body.maxPoints,
        weight: body.weight,
        thresholds: body.thresholds,
        category: body.category,
        isActive: body.isActive,
        configType: body.configType,
        calculationType: body.calculationType,
        minValue: body.minValue,
        maxValue: body.maxValue,
        optimalValue: body.optimalValue
      }
    })
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating scoring config:', error)
    return NextResponse.json(
      { error: 'Failed to update scoring configuration' },
      { status: 500 }
    )
  }
}

// DELETE /api/scoring-config/[id] - Delete scoring configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.scoringConfig.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting scoring config:', error)
    return NextResponse.json(
      { error: 'Failed to delete scoring configuration' },
      { status: 500 }
    )
  }
}