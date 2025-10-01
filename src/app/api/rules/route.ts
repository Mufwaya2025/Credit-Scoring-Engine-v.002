import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Define schemas
const CreateRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["eligibility", "risk", "pricing", "limit"]),
  category: z.string(),
  condition: z.string(),
  action: z.enum(["approve", "reject", "flag", "adjust_score", "adjust_limit"]),
  actionValue: z.string().optional(),
  priority: z.number().min(1).max(10),
  isActive: z.boolean().default(true),
  weight: z.number().min(0.1).max(3.0).default(1.0)
})

const UpdateRuleSchema = CreateRuleSchema.partial()

interface RuleCondition {
  field: string
  operator: string
  value: any
}

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

interface RuleExecutionResult {
  ruleId: string
  triggered: boolean
  action: string
  result: any
  scoreAdjustment?: number
  statusOverride?: string
  limitAdjustment?: number
}

// Helper function to evaluate rule conditions
function evaluateCondition(condition: RuleCondition, applicantData: ApplicantData): boolean {
  const { field, operator, value } = condition
  
  // Map field names to applicant data
  const fieldMap: Record<string, keyof ApplicantData> = {
    'age': 'age',
    'annualIncome': 'annualIncome',
    'loanAmount': 'loanAmount',
    'creditHistoryLength': 'creditHistoryLength',
    'debtToIncomeRatio': 'debtToIncomeRatio',
    'employmentStatus': 'employmentStatus',
    'educationLevel': 'educationLevel',
    'monthlyExpenses': 'monthlyExpenses',
    'existingLoanAmount': 'existingLoanAmount',
    'creditUtilization': 'creditUtilization',
    'latePayments12m': 'latePayments12m',
    'recentInquiries': 'recentInquiries'
  }
  
  const fieldValue = applicantData[fieldMap[field] || field]
  
  switch (operator) {
    case '>':
      return fieldValue > value
    case '<':
      return fieldValue < value
    case '>=':
      return fieldValue >= value
    case '<=':
      return fieldValue <= value
    case '==':
      return fieldValue === value
    case '!=':
      return fieldValue !== value
    case 'includes':
      return String(fieldValue).includes(value)
    case 'startsWith':
      return String(fieldValue).startsWith(value)
    case 'endsWith':
      return String(fieldValue).endsWith(value)
    default:
      return false
  }
}

// Helper function to execute rule action
function executeAction(action: string, actionValue: string | undefined): any {
  if (!actionValue) return { success: true }
  
  try {
    const parsedValue = JSON.parse(actionValue)
    
    switch (action) {
      case 'approve':
        return { success: true, status: 'Approved', reason: parsedValue.reason || 'Rule-based approval' }
      
      case 'reject':
        return { success: true, status: 'Rejected', reason: parsedValue.reason || 'Rule-based rejection' }
      
      case 'flag':
        return { success: true, flag: parsedValue.flag || 'Review required' }
      
      case 'adjust_score':
        return { 
          success: true, 
          scoreAdjustment: parsedValue.adjustment || 0,
          reason: parsedValue.reason || 'Score adjusted by rule'
        }
      
      case 'adjust_limit':
        return { 
          success: true, 
          limitAdjustment: parsedValue.adjustment || 0,
          multiplier: parsedValue.multiplier || 1,
          maxAmount: parsedValue.maxAmount
        }
      
      default:
        return { success: false, error: 'Unknown action' }
    }
  } catch (error) {
    return { success: false, error: 'Invalid action value' }
  }
}

// GET /api/rules - Get all rules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const active = searchParams.get('active')
    
    const where: any = {}
    if (type) where.type = type
    if (active !== null) where.isActive = active === 'true'
    
    const rules = await db.rule.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    return NextResponse.json(rules)
  } catch (error) {
    console.error('Error fetching rules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/rules - Create new rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateRuleSchema.parse(body)
    
    const rule = await db.rule.create({
      data: validatedData
    })
    
    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Zod validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating rule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Execute rules against applicant data
export async function executeRules(applicantData: ApplicantData, predictionId?: string): Promise<{
  results: RuleExecutionResult[]
  finalScore?: number
  finalStatus?: string
  finalLimit?: number
}> {
  try {
    // Get all active rules, ordered by priority
    const rules = await db.rule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' }
    })
    
    const results: RuleExecutionResult[] = []
    let totalScoreAdjustment = 0
    let finalStatus: string | undefined
    let finalLimit: number | undefined
    
    for (const rule of rules) {
      try {
        const condition: RuleCondition = JSON.parse(rule.condition)
        const triggered = evaluateCondition(condition, applicantData)
        
        const actionResult = executeAction(rule.action, rule.actionValue)
        
        const result: RuleExecutionResult = {
          ruleId: rule.id,
          triggered,
          action: rule.action,
          result: actionResult
        }
        
        // Apply score adjustments
        if (actionResult.scoreAdjustment) {
          totalScoreAdjustment += actionResult.scoreAdjustment
          result.scoreAdjustment = actionResult.scoreAdjustment
        }
        
        // Apply status overrides
        if (actionResult.status) {
          finalStatus = actionResult.status
          result.statusOverride = actionResult.status
        }
        
        // Apply limit adjustments
        if (actionResult.limitAdjustment) {
          finalLimit = (finalLimit || 0) + actionResult.limitAdjustment
          result.limitAdjustment = actionResult.limitAdjustment
        }
        
        results.push(result)
        
        // Log rule execution
        if (predictionId) {
          await db.ruleExecution.create({
            data: {
              predictionId,
              ruleId: rule.id,
              triggered,
              result: JSON.stringify(actionResult),
              finalScore: totalScoreAdjustment !== 0 ? undefined : totalScoreAdjustment,
              finalStatus: finalStatus
            }
          })
        }
        
      } catch (error) {
        console.error(`Error executing rule ${rule.id}:`, error)
        results.push({
          ruleId: rule.id,
          triggered: false,
          action: rule.action,
          result: { success: false, error: 'Rule execution failed' }
        })
      }
    }
    
    return {
      results,
      finalScore: totalScoreAdjustment !== 0 ? totalScoreAdjustment : undefined,
      finalStatus,
      finalLimit
    }
    
  } catch (error) {
    console.error('Error executing rules:', error)
    return {
      results: [],
      finalScore: undefined,
      finalStatus: undefined,
      finalLimit: undefined
    }
  }
}