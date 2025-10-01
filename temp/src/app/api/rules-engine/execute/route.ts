import { NextRequest, NextResponse } from 'next/server';
import { SafeExpressionEvaluator } from '@/lib/safe-expression-evaluator';
import { requireAuth } from '@/lib/auth/utils';

// Import the rules storage from the main rules engine
const rulesStorage = new Map<string, any>();

// Rate limiting storage (in-memory for demo, use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

/**
 * Apply rate limiting to the request
 */
function applyRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);
  
  if (!limit) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (now > limit.resetTime) {
    // Reset window
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  limit.count++;
  return true;
}

/**
 * Validate applicant data
 */
function validateApplicantData(data: any): { valid: boolean; sanitized: any; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Applicant data must be an object' };
  }
  
  const sanitized: any = {};
  
  // Sanitize and validate each field
  const fields = ['creditScore', 'debtToIncomeRatio', 'age', 'income'];
  
  for (const field of fields) {
    if (data[field] !== undefined) {
      const value = Number(data[field]);
      if (isNaN(value)) {
        return { valid: false, error: `Invalid value for ${field}: must be a number` };
      }
      sanitized[field] = value;
    }
  }
  
  return { valid: true, sanitized };
}

/**
 * Execute a single rule
 */
function executeRule(rule: any, applicantData: any): { triggered: boolean; result: string } {
  if (!rule.isActive) {
    return { triggered: false, result: 'Rule is inactive' };
  }
  
  try {
    // Evaluate the condition using safe expression evaluator
    const conditionResult = SafeExpressionEvaluator.evaluate(rule.condition, applicantData);
    
    if (typeof conditionResult === 'number') {
      const triggered = conditionResult !== 0; // Non-zero means true
      return {
        triggered,
        result: triggered ? `Rule triggered: ${rule.action}` : `Rule not triggered: condition false`
      };
    } else {
      return {
        triggered: false,
        result: `Rule execution failed: ${conditionResult.error}`
      };
    }
  } catch (error) {
    return {
      triggered: false,
      result: `Rule execution error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }
    
    // Get client IP for rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Apply rate limiting
    if (!applyRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse and validate input
    const data = await request.json();
    const validation = validateApplicantData(data.applicantData || {});
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid applicant data' },
        { status: 400 }
      );
    }
    
    const applicantData = validation.sanitized;
    
    // Get all active rules (in a real app, this would come from a database)
    // For demo purposes, we'll use some default rules
    const defaultRules = [
      {
        id: "1",
        name: "High Debt-to-Income Ratio",
        description: "Flag applicants with debt-to-income ratio above 40%",
        condition: "debtToIncomeRatio > 40",
        action: "FLAG_HIGH_DEBT",
        isActive: true,
        priority: 1
      },
      {
        id: "2", 
        name: "Low Credit Score",
        description: "Flag applicants with credit score below 600",
        condition: "creditScore < 600",
        action: "FLAG_LOW_SCORE",
        isActive: true,
        priority: 2
      },
      {
        id: "3",
        name: "Young Applicant",
        description: "Additional review for applicants under 25",
        condition: "age < 25",
        action: "REQUIRE_ADDITIONAL_REVIEW",
        isActive: true,
        priority: 3
      }
    ];
    
    // Execute rules
    const results: any[] = [];
    
    for (const rule of defaultRules) {
      const execution = executeRule(rule, applicantData);
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: execution.triggered,
        result: execution.result,
        timestamp: new Date().toISOString()
      });
    }
    
    // Return response with security headers
    return NextResponse.json(results, {
      headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private'
      }
    });
    
  } catch (error) {
    console.error('Rules execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
