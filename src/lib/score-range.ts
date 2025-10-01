/**
 * Score Range Service
 * Manages score range interpretations and business rules
 */

import { db } from '@/lib/db'

export interface ScoreRange {
  id: string
  name: string
  description?: string
  minScore: number
  maxScore?: number
  color?: string
  approvalStatus?: string
  riskLevel?: string
  interestRateAdjustment: number
  loanLimitAdjustment: number
  isActive: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateScoreRangeInput {
  name: string
  description?: string
  minScore: number
  maxScore?: number
  color?: string
  approvalStatus?: string
  riskLevel?: string
  interestRateAdjustment?: number
  loanLimitAdjustment?: number
  priority?: number
}

export interface UpdateScoreRangeInput extends Partial<CreateScoreRangeInput> {
  id: string
}

export interface ScoreInterpretation {
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

export class ScoreRangeService {
  /**
   * Get all score ranges
   */
  static async getAll(): Promise<ScoreRange[]> {
    try {
      return await db.scoreRange.findMany({
        orderBy: [
          { priority: 'asc' },
          { minScore: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error fetching score ranges:', error)
      throw new Error('Failed to fetch score ranges')
    }
  }

  /**
   * Get active score ranges only
   */
  static async getActive(): Promise<ScoreRange[]> {
    try {
      return await db.scoreRange.findMany({
        where: { isActive: true },
        orderBy: [
          { priority: 'asc' },
          { minScore: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error fetching active score ranges:', error)
      throw new Error('Failed to fetch active score ranges')
    }
  }

  /**
   * Get score range by ID
   */
  static async getById(id: string): Promise<ScoreRange | null> {
    try {
      return await db.scoreRange.findUnique({
        where: { id }
      })
    } catch (error) {
      console.error(`Error fetching score range with ID ${id}:`, error)
      throw new Error('Failed to fetch score range')
    }
  }

  /**
   * Create new score range
   */
  static async create(input: CreateScoreRangeInput): Promise<ScoreRange> {
    try {
      return await db.scoreRange.create({
        data: {
          name: input.name,
          description: input.description,
          minScore: input.minScore,
          maxScore: input.maxScore,
          color: input.color,
          approvalStatus: input.approvalStatus,
          riskLevel: input.riskLevel,
          interestRateAdjustment: input.interestRateAdjustment || 0.0,
          loanLimitAdjustment: input.loanLimitAdjustment || 0.0,
          priority: input.priority || 1
        }
      })
    } catch (error) {
      console.error('Error creating score range:', error)
      throw new Error('Failed to create score range')
    }
  }

  /**
   * Update score range
   */
  static async update(input: UpdateScoreRangeInput): Promise<ScoreRange> {
    try {
      const { id, ...data } = input
      
      // Check if range exists
      const existing = await this.getById(id)
      if (!existing) {
        throw new Error(`Score range with ID ${id} not found`)
      }

      // Validate score range values
      if (data.minScore !== undefined) {
        if (data.minScore < 300 || data.minScore > 850) {
          throw new Error('Minimum score must be between 300 and 850')
        }
      }

      if (data.maxScore !== undefined && data.maxScore !== null) {
        if (data.maxScore < 300 || data.maxScore > 850) {
          throw new Error('Maximum score must be between 300 and 850')
        }
        
        if (data.minScore !== undefined && data.maxScore < data.minScore) {
          throw new Error('Maximum score must be greater than or equal to minimum score')
        }
      }

      if (data.interestRateAdjustment !== undefined) {
        if (data.interestRateAdjustment < -10 || data.interestRateAdjustment > 10) {
          throw new Error('Interest rate adjustment must be between -10% and 10%')
        }
      }

      if (data.loanLimitAdjustment !== undefined) {
        if (data.loanLimitAdjustment < 0 || data.loanLimitAdjustment > 5) {
          throw new Error('Loan limit adjustment must be between 0 and 5')
        }
      }

      if (data.priority !== undefined) {
        if (data.priority < 1 || data.priority > 10) {
          throw new Error('Priority must be between 1 and 10')
        }
      }

      return await db.scoreRange.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Error updating score range:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update score range')
    }
  }

  /**
   * Delete score range
   */
  static async delete(id: string): Promise<ScoreRange> {
    try {
      const existing = await this.getById(id)
      if (!existing) {
        throw new Error(`Score range with ID ${id} not found`)
      }

      return await db.scoreRange.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting score range:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to delete score range')
    }
  }

  /**
   * Toggle score range active status
   */
  static async toggleActive(id: string): Promise<ScoreRange> {
    try {
      const existing = await this.getById(id)
      if (!existing) {
        throw new Error(`Score range with ID ${id} not found`)
      }

      return await db.scoreRange.update({
        where: { id },
        data: { isActive: !existing.isActive }
      })
    } catch (error) {
      console.error('Error toggling score range active status:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to toggle score range active status')
    }
  }

  /**
   * Get score interpretation for a given score
   */
  static async getScoreInterpretation(score: number): Promise<ScoreInterpretation> {
    try {
      const ranges = await this.getActive()
      
      // Find the matching range
      const matchingRange = ranges.find(range => {
        if (range.maxScore) {
          return score >= range.minScore && score <= range.maxScore
        } else {
          return score >= range.minScore // For unbounded upper ranges
        }
      })

      if (!matchingRange) {
        // Fallback interpretation if no range matches
        return {
          range: {
            name: 'Unknown',
            description: 'Score does not match any defined range',
            minScore: 0,
            maxScore: 850,
            color: '#6B7280'
          },
          approvalStatus: 'Manual Review',
          riskLevel: 'Unknown',
          interestRateAdjustment: 0.0,
          loanLimitAdjustment: 1.0,
          color: '#6B7280'
        }
      }

      return {
        range: {
          name: matchingRange.name,
          description: matchingRange.description,
          minScore: matchingRange.minScore,
          maxScore: matchingRange.maxScore,
          color: matchingRange.color || '#6B7280'
        },
        approvalStatus: matchingRange.approvalStatus || 'Manual Review',
        riskLevel: matchingRange.riskLevel || 'Medium Risk',
        interestRateAdjustment: matchingRange.interestRateAdjustment,
        loanLimitAdjustment: matchingRange.loanLimitAdjustment,
        color: matchingRange.color || '#6B7280'
      }
    } catch (error) {
      console.error('Error getting score interpretation:', error)
      throw new Error('Failed to get score interpretation')
    }
  }

  /**
   * Validate score ranges for overlaps and gaps
   */
  static async validateRanges(): Promise<{
    isValid: boolean
    overlaps: Array<{ range1: ScoreRange; range2: ScoreRange }>
    gaps: Array<{ min: number; max: number }>
  }> {
    try {
      const ranges = await this.getActive()
      const overlaps: Array<{ range1: ScoreRange; range2: ScoreRange }> = []
      const gaps: Array<{ min: number; max: number }> = []

      // Check for overlaps
      for (let i = 0; i < ranges.length; i++) {
        for (let j = i + 1; j < ranges.length; j++) {
          const range1 = ranges[i]
          const range2 = ranges[j]
          
          // Check if ranges overlap
          const range1End = range1.maxScore || 9999
          const range2End = range2.maxScore || 9999
          
          if (range1.minScore <= range2End && range1End >= range2.minScore) {
            overlaps.push({ range1, range2 })
          }
        }
      }

      // Check for gaps (simplified check)
      const sortedRanges = [...ranges].sort((a, b) => a.minScore - b.minScore)
      for (let i = 0; i < sortedRanges.length - 1; i++) {
        const current = sortedRanges[i]
        const next = sortedRanges[i + 1]
        
        if (current.maxScore && next.minScore > current.maxScore) {
          gaps.push({
            min: current.maxScore + 1,
            max: next.minScore - 1
          })
        }
      }

      return {
        isValid: overlaps.length === 0 && gaps.length === 0,
        overlaps,
        gaps
      }
    } catch (error) {
      console.error('Error validating score ranges:', error)
      throw new Error('Failed to validate score ranges')
    }
  }

  /**
   * Seed default score ranges
   */
  static async seedDefaults(): Promise<ScoreRange[]> {
    try {
      const defaultRanges: CreateScoreRangeInput[] = [
        {
          name: 'Excellent',
          description: 'Excellent credit score with lowest risk',
          minScore: 750,
          maxScore: 850,
          color: '#10B981', // Green
          approvalStatus: 'Approved',
          riskLevel: 'Low Risk',
          interestRateAdjustment: -0.5, // 0.5% discount
          loanLimitAdjustment: 1.2, // 20% increase
          priority: 1
        },
        {
          name: 'Good',
          description: 'Good credit score with low risk',
          minScore: 700,
          maxScore: 749,
          color: '#3B82F6', // Blue
          approvalStatus: 'Approved',
          riskLevel: 'Low Risk',
          interestRateAdjustment: -0.25, // 0.25% discount
          loanLimitAdjustment: 1.1, // 10% increase
          priority: 2
        },
        {
          name: 'Fair',
          description: 'Fair credit score with moderate risk',
          minScore: 650,
          maxScore: 699,
          color: '#F59E0B', // Amber
          approvalStatus: 'Approved with Conditions',
          riskLevel: 'Medium Risk',
          interestRateAdjustment: 0.5, // 0.5% premium
          loanLimitAdjustment: 0.9, // 10% decrease
          priority: 3
        },
        {
          name: 'Poor',
          description: 'Poor credit score with high risk',
          minScore: 600,
          maxScore: 649,
          color: '#EF4444', // Red
          approvalStatus: 'Rejected',
          riskLevel: 'High Risk',
          interestRateAdjustment: 2.0, // 2% premium
          loanLimitAdjustment: 0.7, // 30% decrease
          priority: 4
        },
        {
          name: 'Very Poor',
          description: 'Very poor credit score with very high risk',
          minScore: 300,
          maxScore: 599,
          color: '#991B1B', // Dark Red
          approvalStatus: 'Rejected',
          riskLevel: 'Very High Risk',
          interestRateAdjustment: 3.0, // 3% premium
          loanLimitAdjustment: 0.5, // 50% decrease
          priority: 5
        }
      ]

      const createdRanges: ScoreRange[] = []
      
      // Get existing ranges to check for duplicates
      const existingRanges = await this.getAll()
      
      for (const rangeData of defaultRanges) {
        try {
          // Check if range with same name already exists
          const existing = existingRanges.find(r => r.name === rangeData.name)
          if (!existing) {
            const range = await this.create(rangeData)
            createdRanges.push(range)
          } else {
            // Update existing range with new configuration
            const updated = await this.update({ ...rangeData, id: existing.id })
            createdRanges.push(updated)
          }
        } catch (error) {
          console.warn(`Failed to create/update range ${rangeData.name}:`, error)
        }
      }

      return createdRanges
    } catch (error) {
      console.error('Error seeding default score ranges:', error)
      throw new Error('Failed to seed default score ranges')
    }
  }

  /**
   * Get business impact summary
   */
  static async getBusinessImpact(): Promise<{
    totalRanges: number
    activeRanges: number
    scoreCoverage: { min: number; max: number }
    approvalDistribution: { [status: string]: number }
    riskDistribution: { [level: string]: number }
  }> {
    try {
      const ranges = await this.getActive()
      
      const scoreCoverage = {
        min: Math.min(...ranges.map(r => r.minScore)),
        max: Math.max(...ranges.map(r => r.maxScore || 850))
      }

      const approvalDistribution = ranges.reduce((acc, range) => {
        const status = range.approvalStatus || 'Unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as { [status: string]: number })

      const riskDistribution = ranges.reduce((acc, range) => {
        const level = range.riskLevel || 'Unknown'
        acc[level] = (acc[level] || 0) + 1
        return acc
      }, {} as { [level: string]: number })

      return {
        totalRanges: ranges.length,
        activeRanges: ranges.filter(r => r.isActive).length,
        scoreCoverage,
        approvalDistribution,
        riskDistribution
      }
    } catch (error) {
      console.error('Error getting business impact:', error)
      throw new Error('Failed to get business impact')
    }
  }
}

// Export singleton instance for easy importing
export const scoreRangeService = new ScoreRangeService()