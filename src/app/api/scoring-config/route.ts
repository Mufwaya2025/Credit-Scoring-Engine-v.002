import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scoring-config - Get all scoring configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    
    const where = activeOnly ? { isActive: true } : {}
    
    const configs = await db.scoringConfig.findMany({
      where,
      orderBy: { category: 'asc' }
    })
    
    return NextResponse.json(configs)
  } catch (error) {
    console.error('Error fetching scoring configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scoring configurations' },
      { status: 500 }
    )
  }
}

// POST /api/scoring-config - Create new scoring configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const config = await db.scoringConfig.create({
      data: {
        factor: body.factor,
        name: body.name,
        description: body.description || null,
        maxPoints: body.maxPoints,
        weight: body.weight || 1.0,
        thresholds: body.thresholds || '{}',
        category: body.category || 'general',
        isActive: body.isActive !== false,
        configType: body.configType || 'static',
        calculationType: body.calculationType || 'linear',
        minValue: body.minValue || null,
        maxValue: body.maxValue || null,
        optimalValue: body.optimalValue || null
      }
    })
    
    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error('Error creating scoring config:', error)
    return NextResponse.json(
      { error: 'Failed to create scoring configuration' },
      { status: 500 }
    )
  }
}