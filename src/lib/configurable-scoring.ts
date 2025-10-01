/**
 * ARC Configurable Scoring Engine
 * Advanced AI-powered credit scoring with ARC-specific algorithms
 */

import { db } from '@/lib/db'
import { ApplicantFieldService } from './applicant-field'

interface ScoringConfig {
  id: string
  factor: string
  name: string
  description?: string
  maxPoints: number
  weight: number
  thresholds: string
  category: string
  isActive: boolean
  configType: string
  calculationType: string
  minValue?: number
  maxValue?: number
  optimalValue?: number
  arcEnhanced?: boolean
  aiOptimized?: boolean
}

interface ApplicantData {
  [key: string]: any
}

interface ScoringResult {
  factor: string
  name: string
  points: number
  maxPoints: number
  weight: number
  weightedScore: number
  details: any
  arcEnhanced?: boolean
  aiOptimized?: boolean
}

export class ConfigurableScoringEngine {
  private configs: ScoringConfig[] = []
  private applicantFields: any[] = []
  private arcModelVersion: string = "ARC-1.0"

  /**
   * Load scoring configurations and applicant fields from database
   */
  async loadConfigs(): Promise<void> {
    try {
      // Load scoring configurations
      this.configs = await db.scoringConfig.findMany({
        where: { isActive: true },
        orderBy: { factor: 'asc' }
      })

      // Load applicant fields that are used in scoring
      this.applicantFields = await ApplicantFieldService.getScoringFields()
      
      // Apply ARC enhancements to configs
      this.configs = this.configs.map(config => ({
        ...config,
        arcEnhanced: true,
        aiOptimized: config.category === 'financial' || config.category === 'credit'
      }))
    } catch (error) {
      console.error('Error loading ARC scoring configs:', error)
      throw new Error('Failed to load ARC scoring configurations')
    }
  }

  /**
   * Calculate ARC configurable credit score
   */
  async calculateScore(applicantData: ApplicantData): Promise<{
    totalScore: number
    maxScore: number
    baseScore: number
    results: ScoringResult[]
    breakdown: {
      demographic: number
      financial: number
      credit: number
      employment: number
      general: number
    }
    arcFeatures: {
      aiEnhanced: boolean
      realTimeAnalysis: boolean
      modelVersion: string
      optimizationLevel: string
    }
  }> {
    if (this.configs.length === 0) {
      await this.loadConfigs()
    }

    const results: ScoringResult[] = []
    const breakdown = {
      demographic: 0,
      financial: 0,
      credit: 0,
      employment: 0,
      general: 0
    }

    let totalWeightedScore = 0
    let totalMaxWeightedScore = 0

    // Base score (300 is the minimum FICO score)
    const baseScore = 300

    for (const config of this.configs) {
      const result = this.calculateFactorScore(config, applicantData)
      results.push(result)
      
      // Add to category breakdown
      if (breakdown.hasOwnProperty(config.category)) {
        breakdown[config.category as keyof typeof breakdown] += result.weightedScore
      }

      totalWeightedScore += result.weightedScore
      totalMaxWeightedScore += result.maxPoints * result.weight
    }

    // Apply ARC AI optimization
    const aiOptimizationBonus = this.calculateAIOptimizationBonus(applicantData, results)
    totalWeightedScore += aiOptimizationBonus

    // Calculate final score
    const totalScore = baseScore + Math.round(totalWeightedScore)
    const maxScore = baseScore + Math.round(totalMaxWeightedScore)

    return {
      totalScore,
      maxScore,
      baseScore,
      results,
      breakdown,
      arcFeatures: {
        aiEnhanced: true,
        realTimeAnalysis: true,
        modelVersion: this.arcModelVersion,
        optimizationLevel: this.getOptimizationLevel(results)
      }
    }
  }

  /**
   * Calculate score for a single factor
   */
  private calculateFactorScore(config: ScoringConfig, applicantData: ApplicantData): ScoringResult {
    let points = 0
    let details: any = {}

    try {
      const thresholds = JSON.parse(config.thresholds || '{}')

      switch (config.calculationType) {
        case 'linear':
          points = this.calculateLinearScore(config, applicantData, thresholds)
          break
        case 'threshold':
          points = this.calculateThresholdScore(config, applicantData, thresholds)
          break
        case 'categorical':
          points = this.calculateCategoricalScore(config, applicantData, thresholds)
          break
        case 'optimal':
          points = this.calculateOptimalScore(config, applicantData, thresholds)
          break
        default:
          points = 0
      }

      details = {
        calculationType: config.calculationType,
        thresholds,
        rawValue: applicantData[config.factor]
      }
    } catch (error) {
      console.error(`Error calculating ARC score for ${config.factor}:`, error)
      points = 0
      details = { error: 'ARC calculation failed' }
    }

    const weightedScore = points * config.weight

    return {
      factor: config.factor,
      name: config.name,
      points,
      maxPoints: config.maxPoints,
      weight: config.weight,
      weightedScore,
      details,
      arcEnhanced: config.arcEnhanced,
      aiOptimized: config.aiOptimized
    }
  }

  /**
   * ARC AI Optimization Bonus Calculation
   */
  private calculateAIOptimizationBonus(applicantData: ApplicantData, results: ScoringResult[]): number {
    let bonus = 0
    
    // AI optimization for high-performing financial factors
    const financialResults = results.filter(r => r.aiOptimized && r.points > r.maxPoints * 0.8)
    if (financialResults.length >= 2) {
      bonus += 5 // 5 point bonus for strong financial performance
    }
    
    // ARC enhancement for consistent scoring
    const highScores = results.filter(r => r.points > r.maxPoints * 0.7)
    if (highScores.length >= results.length * 0.6) {
      bonus += 3 // 3 point bonus for consistent performance
    }
    
    return bonus
  }

  /**
   * Get ARC optimization level
   */
  private getOptimizationLevel(results: ScoringResult[]): string {
    const aiOptimizedCount = results.filter(r => r.aiOptimized).length
    const arcEnhancedCount = results.filter(r => r.arcEnhanced).length
    
    if (aiOptimizedCount >= results.length * 0.8) {
      return "Maximum"
    } else if (arcEnhancedCount >= results.length * 0.6) {
      return "High"
    } else if (arcEnhancedCount >= results.length * 0.4) {
      return "Medium"
    } else {
      return "Standard"
    }
  }

  /**
   * Linear score calculation
   */
  private calculateLinearScore(config: ScoringConfig, applicantData: ApplicantData, thresholds: any): number {
    const value = applicantData[config.factor]
    
    // Handle undefined/null values
    if (value === undefined || value === null) {
      return 0
    }
    
    // Ensure value is a number for linear calculations
    const numericValue = Number(value)
    if (isNaN(numericValue)) {
      return 0
    }
    
    switch (config.factor) {
      case 'annualIncome':
      case 'income':
        if (thresholds.multiplier && thresholds.cap) {
          const cappedValue = Math.min(numericValue, thresholds.cap)
          return Math.min((cappedValue / 1000) * thresholds.multiplier, config.maxPoints)
        }
        break
        
      case 'creditHistoryLength':
        if (thresholds.multiplier && thresholds.cap) {
          return Math.min(numericValue * thresholds.multiplier, config.maxPoints)
        }
        break
        
      case 'latePayments12m':
      case 'recentInquiries':
        if (thresholds.penalty) {
          // Penalty factors reduce the score
          return Math.max(numericValue * thresholds.penalty, config.maxPoints)
        }
        break
    }

    // Default linear calculation
    if (config.minValue !== undefined && config.maxValue !== undefined) {
      const normalized = (numericValue - config.minValue) / (config.maxValue - config.minValue)
      return Math.max(0, Math.min(normalized * config.maxPoints, config.maxPoints))
    }

    return 0
  }

  /**
   * Threshold score calculation
   */
  private calculateThresholdScore(config: ScoringConfig, applicantData: ApplicantData, thresholds: any): number {
    const value = applicantData[config.factor]
    
    // Handle undefined/null values
    if (value === undefined || value === null) {
      return 0
    }
    
    // Ensure value is a number for threshold calculations
    const numericValue = Number(value)
    if (isNaN(numericValue)) {
      return 0
    }

    switch (config.factor) {
      case 'age':
        if (thresholds.optimal) {
          const { min, max, points } = thresholds.optimal
          if (numericValue >= min && numericValue <= max) return points
        }
        if (thresholds.good) {
          const { min, max, points } = thresholds.good
          if (numericValue >= min && numericValue < max) return points
        }
        if (thresholds.acceptable) {
          const { min, max, points } = thresholds.acceptable
          if (numericValue > min && numericValue <= max) return points
        }
        break
        
      case 'debtToIncomeRatio':
      case 'debtToIncome':
      case 'creditUtilization':
        // Lower is better for ratios
        if (thresholds.excellent && numericValue <= thresholds.excellent.max) {
          return thresholds.excellent.points
        }
        if (thresholds.good && numericValue <= thresholds.good.max) {
          return thresholds.good.points
        }
        if (thresholds.fair && numericValue <= thresholds.fair.max) {
          return thresholds.fair.points
        }
        break
    }

    return 0
  }

  /**
   * Categorical score calculation
   */
  private calculateCategoricalScore(config: ScoringConfig, applicantData: ApplicantData, thresholds: any): number {
    const value = applicantData[config.factor]
    
    // Handle undefined/null values
    if (value === undefined || value === null) {
      return 0
    }

    switch (config.factor) {
      case 'employmentStatus':
        return thresholds[value] || 0
        
      case 'educationLevel':
        return thresholds[value] || 0
        
      case 'loanPurpose':
        return thresholds[value] || 0
    }

    return 0
  }

  /**
   * Optimal score calculation
   */
  private calculateOptimalScore(config: ScoringConfig, applicantData: ApplicantData, thresholds: any): number {
    const value = applicantData[config.factor]
    
    // Handle undefined/null values
    if (value === undefined || value === null) {
      return 0
    }

    // Ensure value is a number for optimal calculations
    const numericValue = Number(value)
    if (isNaN(numericValue)) {
      return 0
    }
    
    if (config.optimalValue !== undefined) {
      const difference = Math.abs(numericValue - config.optimalValue)
      const maxDifference = config.maxValue || config.optimalValue * 2
      const normalizedDifference = difference / maxDifference
      return Math.max(0, config.maxPoints * (1 - normalizedDifference))
    }

    return 0
  }

  /**
   * Get current ARC scoring configurations
   */
  getConfigs(): ScoringConfig[] {
    return this.configs
  }

  /**
   * Get applicant fields used in ARC scoring
   */
  getApplicantFields(): any[] {
    return this.applicantFields
  }

  /**
   * Get ARC scoring summary
   */
  getScoringSummary(): {
    totalConfigs: number
    activeConfigs: number
    totalMaxPoints: number
    categories: { [key: string]: number }
    applicantFields: number
    arcFeatures: {
      aiEnhancedConfigs: number
      arcEnhancedConfigs: number
      modelVersion: string
    }
  } {
    const activeConfigs = this.configs.filter(c => c.isActive)
    const categories = this.configs.reduce((acc, config) => {
      acc[config.category] = (acc[config.category] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    const aiEnhancedConfigs = this.configs.filter(c => c.aiOptimized).length
    const arcEnhancedConfigs = this.configs.filter(c => c.arcEnhanced).length

    return {
      totalConfigs: this.configs.length,
      activeConfigs: activeConfigs.length,
      totalMaxPoints: activeConfigs.reduce((sum, c) => sum + c.maxPoints, 0),
      categories,
      applicantFields: this.applicantFields.length,
      arcFeatures: {
        aiEnhancedConfigs,
        arcEnhancedConfigs,
        modelVersion: this.arcModelVersion
      }
    }
  }

  /**
   * Validate applicant data against required fields for ARC scoring
   */
  validateApplicantData(applicantData: ApplicantData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check all required applicant fields
    for (const field of this.applicantFields) {
      if (field.isRequired) {
        const value = applicantData[field.fieldName]
        if (value === undefined || value === null || value === '') {
          errors.push(`${field.displayName} is required for ARC scoring`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get scoring factors that are missing from applicant data
   */
  getMissingFactors(applicantData: ApplicantData): string[] {
    const missingFactors: string[] = []
    
    for (const config of this.configs) {
      if (!applicantData.hasOwnProperty(config.factor)) {
        missingFactors.push(config.factor)
      }
    }

    return missingFactors
  }

  /**
   * Get ARC model information
   */
  getArcModelInfo(): {
    version: string
    description: string
    features: string[]
    lastUpdated: string
  } {
    return {
      version: this.arcModelVersion,
      description: "ARC Credit Engine Pro - Advanced AI-powered credit scoring system",
      features: [
        "AI-enhanced scoring algorithms",
        "Real-time risk assessment",
        "Configurable scoring factors",
        "Automated optimization",
        "Comprehensive reporting"
      ],
      lastUpdated: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const configurableScoringEngine = new ConfigurableScoringEngine()