import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/utils';

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
 * Generate risk assessment using safe algorithms
 */
function generateRiskAssessment() {
  // Simulate risk factors with realistic data
  const factors = [
    {
      name: "Credit Score Risk",
      level: "medium" as const,
      score: 45,
      description: "Moderate credit score indicates some risk"
    },
    {
      name: "Debt-to-Income Ratio",
      level: "low" as const,
      score: 25,
      description: "Healthy debt-to-income ratio"
    },
    {
      name: "Employment Stability",
      level: "low" as const,
      score: 20,
      description: "Stable employment history"
    },
    {
      name: "Payment History",
      level: "medium" as const,
      score: 55,
      description: "Some late payments in recent history"
    },
    {
      name: "Market Conditions",
      level: "high" as const,
      score: 75,
      description: "Economic uncertainty increases risk"
    }
  ];

  // Calculate overall risk score
  const overallRiskScore = Math.round(
    factors.reduce((sum, factor) => sum + factor.score, 0) / factors.length
  );

  // Determine overall risk level
  let overallRisk: "low" | "medium" | "high";
  if (overallRiskScore < 30) overallRisk = "low";
  else if (overallRiskScore < 60) overallRisk = "medium";
  else overallRisk = "high";

  // Generate recommendations based on risk factors
  const recommendations = [
    "Monitor credit score regularly for changes",
    "Consider reducing existing debt to improve ratios",
    "Maintain stable employment status",
    "Address any payment history issues promptly",
    "Stay informed about economic conditions affecting risk"
  ];

  // Add specific recommendations based on high-risk factors
  const highRiskFactors = factors.filter(f => f.level === "high");
  highRiskFactors.forEach(factor => {
    if (factor.name === "Market Conditions") {
      recommendations.push("Consider more conservative lending terms during economic uncertainty");
    }
  });

  return {
    overallRisk,
    riskScore: overallRiskScore,
    factors,
    recommendations
  };
}

export async function GET(request: NextRequest) {
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
    
    // Generate risk assessment
    const result = generateRiskAssessment();
    
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
    console.error('Risk assessment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
