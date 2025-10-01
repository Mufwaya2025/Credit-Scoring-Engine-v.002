"use client"

import { useState, useEffect, useCallback } from 'react'
import { calculatedFieldEngine, CalculationContext } from '@/lib/calculated-fields'

interface UseCalculatedFieldsResult {
  calculatedValues: CalculationContext
  updateField: (fieldName: string, value: any) => void
  calculateFields: (context: CalculationContext) => CalculationContext
  isCalculatedField: (fieldName: string) => boolean
  getFieldDependencies: (fieldName: string) => string[]
}

export function useCalculatedFields(): UseCalculatedFieldsResult {
  const [calculatedValues, setCalculatedValues] = useState<CalculationContext>({})

  const calculateFields = useCallback((context: CalculationContext): CalculationContext => {
    return calculatedFieldEngine.calculateFields(context)
  }, [])

  const updateField = useCallback((fieldName: string, value: any) => {
    setCalculatedValues(prev => {
      const updatedContext = { ...prev, [fieldName]: value }
      return calculateFields(updatedContext)
    })
  }, [calculateFields])

  const isCalculatedField = useCallback((fieldName: string): boolean => {
    return calculatedFieldEngine.isCalculatedField(fieldName)
  }, [])

  const getFieldDependencies = useCallback((fieldName: string): string[] => {
    return calculatedFieldEngine.getFieldDependencies(fieldName)
  }, [])

  return {
    calculatedValues,
    updateField,
    calculateFields,
    isCalculatedField,
    getFieldDependencies
  }
}

// Hook for form integration
interface UseFormWithCalculatedFieldsOptions {
  initialData?: CalculationContext
  onCalculatedFieldsChange?: (calculatedFields: CalculationContext) => void
}

export function useFormWithCalculatedFields(options: UseFormWithCalculatedFieldsOptions = {}) {
  const { initialData = {}, onCalculatedFieldsChange } = options
  const [formData, setFormData] = useState<CalculationContext>(initialData)
  const [calculatedFields, setCalculatedFields] = useState<CalculationContext>({})

  const updateField = useCallback((fieldName: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [fieldName]: value }
      const calculated = calculatedFieldEngine.calculateFields(updated)
      setCalculatedFields(calculated)
      
      if (onCalculatedFieldsChange) {
        onCalculatedFieldsChange(calculated)
      }
      
      return updated
    })
  }, [onCalculatedFieldsChange])

  const getAllFields = useCallback(() => {
    return { ...formData, ...calculatedFields }
  }, [formData, calculatedFields])

  const reset = useCallback(() => {
    setFormData(initialData)
    const calculated = calculatedFieldEngine.calculateFields(initialData)
    setCalculatedFields(calculated)
    
    if (onCalculatedFieldsChange) {
      onCalculatedFieldsChange(calculated)
    }
  }, [initialData, onCalculatedFieldsChange])

  return {
    formData,
    calculatedFields,
    updateField,
    getAllFields,
    reset
  }
}