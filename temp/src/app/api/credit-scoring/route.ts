import { NextRequest, NextResponse } from 'next/server';
import { SafeExpressionEvaluator } from '@/lib/safe-expression-evaluator';
import { requireAuth } from '@/lib/auth/utils';

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
 * Validate and sanitize input data
 */
function validateAndSanitizeInput(data: any): { valid: boolean; sanitized: any; error?: string } {
  const requiredFields = ['name', 'age', 'income', 'employmentStatus', 'creditHistory', 'existingDebt'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      return { valid: false, error: `Missing or invalid field: ${field}` };
    }
  }
  
  // Sanitize and validate each field
  const sanitized = {
    name: data.name.trim().slice(0, 100), // Limit length
    age: parseInt(data.age),
    income: parseFloat(data.income),
    employmentStatus: data.employmentStatus.trim().slice(0, 50),
    creditHistory: data.creditHistory.trim().slice(0, 50),
    existingDebt: parseFloat(data.existingDebt)
  };
  
  // Validate numeric values
  if (isNaN(sanitized.age) || sanitized.age < 18 || sanitized.age > 100) {
    return { valid: false, error: 'Invalid age value' };
  }
  
  if (isNaN(sanitized.income) || sanitized.income < 0 || sanitized.income > 10000000) {
    return { valid: false, error: 'Invalid income value' };
  }
  
  if (isNaN(sanitized.existingDebt) || sanitized.existingDebt < 0 || sanitized.existingDebt > 10000000) {
    return { valid: false, error: 'Invalid debt value' };
  }
  
  // Validate enum values
  const validEmploymentStatuses = ['employed', 'self-employed', 'unemployed', 'retired'];
  const validCreditHistories = ['excellent', 'good', 'fair', 'poor'];
  
  if (!validEmploymentStatuses.includes(sanitized.employmentStatus)) {
    return { valid: false, error: 'Invalid employment status' };
  }
  
  if (!validCreditHistories.includes(sanitized.creditHistory)) {
    return { valid: false, error: 'Invalid credit history' };
  }
  
  return { valid: true, sanitized };
}

/**
 * Calculate credit score using safe algorithms
 */
function calculateCreditScore(data: any) {
  const { age, income, existingDebt, employmentStatus, creditHistory } = data;
  
  // Base score calculation using safe math
  let score = 300; // Minimum score
  
  // Age factor (using safe expression evaluator)
  const ageFactor = Math.min((age - 18) * 2, 50);
  score += ageFactor;
  
  // Income factor (logarithmic scale to prevent excessive scores)
  const incomeFactor = Math.min(Math.log10(income + 1) * 50, 150);
  score += incomeFactor;
  
  // Debt-to-income ratio
  const debtToIncomeRatio = income > 0 ? (existingDebt / income) * 100 : 100;
  const debtFactor = Math.max(0, 100 - debtToIncomeRatio);
  score += debtFactor;
  
  // Employment status factor
  const employmentFactors = {
    'employed': 100,
    'self-employed': 80,
    'retired': 60,
    'unemployed': 0
  };
  score += employmentFactors[employmentStatus] || 0;
  
  // Credit history factor
  const historyFactors = {
    'excellent': 150,
    'good': 100,
    'fair': 50,
    'poor': 0
  };
  score += historyFactors[creditHistory] || 0;
  
  // Ensure score is within bounds
  score = Math.max(300, Math.min(850, Math.round(score)));
  
  // Determine grade
  let grade = 'F';
  if (score >= 750) grade = 'A';
  else if (score >= 650) grade = 'B';
  else if (score >= 550) grade = 'C';
  else if (score >= 450) grade = 'D';
  
  // Calculate confidence (simplified)
  const confidence = Math.min(95, 70 + (850 - Math.abs(score - 700)) / 10);
  
  // Generate factors
  const factors = [
    `Age: ${age} years`,
    `Income: $${income.toLocaleString()}`,
    `Debt-to-Income: ${debtToIncomeRatio.toFixed(1)}%`,
    `Employment: ${employmentStatus}`,
    `Credit History: ${creditHistory}`
  ];
  
  return {
    score,
    grade,
    confidence: Math.round(confidence),
    factors
  };
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
    const validation = validateAndSanitizeInput(data);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid input data' },
        { status: 400 }
      );
    }
    
    // Calculate credit score
    const result = calculateCreditScore(validation.sanitized);
    
    // Return response with security headers
    return NextResponse.json(result, {
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
    console.error('Credit scoring error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
