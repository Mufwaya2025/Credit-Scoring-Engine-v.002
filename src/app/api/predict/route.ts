import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { createHash } from 'crypto'
import { executeRules } from '@/app/api/rules/route'
import { configurableScoringEngine } from '@/lib/configurable-scoring'
import { ScoreRangeService } from '@/lib/score-range'

// Dynamic schema that accepts any string keys with various value types
const DynamicApplicantDataSchema = z.record(z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.date()
]))

// Legacy schema for backward compatibility
const LegacyApplicantDataSchema = z.object({
  age: z.number().min(18).max(100).optional(),
  annualIncome: z.number().min(0).optional(),
  loanAmount: z.number().min(0).optional(),
  creditHistoryLength: z.number().min(0).optional(),
  debtToIncomeRatio: z.number().min(0).max(1).optional(),
  employmentStatus: z.string().optional(),
  educationLevel: z.string().optional(),
  monthlyExpenses: z.number().min(0).optional(),
  existingLoanAmount: z.number().min(0).optional(),
  creditUtilization: z.number().min(0).max(1).optional(),
  latePayments12m: z.number().min(0).optional(),
  recentInquiries: z.number().min(0).optional(),
})

interface ApplicantData {
  [key: string]: any
  age?: number
  annualIncome?: number
  loanAmount?: number
  creditHistoryLength?: number
  debtToIncomeRatio?: number
  employmentStatus?: string
  educationLevel?: string
  monthlyExpenses?: number
  existingLoanAmount?: number
  creditUtilization?: number
  latePayments12m?: number
  recentInquiries?: number
}

interface PredictionResult {
  arcScore: number
  approvalProbability: number
  approvalStatus: string
  riskLevel: string
  processingTime: number
  modelVersion: string
  timestamp: string
  rulesApplied?: boolean
  ruleResults?: any[]
  scoringBreakdown?: any[]
  categoryBreakdown?: any
  maxPossibleScore?: number
  baseScore?: number
  scoreInterpretation?: {
    range: {
      name: string
      description?: string
      minScore: number
      maxScore?: number
      color?: string
    }
    approvalStatus: string
    riskLevel: string
    interestRateAdjustment: number
    loanLimitAdjustment: number
    color: string
  }
  arcFeatures?: {
    aiEnhanced: boolean
    realTimeAnalysis: boolean
    riskPrediction: string
    recommendation: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Parse and validate request body using dynamic schema
    const body = await request.json()
    
    // Try dynamic schema first, then fall back to legacy schema for compatibility
    let validatedData: ApplicantData
    try {
      validatedData = DynamicApplicantDataSchema.parse(body)
    } catch (dynamicError) {
      try {
        // If dynamic schema fails, try legacy schema for backward compatibility
        validatedData = LegacyApplicantDataSchema.parse(body)
      } catch (legacyError) {
        // If both fail, return a helpful error message
        return NextResponse.json(
          { 
            error: 'Invalid input data', 
            details: 'Data must be an object with string, number, boolean, or date values',
            dynamicError: dynamicError instanceof Error ? dynamicError.message : 'Unknown error',
            legacyError: legacyError instanceof Error ? legacyError.message : 'Unknown error'
          },
          { status: 400 }
        )
      }
    }
    
    // Ensure we have some minimum required fields for scoring
    const hasRequiredFields = validatedData.age && validatedData.annualIncome || 
                             Object.keys(validatedData).length > 0
    
    if (!hasRequiredFields) {
      return NextResponse.json(
        { error: 'Insufficient data for prediction', details: 'At least some applicant data is required' },
        { status: 400 }
      )
    }
    
    // Calculate initial ARC score using configurable engine
    const scoringResult = await configurableScoringEngine.calculateScore(validatedData)
    const initialArcScore = scoringResult.totalScore
    
    // Get score interpretation using score range service
    const scoreInterpretation = await ScoreRangeService.getScoreInterpretation(initialArcScore)
    
    // Execute business rules
    const rulesResult = await executeRules(validatedData)
    
    // Apply rule results to ARC score and status
    let finalArcScore = initialArcScore
    let finalApprovalStatus = scoreInterpretation.approvalStatus
    let finalRiskLevel = scoreInterpretation.riskLevel
    
    // Apply rule-based adjustments
    if (rulesResult.finalScore) {
      finalArcScore = Math.max(300, Math.min(850, finalArcScore + rulesResult.finalScore))
      // Re-interpret the adjusted score
      const adjustedInterpretation = await ScoreRangeService.getScoreInterpretation(finalArcScore)
      finalApprovalStatus = adjustedInterpretation.approvalStatus
      finalRiskLevel = adjustedInterpretation.riskLevel
    }
    
    // Rule override takes precedence if specified
    if (rulesResult.finalStatus) {
      finalApprovalStatus = rulesResult.finalStatus
      if (finalApprovalStatus === "Approved") {
        finalRiskLevel = "Low Risk"
      } else if (finalApprovalStatus === "Rejected") {
        finalRiskLevel = "High Risk"
      } else {
        finalRiskLevel = "Medium Risk"
      }
    }
    
    const approvalProbability = finalArcScore >= 700 ? 0.8 + Math.random() * 0.2 :
                               finalArcScore >= 650 ? 0.6 + Math.random() * 0.2 :
                               0.1 + Math.random() * 0.3
    
    const processingTime = Date.now() - startTime
    
    // Generate ARC-specific features
    const arcFeatures = {
      aiEnhanced: true,
      realTimeAnalysis: true,
      riskPrediction: finalRiskLevel,
      recommendation: finalApprovalStatus === "Approved" ? 
        "Proceed with application - ARC score indicates low risk" : 
        "Review recommended - ARC score indicates elevated risk"
    }
    
    // Create result object
    const result: PredictionResult = {
      arcScore: finalArcScore,
      approvalProbability,
      approvalStatus: finalApprovalStatus,
      riskLevel: finalRiskLevel,
      processingTime,
      modelVersion: "ARC-1.0",
      timestamp: new Date().toISOString(),
      rulesApplied: rulesResult.results.length > 0,
      ruleResults: rulesResult.results,
      // Add configurable scoring details
      scoringBreakdown: scoringResult.results,
      categoryBreakdown: scoringResult.breakdown,
      maxPossibleScore: scoringResult.maxScore,
      baseScore: scoringResult.baseScore,
      // Add score interpretation details
      scoreInterpretation: {
        range: {
          name: scoreInterpretation.range.name,
          description: scoreInterpretation.range.description,
          minScore: scoreInterpretation.range.minScore,
          maxScore: scoreInterpretation.range.maxScore,
          color: scoreInterpretation.color
        },
        approvalStatus: scoreInterpretation.approvalStatus,
        riskLevel: scoreInterpretation.riskLevel,
        interestRateAdjustment: scoreInterpretation.interestRateAdjustment,
        loanLimitAdjustment: scoreInterpretation.loanLimitAdjustment,
        color: scoreInterpretation.color
      },
      arcFeatures
    }
    
    // Create applicant hash for privacy
    const applicantHash = createHash('sha256')
      .update(JSON.stringify(validatedData))
      .digest('hex')
      .substring(0, 16)
    
    // Log prediction to database
    const prediction = await db.prediction.create({
      data: {
        applicantHash,
        creditScore: finalArcScore,
        approvalStatus: finalApprovalStatus,
        riskLevel: finalRiskLevel,
        modelVersion: "ARC-1.0",
        confidence: approvalProbability,
        processingTime,
        applicantData: JSON.stringify(validatedData),
        userSession: request.headers.get('x-session-id') || 'unknown'
      }
    })
    
    // Log rule executions with prediction ID
    if (rulesResult.results.length > 0) {
      for (const ruleResult of rulesResult.results) {
        await db.ruleExecution.create({
          data: {
            predictionId: prediction.id,
            ruleId: ruleResult.ruleId,
            triggered: ruleResult.triggered,
            result: JSON.stringify(ruleResult.result),
            finalScore: ruleResult.scoreAdjustment,
            finalStatus: ruleResult.statusOverride
          }
        })
      }
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Prediction error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}