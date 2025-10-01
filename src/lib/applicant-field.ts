/**
 * Applicant Field Service
 * Manages configurable applicant information fields
 */

import { db } from '@/lib/db'

export interface ApplicantField {
  id: string
  fieldName: string
  displayName: string
  description?: string
  fieldType: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'radio'
  category: 'personal' | 'financial' | 'employment' | 'credit'
  isActive: boolean
  isRequired: boolean
  validationRules?: string
  options?: string
  defaultValue?: string
  placeholder?: string
  helpText?: string
  order: number
  scoringWeight?: number
  scoringConfig?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateApplicantFieldInput {
  fieldName: string
  displayName: string
  description?: string
  fieldType: ApplicantField['fieldType']
  category?: ApplicantField['category']
  isRequired?: boolean
  validationRules?: string
  options?: string
  defaultValue?: string
  placeholder?: string
  helpText?: string
  order?: number
  scoringWeight?: number
  scoringConfig?: string
}

export interface UpdateApplicantFieldInput extends Partial<CreateApplicantFieldInput> {
  id: string
}

export class ApplicantFieldService {
  /**
   * Get all applicant fields
   */
  static async getAll(): Promise<ApplicantField[]> {
    try {
      return await db.applicantField.findMany({
        orderBy: [
          { category: 'asc' },
          { order: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error fetching applicant fields:', error)
      throw new Error('Failed to fetch applicant fields')
    }
  }

  /**
   * Get active applicant fields only
   */
  static async getActive(): Promise<ApplicantField[]> {
    try {
      return await db.applicantField.findMany({
        where: { isActive: true },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error fetching active applicant fields:', error)
      throw new Error('Failed to fetch active applicant fields')
    }
  }

  /**
   * Get applicant fields by category
   */
  static async getByCategory(category: ApplicantField['category']): Promise<ApplicantField[]> {
    try {
      return await db.applicantField.findMany({
        where: { 
          category,
          isActive: true 
        },
        orderBy: { order: 'asc' }
      })
    } catch (error) {
      console.error(`Error fetching applicant fields for category ${category}:`, error)
      throw new Error(`Failed to fetch applicant fields for category ${category}`)
    }
  }

  /**
   * Get applicant fields used in scoring
   */
  static async getScoringFields(): Promise<ApplicantField[]> {
    try {
      return await db.applicantField.findMany({
        where: { 
          isActive: true,
          scoringWeight: { gt: 0 }
        },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error fetching scoring applicant fields:', error)
      throw new Error('Failed to fetch scoring applicant fields')
    }
  }

  /**
   * Get applicant field by ID
   */
  static async getById(id: string): Promise<ApplicantField | null> {
    try {
      return await db.applicantField.findUnique({
        where: { id }
      })
    } catch (error) {
      console.error(`Error fetching applicant field with ID ${id}:`, error)
      throw new Error('Failed to fetch applicant field')
    }
  }

  /**
   * Get applicant field by field name
   */
  static async getByFieldName(fieldName: string): Promise<ApplicantField | null> {
    try {
      return await db.applicantField.findUnique({
        where: { fieldName }
      })
    } catch (error) {
      console.error(`Error fetching applicant field with name ${fieldName}:`, error)
      throw new Error('Failed to fetch applicant field')
    }
  }

  /**
   * Create new applicant field
   */
  static async create(input: CreateApplicantFieldInput): Promise<ApplicantField> {
    try {
      // Check if field name already exists
      const existing = await this.getByFieldName(input.fieldName)
      if (existing) {
        throw new Error(`Field with name '${input.fieldName}' already exists`)
      }

      return await db.applicantField.create({
        data: {
          fieldName: input.fieldName,
          displayName: input.displayName,
          description: input.description,
          fieldType: input.fieldType,
          category: input.category || 'personal',
          isRequired: input.isRequired || false,
          validationRules: input.validationRules,
          options: input.options,
          defaultValue: input.defaultValue,
          placeholder: input.placeholder,
          helpText: input.helpText,
          order: input.order || 0,
          scoringWeight: input.scoringWeight,
          scoringConfig: input.scoringConfig
        }
      })
    } catch (error) {
      console.error('Error creating applicant field:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create applicant field')
    }
  }

  /**
   * Update applicant field
   */
  static async update(input: UpdateApplicantFieldInput): Promise<ApplicantField> {
    try {
      const { id, ...data } = input
      
      // Check if field exists
      const existing = await this.getById(id)
      if (!existing) {
        throw new Error(`Applicant field with ID ${id} not found`)
      }

      return await db.applicantField.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Error updating applicant field:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update applicant field')
    }
  }

  /**
   * Delete applicant field
   */
  static async delete(id: string): Promise<ApplicantField> {
    try {
      const existing = await this.getById(id)
      if (!existing) {
        throw new Error(`Applicant field with ID ${id} not found`)
      }

      return await db.applicantField.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting applicant field:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to delete applicant field')
    }
  }

  /**
   * Toggle applicant field active status
   */
  static async toggleActive(id: string): Promise<ApplicantField> {
    try {
      const existing = await this.getById(id)
      if (!existing) {
        throw new Error(`Applicant field with ID ${id} not found`)
      }

      return await db.applicantField.update({
        where: { id },
        data: { isActive: !existing.isActive }
      })
    } catch (error) {
      console.error('Error toggling applicant field active status:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to toggle applicant field active status')
    }
  }

  /**
   * Seed default applicant fields
   */
  static async seedDefaults(): Promise<ApplicantField[]> {
    try {
      const defaultFields: CreateApplicantFieldInput[] = [
        // Personal Information
        {
          fieldName: 'age',
          displayName: 'Age',
          description: 'Applicant age in years',
          fieldType: 'number',
          category: 'personal',
          isRequired: true,
          validationRules: JSON.stringify({
            min: 18,
            max: 100,
            required: true
          }),
          placeholder: 'e.g., 35',
          helpText: 'Must be between 18 and 100 years old',
          order: 1,
          scoringWeight: 1.0
        },
        {
          fieldName: 'educationLevel',
          displayName: 'Education Level',
          description: 'Highest education level completed',
          fieldType: 'select',
          category: 'personal',
          isRequired: true,
          options: JSON.stringify([
            'High School',
            'Associate',
            'Bachelor',
            'Master',
            'PhD'
          ]),
          placeholder: 'Select education level',
          helpText: 'Select your highest education level',
          order: 2,
          scoringWeight: 0.8
        },

        // Financial Information
        {
          fieldName: 'annualIncome',
          displayName: 'Annual Income',
          description: 'Gross annual income before taxes',
          fieldType: 'number',
          category: 'financial',
          isRequired: true,
          validationRules: JSON.stringify({
            min: 0,
            required: true
          }),
          placeholder: 'e.g., 75000',
          helpText: 'Enter your total annual income before taxes',
          order: 3,
          scoringWeight: 1.5
        },
        {
          fieldName: 'debtToIncomeRatio',
          displayName: 'Debt-to-Income Ratio',
          description: 'Monthly debt payments divided by monthly income',
          fieldType: 'number',
          category: 'financial',
          isRequired: true,
          validationRules: JSON.stringify({
            min: 0,
            max: 2,
            required: true
          }),
          placeholder: 'e.g., 0.35',
          helpText: 'Total monthly debt payments ÷ monthly gross income',
          order: 4,
          scoringWeight: 1.2
        },

        // Employment Information
        {
          fieldName: 'employmentStatus',
          displayName: 'Employment Status',
          description: 'Current employment status',
          fieldType: 'select',
          category: 'employment',
          isRequired: true,
          options: JSON.stringify([
            'Employed',
            'Self-Employed',
            'Retired',
            'Unemployed'
          ]),
          placeholder: 'Select employment status',
          helpText: 'Select your current employment status',
          order: 5,
          scoringWeight: 1.0
        },
        {
          fieldName: 'creditHistoryLength',
          displayName: 'Credit History Length',
          description: 'Number of years with credit history',
          fieldType: 'number',
          category: 'employment',
          isRequired: true,
          validationRules: JSON.stringify({
            min: 0,
            max: 50,
            required: true
          }),
          placeholder: 'e.g., 8',
          helpText: 'How many years you have had credit',
          order: 6,
          scoringWeight: 1.1
        },

        // Credit Information
        {
          fieldName: 'creditUtilization',
          displayName: 'Credit Utilization',
          description: 'Credit card balances divided by credit limits',
          fieldType: 'number',
          category: 'credit',
          isRequired: true,
          validationRules: JSON.stringify({
            min: 0,
            max: 2,
            required: true
          }),
          placeholder: 'e.g., 0.25',
          helpText: 'Total credit card balances ÷ total credit limits',
          order: 7,
          scoringWeight: 1.3
        },
        {
          fieldName: 'latePayments12m',
          displayName: 'Late Payments (12m)',
          description: 'Number of late payments in past 12 months',
          fieldType: 'number',
          category: 'credit',
          isRequired: true,
          validationRules: JSON.stringify({
            min: 0,
            required: true
          }),
          placeholder: 'e.g., 0',
          helpText: 'Count of payments 30+ days late in past year',
          order: 8,
          scoringWeight: 1.4
        }
      ]

      const createdFields: ApplicantField[] = []
      
      for (const fieldData of defaultFields) {
        try {
          // Check if field already exists
          const existing = await this.getByFieldName(fieldData.fieldName)
          if (!existing) {
            const field = await this.create(fieldData)
            createdFields.push(field)
          } else {
            // Update existing field with new configuration
            const updated = await this.update({ ...fieldData, id: existing.id })
            createdFields.push(updated)
          }
        } catch (error) {
          console.warn(`Failed to create/update field ${fieldData.fieldName}:`, error)
        }
      }

      return createdFields
    } catch (error) {
      console.error('Error seeding default applicant fields:', error)
      throw new Error('Failed to seed default applicant fields')
    }
  }

  /**
   * Get field type options for UI
   */
  static getFieldTypeOptions() {
    return [
      { value: 'text', label: 'Text Input' },
      { value: 'number', label: 'Number Input' },
      { value: 'select', label: 'Select Dropdown' },
      { value: 'checkbox', label: 'Checkbox' },
      { value: 'date', label: 'Date Picker' },
      { value: 'radio', label: 'Radio Buttons' }
    ]
  }

  /**
   * Get category options for UI
   */
  static getCategoryOptions() {
    return [
      { value: 'personal', label: 'Personal Information' },
      { value: 'financial', label: 'Financial Information' },
      { value: 'employment', label: 'Employment Information' },
      { value: 'credit', label: 'Credit Information' }
    ]
  }
}