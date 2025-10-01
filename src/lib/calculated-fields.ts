/**
 * Calculated Fields System for ARC Credit Engine Pro
 * 
 * This system automatically computes financial metrics based on other field values,
 * reducing manual input errors and ensuring data consistency.
 */

export interface CalculatedFieldConfig {
  fieldName: string
  displayName: string
  description: string
  category: 'personal' | 'financial' | 'employment' | 'credit'
  calculation: 'debt-to-income-ratio' | 'credit-utilization' | 'custom'
  formula?: string
  dependencies: string[] // Field names this calculation depends on
  precision?: number // Decimal places for the result
  validation?: {
    min?: number
    max?: number
    required?: boolean
  }
}

export interface CalculationContext {
  [key: string]: any
  // Common expected fields
  annualIncome?: number
  monthlyExpenses?: number
  existingLoanAmount?: number
  loanAmount?: number
  creditLimit?: number
  creditCardBalance?: number
  totalDebt?: number
  monthlyDebtPayments?: number
}

/**
 * Predefined calculated field configurations
 */
export const CALCULATED_FIELDS: CalculatedFieldConfig[] = [
  {
    fieldName: 'debtToIncomeRatio',
    displayName: 'Debt-to-Income Ratio',
    description: 'Automatically calculated ratio of monthly debt payments to monthly income',
    category: 'financial',
    calculation: 'debt-to-income-ratio',
    dependencies: ['monthlyDebtPayments', 'annualIncome'],
    precision: 3,
    validation: {
      min: 0,
      max: 1,
      required: true
    }
  },
  {
    fieldName: 'creditUtilization',
    displayName: 'Credit Utilization',
    description: 'Automatically calculated ratio of credit card balance to credit limit',
    category: 'credit',
    calculation: 'credit-utilization',
    dependencies: ['creditCardBalance', 'creditLimit'],
    precision: 3,
    validation: {
      min: 0,
      max: 1,
      required: true
    }
  },
  {
    fieldName: 'totalDebtToIncome',
    displayName: 'Total Debt-to-Income',
    description: 'Ratio of total existing debt to annual income',
    category: 'financial',
    calculation: 'custom',
    formula: '(existingLoanAmount + loanAmount) / annualIncome',
    dependencies: ['existingLoanAmount', 'loanAmount', 'annualIncome'],
    precision: 3,
    validation: {
      min: 0,
      max: 10,
      required: false
    }
  }
]

/**
 * Main calculation engine for computed fields
 */
export class CalculatedFieldEngine {
  private configs: CalculatedFieldConfig[]

  constructor(configs: CalculatedFieldConfig[] = CALCULATED_FIELDS) {
    this.configs = configs
  }

  /**
   * Calculate all computed fields based on available data
   */
  calculateFields(context: CalculationContext): CalculationContext {
    const result: CalculationContext = { ...context }

    for (const config of this.configs) {
      try {
        const calculatedValue = this.calculateField(config, context)
        if (calculatedValue !== null) {
          result[config.fieldName] = calculatedValue
        }
      } catch (error) {
        console.warn(`Failed to calculate ${config.fieldName}:`, error)
      }
    }

    return result
  }

  /**
   * Calculate a single field
   */
  calculateField(config: CalculatedFieldConfig, context: CalculationContext): number | null {
    // Check if all dependencies are available
    const missingDependencies = config.dependencies.filter(dep => 
      context[dep] === undefined || context[dep] === null || context[dep] === ''
    )

    if (missingDependencies.length > 0) {
      return null
    }

    switch (config.calculation) {
      case 'debt-to-income-ratio':
        return this.calculateDebtToIncomeRatio(context)
      
      case 'credit-utilization':
        return this.calculateCreditUtilization(context)
      
      case 'custom':
        if (config.formula) {
          return this.calculateCustomFormula(config.formula, context)
        }
        break
      
      default:
        throw new Error(`Unknown calculation type: ${config.calculation}`)
    }

    return null
  }

  /**
   * Calculate Debt-to-Income Ratio
   * Formula: (Monthly Debt Payments / Monthly Income)
   */
  private calculateDebtToIncomeRatio(context: CalculationContext): number {
    const { monthlyDebtPayments = 0, annualIncome = 0 } = context

    if (annualIncome <= 0) {
      throw new Error('Annual income must be greater than 0')
    }

    const monthlyIncome = annualIncome / 12
    const ratio = monthlyDebtPayments / monthlyIncome

    return Math.min(Math.max(ratio, 0), 10) // Cap at 1000% to handle edge cases
  }

  /**
   * Calculate Credit Utilization
   * Formula: (Credit Card Balance / Credit Limit)
   */
  private calculateCreditUtilization(context: CalculationContext): number {
    const { creditCardBalance = 0, creditLimit = 0 } = context

    if (creditLimit <= 0) {
      throw new Error('Credit limit must be greater than 0')
    }

    const utilization = creditCardBalance / creditLimit
    return Math.min(Math.max(utilization, 0), 5) // Cap at 500% to handle edge cases
  }

  /**
   * Calculate custom formula using simple expression evaluation
   * Note: In production, consider using a more robust expression parser
   */
  private calculateCustomFormula(formula: string, context: CalculationContext): number {
    // Simple formula evaluation - replace field names with values
    let expression = formula

    // Replace each dependency with its value
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'number' && !isNaN(value)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g')
        expression = expression.replace(regex, value.toString())
      }
    }

    // Basic safety check - only allow numbers, operators, and parentheses
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      throw new Error('Invalid formula expression')
    }

    try {
      // WARNING: eval() can be dangerous. In production, use a proper expression parser.
      // For this demo, we'll use it with basic safety checks.
      const result = Function('"use strict"; return (' + expression + ')')()
      
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Formula must evaluate to a valid number')
      }

      return result
    } catch (error) {
      throw new Error(`Failed to evaluate formula: ${formula}. Error: ${error}`)
    }
  }

  /**
   * Get all calculated field configurations
   */
  getFieldConfigs(): CalculatedFieldConfig[] {
    return [...this.configs]
  }

  /**
   * Get configuration for a specific field
   */
  getFieldConfig(fieldName: string): CalculatedFieldConfig | undefined {
    return this.configs.find(config => config.fieldName === fieldName)
  }

  /**
   * Check if a field is a calculated field
   */
  isCalculatedField(fieldName: string): boolean {
    return this.configs.some(config => config.fieldName === fieldName)
  }

  /**
   * Get dependencies for a calculated field
   */
  getFieldDependencies(fieldName: string): string[] {
    const config = this.getFieldConfig(fieldName)
    return config ? config.dependencies : []
  }

  /**
   * Validate a calculated field value
   */
  validateField(fieldName: string, value: number): { isValid: boolean; errors: string[] } {
    const config = this.getFieldConfig(fieldName)
    const errors: string[] = []

    if (!config) {
      return { isValid: true, errors: [] }
    }

    if (config.validation?.required && (value === undefined || value === null)) {
      errors.push(`${config.displayName} is required`)
    }

    if (config.validation?.min !== undefined && value < config.validation.min) {
      errors.push(`${config.displayName} must be at least ${config.validation.min}`)
    }

    if (config.validation?.max !== undefined && value > config.validation.max) {
      errors.push(`${config.displayName} must not exceed ${config.validation.max}`)
    }

    return { isValid: errors.length === 0, errors }
  }
}

// Export singleton instance
export const calculatedFieldEngine = new CalculatedFieldEngine()

// Utility functions for common calculations
export const financialCalculations = {
  /**
   * Calculate monthly payment from annual income
   */
  monthlyIncome: (annualIncome: number): number => annualIncome / 12,

  /**
   * Calculate annual income from monthly income
   */
  annualIncome: (monthlyIncome: number): number => monthlyIncome * 12,

  /**
   * Calculate debt-to-income ratio with multiple debt sources
   */
  debtToIncomeRatio: (monthlyDebtPayments: number, annualIncome: number): number => {
    if (annualIncome <= 0) return 0
    return monthlyDebtPayments / (annualIncome / 12)
  },

  /**
   * Calculate credit utilization with multiple credit sources
   */
  creditUtilization: (totalBalance: number, totalLimit: number): number => {
    if (totalLimit <= 0) return 0
    return totalBalance / totalLimit
  },

  /**
   * Calculate total monthly debt payments
   */
  totalMonthlyDebt: (debts: { monthlyPayment: number }[]): number => {
    return debts.reduce((total, debt) => total + debt.monthlyPayment, 0)
  },

  /**
   * Calculate total credit limit
   */
  totalCreditLimit: (cards: { limit: number }[]): number => {
    return cards.reduce((total, card) => total + card.limit, 0)
  },

  /**
   * Calculate total credit balance
   */
  totalCreditBalance: (cards: { balance: number }[]): number => {
    return cards.reduce((total, card) => total + card.balance, 0)
  }
}