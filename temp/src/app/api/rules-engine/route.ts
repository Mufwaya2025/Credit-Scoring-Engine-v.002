import { NextRequest, NextResponse } from 'next/server';
import { SafeExpressionEvaluator } from '@/lib/safe-expression-evaluator';
import { requireAdmin } from '@/lib/auth/utils';

// Rate limiting storage (in-memory for demo, use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15; // 15 requests per minute

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
 * Validate and sanitize rule input
 */
function validateAndSanitizeRuleInput(data: any): { valid: boolean; sanitized: any; error?: string } {
  const requiredFields = ['name', 'condition', 'action'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      return { valid: false, error: `Missing or invalid field: ${field}` };
    }
  }
  
  // Sanitize inputs
  const sanitized = {
    name: data.name.trim().slice(0, 100),
    description: data.description ? data.description.trim().slice(0, 500) : '',
    condition: data.condition.trim(),
    action: data.action.trim().slice(0, 100),
    isActive: data.isActive !== false, // Default to true
    priority: data.priority || 1
  };
  
  // Validate priority
  if (typeof sanitized.priority !== 'number' || sanitized.priority < 1) {
    sanitized.priority = 1;
  }
  
  return { valid: true, sanitized };
}

/**
 * Store rules (in-memory for demo, use database in production)
 */
const rulesStorage = new Map<string, any>();

/**
 * Generate a unique ID for a rule
 */
function generateRuleId(): string {
  return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    const validation = validateAndSanitizeRuleInput(data);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid input data' },
        { status: 400 }
      );
    }
    
    // Create rule with ID and timestamp
    const rule = {
      id: generateRuleId(),
      ...validation.sanitized,
      createdAt: new Date().toISOString()
    };
    
    // Store rule
    rulesStorage.set(rule.id, rule);
    
    // Return response with security headers
    return NextResponse.json(rule, {
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
    console.error('Rule creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    
    // Return all rules
    const rules = Array.from(rulesStorage.values());
    
    // Return response with security headers
    return NextResponse.json(rules, {
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
    console.error('Rule retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
