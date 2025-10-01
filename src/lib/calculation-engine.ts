/**
 * Calculation Engine for automatic field calculations
 * Handles derived fields like Debt-to-Income Ratio and Credit Utilization
 */

export interface FieldDefinition {
  value: string
  label: string
  type: "number" | "string" | "calculated"
  category: "base" | "derived"
  description: string
  unit?: string
  weight?: number // New: Weight for scoring (1-10)
  enabled?: boolean // New: Whether field is enabled
  min?: number // New: Minimum value for scoring
  max?: number // New: Maximum value for scoring
  optimal?: number // New: Optimal value for scoring
  calculation?: {
    formula: string
    dependencies: string[]
    description: string
    format?: (value: number) => string
  }
}

export interface ApplicantData {
  [key: string]: any
}

export class CalculationEngine {
  private fieldDefinitions: FieldDefinition[]
  
  constructor(fieldDefinitions: FieldDefinition[]) {
    this.fieldDefinitions = fieldDefinitions
  }
  
  /**
   * Calculate a derived field value based on applicant data
   */
  calculate(field: string, data: ApplicantData): number | null {
    const fieldDef = this.fieldDefinitions.find(f => f.value === field)
    if (!fieldDef?.calculation) {
      console.warn(`Field ${field} is not a calculated field`)
      return null
    }
    
    const { formula, dependencies } = fieldDef.calculation
    
    // Check if all dependencies are available and valid
    for (const dep of dependencies) {
      const depValue = data[dep]
      if (depValue === undefined || depValue === null || depValue === "" || isNaN(depValue)) {
        console.log(`Cannot calculate ${field}: missing or invalid dependency ${dep}`)
        return null
      }
    }
    
    try {
      const result = this.evaluateFormula(formula, data)
      
      // Validate the result
      if (isNaN(result) || !isFinite(result)) {
        console.warn(`Invalid calculation result for ${field}: ${result}`)
        return null
      }
      
      return result
    } catch (error) {
      console.error(`Calculation error for ${field}:`, error)
      return null
    }
  }
  
  /**
   * Get all calculated fields that can be computed from current data
   */
  calculateAllFields(data: ApplicantData): ApplicantData {
    const result = { ...data }
    
    // Calculate all derived fields
    this.fieldDefinitions
      .filter(field => field.category === "derived")
      .forEach(field => {
        const calculatedValue = this.calculate(field.value, data)
        if (calculatedValue !== null) {
          result[field.value] = calculatedValue
        }
      })
    
    return result
  }
  
  /**
   * Get dependencies for a calculated field
   */
  getDependencies(field: string): string[] {
    const fieldDef = this.fieldDefinitions.find(f => f.value === field)
    return fieldDef?.calculation?.dependencies || []
  }
  
  /**
   * Check if a field is calculated
   */
  isCalculatedField(field: string): boolean {
    const fieldDef = this.fieldDefinitions.find(f => f.value === field)
    return fieldDef?.category === "derived"
  }
  
  /**
   * Get all calculated fields
   */
  getCalculatedFields(): FieldDefinition[] {
    return this.fieldDefinitions.filter(f => f.category === "derived")
  }
  
  /**
   * Get all base fields
   */
  getBaseFields(): FieldDefinition[] {
    return this.fieldDefinitions.filter(f => f.category === "base")
  }
  
  /**
   * Format a calculated value for display
   */
  formatValue(field: string, value: number): string {
    const fieldDef = this.fieldDefinitions.find(f => f.value === field)
    if (!fieldDef?.calculation?.format) {
      return value.toString()
    }
    
    return fieldDef.calculation.format(value)
  }
  
  /**
   * Safe formula evaluation
   */
  private evaluateFormula(formula: string, data: ApplicantData): number {
    // Create a safe evaluation context with only the necessary variables
    const context: { [key: string]: number } = {}
    
    // Add only numeric dependencies to context
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number' && !isNaN(value)) {
        context[key] = value
      }
    }
    
    // Replace field names in formula with their values
    let expression = formula
    
    // Sort field names by length (longest first) to avoid partial matches
    const fieldNames = Object.keys(context).sort((a, b) => b.length - a.length)
    
    for (const fieldName of fieldNames) {
      const regex = new RegExp(`\\b${fieldName}\\b`, 'g')
      expression = expression.replace(regex, context[fieldName].toString())
    }
    
    // Evaluate the expression safely
    try {
      // Use Function constructor for safe evaluation
      const result = Function(`"use strict"; return (${expression})`)()
      
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error(`Invalid result: ${result}`)
      }
      
      return result
    } catch (error) {
      throw new Error(`Formula evaluation failed: ${error}`)
    }
  }
  
  /**
   * Calculate weighted score for a specific field
   */
  calculateFieldScore(field: string, data: ApplicantData): number {
    const fieldDef = this.fieldDefinitions.find(f => f.value === field)
    if (!fieldDef || !fieldDef.enabled || fieldDef.weight === undefined) {
      return 0
    }
    
    const value = data[field]
    if (value === undefined || value === null || isNaN(value)) {
      return 0
    }
    
    // If it's a calculated field, calculate it first
    if (fieldDef.category === "derived") {
      const calculatedValue = this.calculate(field, data)
      if (calculatedValue === null) return 0
      return this.normalizeValue(calculatedValue, fieldDef) * fieldDef.weight
    }
    
    return this.normalizeValue(value, fieldDef) * fieldDef.weight
  }
  
  /**
   * Normalize a value to 0-1 scale based on field definition
   */
  private normalizeValue(value: any, fieldDef: FieldDefinition): number {
    // Handle string fields (categorical data)
    if (fieldDef.type === "string") {
      return this.normalizeStringValue(value, fieldDef)
    }
    
    // Handle calculated fields (they should be numbers)
    if (fieldDef.type === "calculated") {
      return this.normalizeCalculatedValue(value, fieldDef)
    }
    
    // Ensure we have a numeric value for number fields
    if (typeof value !== 'number' || isNaN(value)) {
      return 0
    }
    
    if (fieldDef.min !== undefined && fieldDef.max !== undefined) {
      // Range-based normalization
      const normalized = (value - fieldDef.min) / (fieldDef.max - fieldDef.min)
      return Math.max(0, Math.min(1, normalized))
    }
    
    if (fieldDef.optimal !== undefined) {
      // Optimal-based normalization (closer to optimal is better)
      const difference = Math.abs(value - fieldDef.optimal)
      const maxDifference = fieldDef.max || fieldDef.optimal * 2
      return Math.max(0, 1 - (difference / maxDifference))
    }
    
    // Default normalization for common field types
    switch (fieldDef.value) {
      case "age":
        // Optimal age range 25-55
        if (value >= 25 && value <= 55) return 1
        if (value >= 22 && value < 25) return 0.7
        if (value > 55 && value <= 65) return 0.8
        return 0.3
        
      case "creditScore":
        // Credit score normalization (300-850)
        return Math.max(0, Math.min(1, (value - 300) / 550))
        
      case "debtToIncomeRatio":
      case "creditUtilization":
        // Lower is better for ratios
        return Math.max(0, 1 - value)
        
      case "annualIncome":
        // Income normalization (0-200k)
        return Math.min(1, value / 200000)
        
      default:
        // Default linear normalization
        const maxVal = fieldDef.max || 100
        return Math.max(0, Math.min(1, value / maxVal))
    }
  }
  
  /**
   * Normalize string/categorical field values
   */
  private normalizeStringValue(value: string, fieldDef: FieldDefinition): number {
    if (!value || typeof value !== 'string') {
      return 0
    }
    
    switch (fieldDef.value) {
      case "employmentStatus":
        switch (value.toLowerCase()) {
          case "employed": return 1.0    // Best
          case "self-employed": return 0.9
          case "retired": return 0.8
          case "student": return 0.6
          case "unemployed": return 0.2  // Worst
          default: return 0.5
        }
        
      case "educationLevel":
        switch (value.toLowerCase()) {
          case "phd": return 1.0                    // Best
          case "master": return 0.9
          case "bachelor": return 0.8
          case "associate": return 0.7
          case "high school": return 0.5
          case "some college": return 0.6
          default: return 0.4
        }
        
      default:
        // Default normalization for unknown string fields
        return 0.5
    }
  }
  
  /**
   * Normalize calculated field values
   */
  private normalizeCalculatedValue(value: number, fieldDef: FieldDefinition): number {
    if (typeof value !== 'number' || isNaN(value)) {
      return 0
    }
    
    // Use field-specific normalization for calculated fields
    switch (fieldDef.value) {
      case "debtToIncomeRatio":
      case "creditUtilization":
        // Lower is better for ratios (0-1 range)
        return Math.max(0, 1 - value)
        
      case "monthlyIncome":
        // Monthly income normalization (0-50k)
        return Math.min(1, value / 50000)
        
      case "creditScore":
        // Credit score should be 300-850
        return Math.max(0, Math.min(1, (value - 300) / 550))
        
      default:
        // Default normalization for calculated fields
        if (fieldDef.min !== undefined && fieldDef.max !== undefined) {
          return Math.max(0, Math.min(1, (value - fieldDef.min) / (fieldDef.max - fieldDef.min)))
        }
        if (fieldDef.optimal !== undefined) {
          const difference = Math.abs(value - fieldDef.optimal)
          const maxDifference = fieldDef.max || fieldDef.optimal * 2
          return Math.max(0, 1 - (difference / maxDifference))
        }
        // Fallback to simple linear normalization
        const maxVal = fieldDef.max || 100
        return Math.max(0, Math.min(1, value / maxVal))
    }
  }
  
  /**
   * Calculate overall weighted score
   */
  calculateOverallScore(baseData: ApplicantData): {
    totalScore: number
    maxScore: number
    percentage: number
    fieldScores: { [key: string]: number }
    details: Array<{
      field: string
      label: string
      value: any
      normalizedScore: number
      weightedScore: number
      weight: number
    }>
  } {
    const fieldScores: { [key: string]: number } = {}
    const details: Array<{
      field: string
      label: string
      value: any
      normalizedScore: number
      weightedScore: number
      weight: number
    }> = []
    
    let totalScore = 0
    let maxScore = 0
    
    // FIX: Calculate derived fields first
    const calculatedData = this.calculateAllFields(baseData)
    const completeData = { ...baseData, ...calculatedData }
    
    // Calculate scores for all enabled fields
    this.fieldDefinitions
      .filter(field => field.enabled !== false && field.weight !== undefined)
      .forEach(field => {
        // FIX: Use complete data with calculated values
        const value = completeData[field.value]
        let normalizedScore = 0
        
        // FIX: Validate value before normalization
        if (value !== undefined && value !== null && !isNaN(value)) {
          normalizedScore = this.normalizeValue(value, field)
        }
        
        const weightedScore = normalizedScore * field.weight!
        
        fieldScores[field.value] = weightedScore
        totalScore += weightedScore
        maxScore += field.weight!
        
        details.push({
          field: field.value,
          label: field.label,
          value: value,
          normalizedScore,
          weightedScore,
          weight: field.weight!
        })
      })
    
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    
    return {
      totalScore,
      maxScore,
      percentage,
      fieldScores,
      details
    }
  }
  
  /**
   * Update field configuration
   */
  updateFieldConfig(fieldUpdates: { [key: string]: Partial<FieldDefinition> }): void {
    this.fieldDefinitions = this.fieldDefinitions.map(field => {
      const update = fieldUpdates[field.value]
      if (update) {
        return { ...field, ...update }
      }
      return field
    })
  }
  
  /**
   * Add a new custom field
   */
  addCustomField(fieldDef: FieldDefinition): void {
    this.fieldDefinitions.push(fieldDef)
  }
  
  /**
   * Remove a field
   */
  removeField(fieldValue: string): void {
    this.fieldDefinitions = this.fieldDefinitions.filter(f => f.value !== fieldValue)
  }
  validateBaseFields(data: ApplicantData): { valid: boolean; missing: string[] } {
    const baseFields = this.getBaseFields()
    const missing: string[] = []
    
    baseFields.forEach(field => {
      if (data[field.value] === undefined || data[field.value] === null || data[field.value] === "") {
        missing.push(field.label)
      }
    })
    
    return {
      valid: missing.length === 0,
      missing
    }
  }
}

// Predefined field definitions with automatic calculations and weights
export const fieldDefinitions: FieldDefinition[] = [
  // === BASE FIELDS (Manual Input Required) ===
  { 
    value: "age", 
    label: "Age", 
    type: "number", 
    category: "base",
    description: "Applicant's age in years",
    unit: "years",
    weight: 8,
    enabled: true,
    min: 18,
    max: 100,
    optimal: 35
  },
  { 
    value: "annualIncome", 
    label: "Annual Income", 
    type: "number", 
    category: "base",
    description: "Applicant's annual gross income before taxes",
    unit: "$",
    weight: 10,
    enabled: true,
    min: 0,
    max: 500000
  },
  { 
    value: "loanAmount", 
    label: "Loan Amount", 
    type: "number", 
    category: "base",
    description: "Requested loan amount",
    unit: "$",
    weight: 7,
    enabled: true,
    min: 0,
    max: 100000
  },
  { 
    value: "creditHistoryLength", 
    label: "Credit History Length", 
    type: "number", 
    category: "base",
    description: "Length of credit history in years",
    unit: "years",
    weight: 9,
    enabled: true,
    min: 0,
    max: 30
  },
  { 
    value: "monthlyDebtPayments", 
    label: "Monthly Debt Payments", 
    type: "number", 
    category: "base",
    description: "Total monthly payments for all debts (mortgage, loans, credit cards)",
    unit: "$",
    weight: 8,
    enabled: true,
    min: 0,
    max: 10000
  },
  { 
    value: "totalCreditLimit", 
    label: "Total Credit Limit", 
    type: "number", 
    category: "base",
    description: "Total credit limit across all credit cards and revolving accounts",
    unit: "$",
    weight: 6,
    enabled: true,
    min: 0,
    max: 200000
  },
  { 
    value: "creditCardBalances", 
    label: "Credit Card Balances", 
    type: "number", 
    category: "base",
    description: "Total current balances on all credit cards and revolving accounts",
    unit: "$",
    weight: 7,
    enabled: true,
    min: 0,
    max: 100000
  },
  { 
    value: "monthlyExpenses", 
    label: "Monthly Expenses", 
    type: "number", 
    category: "base",
    description: "Total monthly living expenses",
    unit: "$",
    weight: 5,
    enabled: true,
    min: 0,
    max: 20000
  },
  { 
    value: "existingLoanAmount", 
    label: "Existing Loan Amount", 
    type: "number", 
    category: "base",
    description: "Total amount of existing loans",
    unit: "$",
    weight: 6,
    enabled: true,
    min: 0,
    max: 200000
  },
  { 
    value: "latePayments12m", 
    label: "Late Payments (12m)", 
    type: "number", 
    category: "base",
    description: "Number of late payments in the last 12 months",
    unit: "count",
    weight: 9,
    enabled: true,
    min: 0,
    max: 20,
    optimal: 0
  },
  { 
    value: "recentInquiries", 
    label: "Recent Inquiries", 
    type: "number", 
    category: "base",
    description: "Number of recent credit inquiries",
    unit: "count",
    weight: 7,
    enabled: true,
    min: 0,
    max: 15,
    optimal: 0
  },
  
  // === STRING FIELDS (Manual Input Required) ===
  { 
    value: "employmentStatus", 
    label: "Employment Status", 
    type: "string", 
    category: "base",
    description: "Current employment status",
    weight: 8,
    enabled: true
  },
  { 
    value: "educationLevel", 
    label: "Education Level", 
    type: "string", 
    category: "base",
    description: "Highest education level achieved",
    weight: 6,
    enabled: true
  },
  
  // === CALCULATED FIELDS (Automatic) ===
  { 
    value: "debtToIncomeRatio", 
    label: "Debt-to-Income Ratio", 
    type: "calculated", 
    category: "derived",
    description: "Annual debt payments divided by annual income",
    unit: "ratio",
    weight: 10,
    enabled: true,
    min: 0,
    max: 1,
    optimal: 0.3,
    calculation: {
      formula: "(monthlyDebtPayments * 12) / annualIncome",
      dependencies: ["monthlyDebtPayments", "annualIncome"],
      description: "(Monthly Debt Payments × 12) ÷ Annual Income",
      format: (value: number) => `${(value * 100).toFixed(1)}%`
    }
  },
  { 
    value: "creditUtilization", 
    label: "Credit Utilization", 
    type: "calculated", 
    category: "derived",
    description: "Current credit card balances divided by total credit limit",
    unit: "ratio",
    weight: 9,
    enabled: true,
    min: 0,
    max: 1,
    optimal: 0.1,
    calculation: {
      formula: "creditCardBalances / totalCreditLimit",
      dependencies: ["creditCardBalances", "totalCreditLimit"],
      description: "Credit Card Balances ÷ Total Credit Limit",
      format: (value: number) => `${(value * 100).toFixed(1)}%`
    }
  },
  { 
    value: "monthlyIncome", 
    label: "Monthly Income", 
    type: "calculated", 
    category: "derived",
    description: "Annual income divided by 12 months",
    unit: "$",
    weight: 7,
    enabled: true,
    min: 0,
    max: 50000,
    calculation: {
      formula: "annualIncome / 12",
      dependencies: ["annualIncome"],
      description: "Annual Income ÷ 12",
      format: (value: number) => `$${value.toFixed(2)}`
    }
  },
  { 
    value: "creditScore", 
    label: "Estimated Credit Score", 
    type: "calculated", 
    category: "derived",
    description: "Estimated credit score based on provided data",
    unit: "points",
    weight: 10,
    enabled: true,
    min: 300,
    max: 850,
    optimal: 750,
    calculation: {
      formula: "300 + " +
               "((age >= 25 && age <= 55) ? 50 : (age >= 22 && age < 25) ? 30 : (age > 55 && age <= 65) ? 40 : 0) + " +
               "(Math.min(annualIncome / 1000, 100) * 2) + " +
               "((debtToIncomeRatio < 0.3) ? 80 : (debtToIncomeRatio < 0.5) ? 50 : (debtToIncomeRatio < 0.7) ? 20 : 0) + " +
               "(Math.min(creditHistoryLength * 8, 80)) + " +
               "((employmentStatus === 'Employed') ? 60 : (employmentStatus === 'Self-Employed') ? 50 : (employmentStatus === 'Retired') ? 55 : 0) + " +
               "((educationLevel === 'PhD') ? 40 : (educationLevel === 'Master') ? 35 : (educationLevel === 'Bachelor') ? 30 : (educationLevel === 'Associate') ? 25 : (educationLevel === 'High School') ? 15 : 0) + " +
               "((creditUtilization < 0.3) ? 60 : (creditUtilization < 0.5) ? 40 : (creditUtilization < 0.7) ? 20 : 0) - " +
               "(latePayments12m * 15) - " +
               "(recentInquiries * 10)",
      dependencies: ["age", "annualIncome", "debtToIncomeRatio", "creditHistoryLength", "employmentStatus", "educationLevel", "creditUtilization", "latePayments12m", "recentInquiries"],
      description: "Complex calculation based on multiple factors",
      format: (value: number) => `${Math.max(300, Math.min(850, Math.floor(value)))}`
    }
  }
]

// Create default calculation engine instance
export const defaultCalculationEngine = new CalculationEngine(fieldDefinitions)