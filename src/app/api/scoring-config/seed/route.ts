import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Default scoring configurations
const defaultConfigs = [
  {
    factor: 'age',
    name: 'Age Factor',
    description: 'Applicant age scoring',
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
    description: 'Annual income scoring',
    maxPoints: 200,
    weight: 1.0,
    thresholds: JSON.stringify({
      multiplier: 2,
      cap: 100000
    }),
    category: 'financial',
    calculationType: 'linear'
  },
  {
    factor: 'debtToIncomeRatio',
    name: 'Debt-to-Income Ratio',
    description: 'Debt-to-income ratio scoring (lower is better)',
    maxPoints: 80,
    weight: 1.0,
    thresholds: JSON.stringify({
      excellent: { max: 0.3, points: 80 },
      good: { max: 0.5, points: 50 },
      fair: { max: 0.7, points: 20 }
    }),
    category: 'financial',
    calculationType: 'threshold'
  },
  {
    factor: 'creditHistoryLength',
    name: 'Credit History Length',
    description: 'Length of credit history in years',
    maxPoints: 80,
    weight: 1.0,
    thresholds: JSON.stringify({
      multiplier: 8,
      cap: 10
    }),
    category: 'credit',
    calculationType: 'linear'
  },
  {
    factor: 'creditUtilization',
    name: 'Credit Utilization',
    description: 'Credit utilization ratio (lower is better)',
    maxPoints: 60,
    weight: 1.0,
    thresholds: JSON.stringify({
      excellent: { max: 0.3, points: 60 },
      good: { max: 0.5, points: 40 },
      fair: { max: 0.7, points: 20 }
    }),
    category: 'credit',
    calculationType: 'threshold'
  },
  {
    factor: 'employmentStatus',
    name: 'Employment Status',
    description: 'Employment status scoring',
    maxPoints: 60,
    weight: 1.0,
    thresholds: JSON.stringify({
      'Employed': 60,
      'Self-Employed': 50,
      'Retired': 55,
      'Unemployed': 0
    }),
    category: 'employment',
    calculationType: 'categorical'
  },
  {
    factor: 'educationLevel',
    name: 'Education Level',
    description: 'Education level scoring',
    maxPoints: 40,
    weight: 1.0,
    thresholds: JSON.stringify({
      'PhD': 40,
      'Master': 35,
      'Bachelor': 30,
      'Associate': 25,
      'High School': 15
    }),
    category: 'demographic',
    calculationType: 'categorical'
  },
  {
    factor: 'latePayments12m',
    name: 'Late Payments',
    description: 'Late payments penalty (negative scoring)',
    maxPoints: -15,
    weight: 1.0,
    thresholds: JSON.stringify({
      penalty: -15
    }),
    category: 'credit',
    calculationType: 'linear'
  },
  {
    factor: 'recentInquiries',
    name: 'Recent Inquiries',
    description: 'Recent credit inquiries penalty (negative scoring)',
    maxPoints: -10,
    weight: 1.0,
    thresholds: JSON.stringify({
      penalty: -10
    }),
    category: 'credit',
    calculationType: 'linear'
  }
]

export async function POST(request: NextRequest) {
  try {
    // Clear existing configurations
    await db.scoringConfig.deleteMany({})
    
    // Create default configurations
    const configs = await Promise.all(
      defaultConfigs.map(config => 
        db.scoringConfig.create({ data: config })
      )
    )
    
    return NextResponse.json({
      message: 'Default scoring configurations seeded successfully',
      configs,
      count: configs.length
    })
  } catch (error) {
    console.error('Error seeding scoring configs:', error)
    return NextResponse.json(
      { error: 'Failed to seed scoring configurations' },
      { status: 500 }
    )
  }
}