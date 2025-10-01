import { NextRequest, NextResponse } from 'next/server'
import { executeRules } from '../route'
import { z } from 'zod'

interface ApplicantData {
  age: number
  annualIncome: number
  loanAmount: number
  creditHistoryLength: number
  debtToIncomeRatio: number
  employmentStatus: string
  educationLevel: string
  monthlyExpenses: number
  existingLoanAmount: number
  creditUtilization: number
  latePayments12m: number
  recentInquiries: number
}

const ApplicantDataSchema = z.object({
  age: z.number().min(18).max(100),
  annualIncome: z.number().min(0),
  loanAmount: z.number().min(0),
  creditHistoryLength: z.number().min(0),
  debtToIncomeRatio: z.number().min(0).max(1),
  employmentStatus: z.string(),
  educationLevel: z.string(),
  monthlyExpenses: z.number().min(0),
  existingLoanAmount: z.number().min(0),
  creditUtilization: z.number().min(0).max(1),
  latePayments12m: z.number().min(0),
  recentInquiries: z.number().min(0)
})

// POST /api/rules/execute - Execute rules against applicant data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicantData, predictionId } = body
    
    // Validate applicant data
    const validatedData = ApplicantDataSchema.parse(applicantData)
    
    // Execute rules
    const results = await executeRules(validatedData, predictionId)
    
    return NextResponse.json(results)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid applicant data', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error executing rules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}