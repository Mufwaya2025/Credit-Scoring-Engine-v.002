import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const UpdateRuleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  type: z.enum(["eligibility", "risk", "pricing", "limit"]).optional(),
  category: z.string().min(1, "Category is required").optional(),
  condition: z.string().min(1, "Condition is required").optional(),
  action: z.enum(["approve", "reject", "flag", "adjust_score", "adjust_limit"]).optional(),
  actionValue: z.string().nullable().optional(),
  priority: z.number().min(1).max(10).optional(),
  isActive: z.boolean().optional(),
  weight: z.number().min(0.1).max(3.0).optional()
}).refine(data => {
  // Ensure at least one field is being updated
  return Object.keys(data).length > 0;
}, {
  message: "At least one field must be provided for update"
})

// GET /api/rules/[id] - Get single rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rule = await db.rule.findUnique({
      where: { id },
      include: {
        ruleExecutions: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    })
    
    if (!rule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(rule)
  } catch (error) {
    console.error('Error fetching rule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/rules/[id] - Update rule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log("Update request body:", body);
    
    const validatedData = UpdateRuleSchema.parse(body)
    console.log("Validated data:", validatedData);
    
    // Check if rule exists first
    const existingRule = await db.rule.findUnique({
      where: { id }
    })
    
    if (!existingRule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      )
    }
    
    const rule = await db.rule.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    })
    
    console.log("Updated rule:", rule);
    return NextResponse.json(rule)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("Zod validation error:", error.issues);
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: error.issues,
          message: error.issues ? error.issues.map(e => e.message).join(', ') : 'Validation error occurred'
        },
        { status: 400 }
      )
    }
    
    console.error('Error updating rule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/rules/[id] - Delete rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // First, delete related rule executions to avoid foreign key constraint errors
    await db.ruleExecution.deleteMany({
      where: { ruleId: id }
    })
    
    // Then delete the rule
    await db.rule.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting rule:', error)
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint failed')) {
        return NextResponse.json(
          { error: 'Cannot delete rule: it has related execution records' },
          { status: 400 }
        )
      }
      if (error.message.includes('Record to delete not found')) {
        return NextResponse.json(
          { error: 'Rule not found' },
          { status: 404 }
        )
      }
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/rules/[id] - Toggle rule active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("PATCH request received for rule ID:", id);
    
    const rule = await db.rule.findUnique({
      where: { id }
    })
    
    console.log("Found rule:", rule);
    
    if (!rule) {
      console.log("Rule not found for ID:", id);
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      )
    }
    
    const updatedRule = await db.rule.update({
      where: { id },
      data: {
        isActive: !rule.isActive,
        updatedAt: new Date()
      }
    })
    
    console.log("Rule updated successfully:", updatedRule);
    return NextResponse.json(updatedRule)
  } catch (error) {
    console.error('Error toggling rule:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: 'Rule not found' },
          { status: 404 }
        )
      }
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}