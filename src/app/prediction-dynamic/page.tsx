"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFormWithCalculatedFields } from '@/hooks/use-calculated-fields'
import { calculatedFieldEngine } from '@/lib/calculated-fields'
import { Brain, Calculator, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface ApplicantField {
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
}

interface PredictionResult {
  creditScore: number
  approvalProbability: number
  approvalStatus: string
  riskLevel: string
  processingTime: number
  modelVersion: string
  timestamp: string
  rulesApplied?: boolean
  ruleResults?: any[]
  scoringBreakdown?: {
    totalScore: number
    maxScore: number
    baseScore: number
    results: any[]
    breakdown: {
      demographic: number
      financial: number
      credit: number
      employment: number
      general: number
    }
  }
  scoreInterpretation?: {
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
}

export default function PredictionDynamicPage() {
  const [fields, setFields] = useState<ApplicantField[]>([])
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingFields, setLoadingFields] = useState(true)

  const { formData, calculatedFields, updateField, getAllFields } = useFormWithCalculatedFields()

  const loadFields = async () => {
    try {
      setLoadingFields(true)
      const response = await fetch('/api/applicant-fields?active=true')
      if (response.ok) {
        const data = await response.json()
        setFields(data.data)
        
        // Initialize form data with default values
        const defaultData: Record<string, any> = {}
        data.data.forEach((field: ApplicantField) => {
          if (field.defaultValue) {
            defaultData[field.fieldName] = field.defaultValue
          }
        })
        
        // Initialize the form with default data
        Object.keys(defaultData).forEach(fieldName => {
          updateField(fieldName, defaultData[fieldName])
        })
      }
    } catch (error) {
      console.error('Error loading fields:', error)
    } finally {
      setLoadingFields(false)
    }
  }

  useEffect(() => {
    loadFields()
  }, [])

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const allData = getAllFields() // Includes both form data and calculated fields
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allData),
      })
      
      if (response.ok) {
        const result = await response.json()
        setPredictionResult(result)
      } else {
        console.error('Prediction failed')
      }
    } catch (error) {
      console.error('Error making prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderFormField = (field: ApplicantField) => {
    const value = formData[field.fieldName] || ''
    const calculatedValue = calculatedFields[field.fieldName]
    const isCalculated = calculatedFieldEngine.isCalculatedField(field.fieldName)
    
    // If it's a calculated field, show it as read-only
    if (isCalculated) {
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.fieldName} className="flex items-center gap-1">
            {field.displayName}
            <Badge variant="secondary" className="text-xs">Auto-calculated</Badge>
            {field.isRequired && <span className="text-red-500">*</span>}
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id={field.fieldName}
              value={calculatedValue !== undefined ? calculatedValue.toFixed(3) : ''}
              readOnly
              className="bg-muted/50"
            />
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </div>
          {field.helpText && (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          )}
          {calculatedValue !== undefined && (
            <p className="text-xs text-green-600">
              ✓ Automatically calculated from: {calculatedFieldEngine.getFieldDependencies(field.fieldName).join(', ')}
            </p>
          )}
        </div>
      )
    }
    
    switch (field.fieldType) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.fieldName} className="flex items-center gap-1">
              {field.displayName}
              {field.isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.fieldName}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => updateField(field.fieldName, e.target.value)}
              required={field.isRequired}
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        )
        
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.fieldName} className="flex items-center gap-1">
              {field.displayName}
              {field.isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.fieldName}
              type="number"
              step="0.01"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => updateField(field.fieldName, parseFloat(e.target.value) || 0)}
              required={field.isRequired}
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        )
        
      case 'select':
        let options = []
        try {
          options = field.options ? JSON.parse(field.options) : []
        } catch {
          options = []
        }
        
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.fieldName} className="flex items-center gap-1">
              {field.displayName}
              {field.isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Select 
              value={value} 
              onValueChange={(selectedValue) => updateField(field.fieldName, selectedValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Select ${field.displayName}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: string, index: number) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        )
        
      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.fieldName}
                checked={value}
                onCheckedChange={(checked) => updateField(field.fieldName, checked)}
              />
              <Label htmlFor={field.fieldName} className="flex items-center gap-1">
                {field.displayName}
                {field.isRequired && <span className="text-red-500">*</span>}
              </Label>
            </div>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        )
        
      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.fieldName} className="flex items-center gap-1">
              {field.displayName}
              {field.isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.fieldName}
              type="date"
              value={value}
              onChange={(e) => updateField(field.fieldName, e.target.value)}
              required={field.isRequired}
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        )
        
      default:
        return null
    }
  }

  const getFieldsByCategory = (category: string) => {
    return fields.filter(field => field.category === category)
  }

  if (loadingFields) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dynamic Credit Prediction</h1>
          <p className="text-muted-foreground">
            Make credit predictions using configurable applicant fields
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Applicant Information
            </CardTitle>
            <CardDescription>
              Enter applicant details to generate credit score prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="employment">Employment</TabsTrigger>
                  <TabsTrigger value="credit">Credit</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4">
                  {getFieldsByCategory('personal').map(renderFormField)}
                </TabsContent>
                
                <TabsContent value="financial" className="space-y-4">
                  {getFieldsByCategory('financial').map(renderFormField)}
                </TabsContent>
                
                <TabsContent value="employment" className="space-y-4">
                  {getFieldsByCategory('employment').map(renderFormField)}
                </TabsContent>
                
                <TabsContent value="credit" className="space-y-4">
                  {getFieldsByCategory('credit').map(renderFormField)}
                </TabsContent>
              </Tabs>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Credit Score
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Prediction Results
            </CardTitle>
            <CardDescription>
              Credit score analysis and recommendation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!predictionResult ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready for Prediction</h3>
                <p className="text-muted-foreground">
                  Fill out the applicant information form to generate a credit score prediction.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Credit Score Display */}
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold">
                    {predictionResult.creditScore}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {predictionResult.scoreInterpretation && (
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: predictionResult.scoreInterpretation.color }}
                      ></div>
                    )}
                    <Badge 
                      variant="outline"
                      style={{ 
                        backgroundColor: predictionResult.scoreInterpretation?.color + '20',
                        borderColor: predictionResult.scoreInterpretation?.color
                      }}
                    >
                      {predictionResult.scoreInterpretation?.range.name}
                    </Badge>
                  </div>
                </div>

                {/* Approval Status */}
                <div className="space-y-3">
                  <h4 className="font-medium">Decision</h4>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {predictionResult.approvalStatus === 'Approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className="font-medium">{predictionResult.approvalStatus}</span>
                    </div>
                    <Badge variant={predictionResult.approvalStatus === 'Approved' ? 'default' : 'secondary'}>
                      {predictionResult.riskLevel}
                    </Badge>
                  </div>
                </div>

                {/* Approval Probability */}
                <div className="space-y-3">
                  <h4 className="font-medium">Approval Probability</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence:</span>
                      <span className="font-medium">
                        {(predictionResult.approvalProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={predictionResult.approvalProbability * 100} />
                  </div>
                </div>

                {/* Score Interpretation */}
                {predictionResult.scoreInterpretation && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Score Interpretation</h4>
                    
                    <div className="p-3 border rounded-lg" style={{ backgroundColor: `${predictionResult.scoreInterpretation.color}10` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: predictionResult.scoreInterpretation.color }}
                        ></div>
                        <span className="font-semibold">{predictionResult.scoreInterpretation.range.name}</span>
                        <Badge variant="outline">
                          {predictionResult.scoreInterpretation.range.minScore} - {predictionResult.scoreInterpretation.range.maxScore || '∞'}
                        </Badge>
                      </div>
                      
                      {predictionResult.scoreInterpretation.range.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {predictionResult.scoreInterpretation.range.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Interest Rate:</span>
                          <div className={predictionResult.scoreInterpretation.interestRateAdjustment < 0 ? 'text-green-600' : predictionResult.scoreInterpretation.interestRateAdjustment > 0 ? 'text-red-600' : ''}>
                            {predictionResult.scoreInterpretation.interestRateAdjustment > 0 ? '+' : ''}{predictionResult.scoreInterpretation.interestRateAdjustment}%
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Loan Limit:</span>
                          <div className={predictionResult.scoreInterpretation.loanLimitAdjustment > 1 ? 'text-green-600' : predictionResult.scoreInterpretation.loanLimitAdjustment < 1 ? 'text-red-600' : ''}>
                            {predictionResult.scoreInterpretation.loanLimitAdjustment > 1 ? '+' : ''}{((predictionResult.scoreInterpretation.loanLimitAdjustment - 1) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Processing Time: {predictionResult.processingTime}ms</p>
                  <p>Model Version: {predictionResult.modelVersion}</p>
                  <p>Timestamp: {new Date(predictionResult.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  )
}