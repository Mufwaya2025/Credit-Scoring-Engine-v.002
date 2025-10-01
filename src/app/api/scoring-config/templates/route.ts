import { NextRequest, NextResponse } from 'next/server'

// Pre-built scoring configuration templates
const templates = {
  conservative: {
    name: 'Conservative Scoring',
    description: 'Strict scoring with higher penalties for risk factors',
    configs: [
      {
        factor: 'age',
        name: 'Age Factor',
        description: 'Conservative age scoring',
        maxPoints: 40,
        weight: 1.2,
        thresholds: JSON.stringify({
          optimal: { min: 30, max: 50, points: 40 },
          good: { min: 25, max: 60, points: 30 },
          acceptable: { min: 20, max: 65, points: 15 }
        }),
        category: 'demographic',
        calculationType: 'threshold'
      },
      {
        factor: 'annualIncome',
        name: 'Annual Income',
        description: 'Conservative income requirements',
        maxPoints: 150,
        weight: 1.3,
        thresholds: JSON.stringify({
          multiplier: 1.5,
          cap: 80000
        }),
        category: 'financial',
        calculationType: 'linear'
      },
      {
        factor: 'debtToIncomeRatio',
        name: 'Debt-to-Income Ratio',
        description: 'Strict debt ratio limits',
        maxPoints: 100,
        weight: 1.5,
        thresholds: JSON.stringify({
          excellent: { max: 0.25, points: 100 },
          good: { max: 0.4, points: 60 },
          fair: { max: 0.5, points: 20 }
        }),
        category: 'financial',
        calculationType: 'threshold'
      }
    ]
  },
  
  aggressive: {
    name: 'Aggressive Scoring',
    description: 'Lenient scoring with higher rewards for positive factors',
    configs: [
      {
        factor: 'age',
        name: 'Age Factor',
        description: 'Aggressive age scoring',
        maxPoints: 60,
        weight: 0.8,
        thresholds: JSON.stringify({
          optimal: { min: 20, max: 60, points: 60 },
          good: { min: 18, max: 70, points: 50 },
          acceptable: { min: 16, max: 75, points: 30 }
        }),
        category: 'demographic',
        calculationType: 'threshold'
      },
      {
        factor: 'annualIncome',
        name: 'Annual Income',
        description: 'Aggressive income scoring',
        maxPoints: 250,
        weight: 0.7,
        thresholds: JSON.stringify({
          multiplier: 2.5,
          cap: 120000
        }),
        category: 'financial',
        calculationType: 'linear'
      },
      {
        factor: 'debtToIncomeRatio',
        name: 'Debt-to-Income Ratio',
        description: 'Lenient debt ratio limits',
        maxPoints: 60,
        weight: 0.8,
        thresholds: JSON.stringify({
          excellent: { max: 0.4, points: 60 },
          good: { max: 0.6, points: 40 },
          fair: { max: 0.8, points: 20 }
        }),
        category: 'financial',
        calculationType: 'threshold'
      }
    ]
  },
  
  balanced: {
    name: 'Balanced Scoring',
    description: 'Moderate scoring with balanced risk/reward',
    configs: [
      {
        factor: 'age',
        name: 'Age Factor',
        description: 'Balanced age scoring',
        maxPoints: 50,
        weight: 1.0,
        thresholds: JSON.stringify({
          optimal: { min: 25, max: 55, points: 50 },
          good: { min: 22, max: 65, points: 40 },
          acceptable: { min: 18, max: 70, points: 25 }
        }),
        category: 'demographic',
        calculationType: 'threshold'
      },
      {
        factor: 'annualIncome',
        name: 'Annual Income',
        description: 'Balanced income scoring',
        maxPoints: 200,
        weight: 1.0,
        thresholds: JSON.stringify({
          multiplier: 2.0,
          cap: 100000
        }),
        category: 'financial',
        calculationType: 'linear'
      },
      {
        factor: 'debtToIncomeRatio',
        name: 'Debt-to-Income Ratio',
        description: 'Balanced debt ratio limits',
        maxPoints: 80,
        weight: 1.0,
        thresholds: JSON.stringify({
          excellent: { max: 0.3, points: 80 },
          good: { max: 0.5, points: 50 },
          fair: { max: 0.7, points: 20 }
        }),
        category: 'financial',
        calculationType: 'threshold'
      }
    ]
  },
  
  'fico-like': {
    name: 'FICO-Like Scoring',
    description: 'Traditional credit scoring similar to FICO',
    configs: [
      {
        factor: 'age',
        name: 'Age Factor',
        description: 'FICO-like age scoring',
        maxPoints: 15,
        weight: 0.3,
        thresholds: JSON.stringify({
          optimal: { min: 30, max: 60, points: 15 },
          good: { min: 25, max: 65, points: 12 },
          acceptable: { min: 20, max: 70, points: 8 }
        }),
        category: 'demographic',
        calculationType: 'threshold'
      },
      {
        factor: 'annualIncome',
        name: 'Annual Income',
        description: 'FICO-like income scoring',
        maxPoints: 30,
        weight: 0.3,
        thresholds: JSON.stringify({
          multiplier: 0.3,
          cap: 100000
        }),
        category: 'financial',
        calculationType: 'linear'
      },
      {
        factor: 'creditHistoryLength',
        name: 'Credit History Length',
        description: 'FICO-like credit history scoring',
        maxPoints: 50,
        weight: 1.5,
        thresholds: JSON.stringify({
          multiplier: 5,
          cap: 10
        }),
        category: 'credit',
        calculationType: 'linear'
      }
    ]
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      templates: Object.keys(templates).map(key => ({
        id: key,
        name: templates[key as keyof typeof templates].name,
        description: templates[key as keyof typeof templates].description,
        configCount: templates[key as keyof typeof templates].configs.length
      }))
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateId } = await request.json()
    
    if (!templateId || !templates[templateId as keyof typeof templates]) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      )
    }
    
    const template = templates[templateId as keyof typeof templates]
    
    return NextResponse.json({
      template: {
        id: templateId,
        name: template.name,
        description: template.description,
        configs: template.configs
      }
    })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}