import { NextRequest, NextResponse } from 'next/server';
import { SafeExpressionEvaluator } from '@/lib/safe-expression-evaluator';
import { requireAdmin } from '@/lib/auth/utils';

// Rate limiting storage (in-memory for demo, use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute

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
 * Validate and sanitize field calculation input
 */
function validateAndSanitizeInput(data: any): { valid: boolean; sanitized: any; error?: string } {
  const requiredFields = ['fieldName', 'formula', 'variables'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!data[field]) {
      return { valid: false, error: `Missing field: ${field}` };
    }
  }
  
  // Validate field name (alphanumeric and underscores only)
  if (typeof data.fieldName !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(data.fieldName)) {
    return { valid: false, error: 'Invalid field name. Use alphanumeric characters and underscores only.' };
  }
  
  // Validate formula
  if (typeof data.formula !== 'string' || data.formula.trim().length === 0) {
    return { valid: false, error: 'Formula cannot be empty' };
  }
  
  // Validate variables
  if (typeof data.variables !== 'object' || data.variables === null) {
    return { valid: false, error: 'Variables must be an object' };
  }
  
  // Sanitize field name
  const sanitized = {
    fieldName: data.fieldName.trim(),
    formula: data.formula.trim(),
    variables: {}
  };
  
  // Sanitize and validate variables
  for (const [key, value] of Object.entries(data.variables)) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      return { valid: false, error: `Invalid variable name: ${key}` };
    }
    
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return { valid: false, error: `Invalid value for variable ${key}: must be a number` };
    }
    
    sanitized.variables[key] = numValue;
  }
  
  return { valid: true, sanitized };
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const auth = await requireAdmin();
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
    
    const { fieldName, formula, variables } = validation.sanitized;
    
    // Evaluate the formula using safe expression evaluator
    const result = SafeExpressionEvaluator.evaluate(formula, variables);
    
    let calculationResult;
    
    if (typeof result === 'number') {
      calculationResult = {
        fieldName,
        value: result,
        formula,
        isValid: true
      };
    } else {
      calculationResult = {
        fieldName,
        value: 0,
        formula,
        isValid: false,
        error: result.error
      };
    }
    
    // Return response with security headers
    return NextResponse.json(calculationResult, {
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
    console.error('Field calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
