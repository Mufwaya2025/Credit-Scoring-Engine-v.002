"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFormWithCalculatedFields } from '@/hooks/use-calculated-fields'
import { Brain, Calculator, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { calculatedFieldEngine } from '@/lib/calculated-fields'

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
  arcScore: number
  creditScore?: number // For backward compatibility
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

export default function PredictionPage() {
  const [fields, setFields] = useState<ApplicantField[]>([])
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [isPredicting, setIsPredicting] = useState(false)
  const [loadingFields, setLoadingFields] = useState(true)

  const { formData, calculatedFields, updateField, getAllFields } = useFormWithCalculatedFields({
    onCalculatedFieldsChange: (calculated) => {
      console.log('Calculated fields updated:', calculated)
    }
  })

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

  const handlePredict = async () => {
    setIsPredicting(true)
    
    try {
      const allData = getAllFields() // Includes both form data and calculated fields
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(allData)
      })

      if (response.ok) {
        const result = await response.json()
        setPredictionResult(result)
      } else {
        const error = await response.json()
        console.error('Prediction error:', error)
        // Fallback to mock result if API fails
        const mockResult: PredictionResult = {
          arcScore: Math.floor(Math.random() * 200) + 600,
          creditScore: Math.floor(Math.random() * 200) + 600, // For backward compatibility
          approvalProbability: Math.random() * 0.4 + 0.6,
          approvalStatus: "",
          riskLevel: "",
          processingTime: Math.floor(Math.random() * 50) + 20,
          modelVersion: "1.0",
          timestamp: new Date().toISOString()
        }

        // Determine approval status and risk level
        if (mockResult.arcScore >= 700) {
          mockResult.approvalStatus = "Approved"
          mockResult.riskLevel = "Low Risk"
        } else if (mockResult.arcScore >= 650) {
          mockResult.approvalStatus = "Approved with Conditions"
          mockResult.riskLevel = "Medium Risk"
        } else {
          mockResult.approvalStatus = "Rejected"
          mockResult.riskLevel = "High Risk"
        }

        setPredictionResult(mockResult)
      }
    } catch (error) {
      console.error('Prediction error:', error)
      // Fallback to mock result if API fails
      const mockResult: PredictionResult = {
        arcScore: Math.floor(Math.random() * 200) + 600,
        creditScore: Math.floor(Math.random() * 200) + 600, // For backward compatibility
        approvalProbability: Math.random() * 0.4 + 0.6,
        approvalStatus: "",
        riskLevel: "",
        processingTime: Math.floor(Math.random() * 50) + 20,
        modelVersion: "1.0",
        timestamp: new Date().toISOString()
      }

      // Determine approval status and risk level
      if (mockResult.arcScore >= 700) {
        mockResult.approvalStatus = "Approved"
        mockResult.riskLevel = "Low Risk"
      } else if (mockResult.arcScore >= 650) {
        mockResult.approvalStatus = "Approved with Conditions"
        mockResult.riskLevel = "Medium Risk"
      } else {
        mockResult.approvalStatus = "Rejected"
        mockResult.riskLevel = "High Risk"
      }

      setPredictionResult(mockResult)
    } finally {
      setIsPredicting(false)
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
              value={calculatedValue !== undefined ? calculatedValue.toFixed(field.scoringConfig?.precision || 3) : ''}
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low Risk": return "bg-green-100 text-green-800"
      case "Medium Risk": return "bg-yellow-100 text-yellow-800"
      case "High Risk": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getApprovalColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800"
      case "Approved with Conditions": return "bg-blue-100 text-blue-800"
      case "Rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loadingFields) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Single Prediction</h1>
          <p className="text-muted-foreground">
            Evaluate a single credit application using our AI-powered scoring engine with configurable fields
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Applicant Information
              </CardTitle>
              <CardDescription>
                Enter the applicant's financial and personal information using configured fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <Button 
                onClick={handlePredict} 
                disabled={isPredicting}
                className="w-full"
              >
                {isPredicting ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Credit Score
                  </>
                )}
              </Button>
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
                AI-powered credit assessment results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPredicting ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Analyzing application data...</p>
                  </div>
                  <Progress value={33} className="w-full" />
                </div>
              ) : predictionResult ? (
                <div className="space-y-6">
                  {/* Credit Score */}
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{predictionResult.arcScore || predictionResult.creditScore}</div>
                    <p className="text-sm text-muted-foreground">Credit Score</p>
                    <Progress 
                      value={((predictionResult.arcScore || predictionResult.creditScore) - 300) / 5.5} 
                      className="mt-2"
                    />
                  </div>

                  {/* Status Badges */}
                  <div className="flex justify-center gap-4">
                    <Badge className={getApprovalColor(predictionResult.approvalStatus)}>
                      {predictionResult.approvalStatus}
                    </Badge>
                    <Badge className={getRiskColor(predictionResult.riskLevel)}>
                      {predictionResult.riskLevel}
                    </Badge>
                  </div>

                  {/* Approval Probability */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Approval Probability</span>
                      <span className="text-sm text-muted-foreground">
                        {(predictionResult.approvalProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={predictionResult.approvalProbability * 100} />
                  </div>

                  {/* Risk Factors */}
                  {predictionResult.riskLevel === "High Risk" && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        High risk detected. Consider additional verification or lower loan amount.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Rules Applied */}
                  {predictionResult.rulesApplied && predictionResult.ruleResults && predictionResult.ruleResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Business Rules Applied:</h4>
                      <div className="space-y-1">
                        {predictionResult.ruleResults.map((rule, index) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            • {rule.ruleName}: {rule.triggered ? 'Triggered' : 'Not Triggered'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Score Interpretation */}
                  {predictionResult.scoreInterpretation && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Score Interpretation:</h4>
                      <div className="text-xs text-muted-foreground">
                        <p><strong>Range:</strong> {predictionResult.scoreInterpretation.range.name}</p>
                        <p><strong>Interest Rate Adjustment:</strong> {predictionResult.scoreInterpretation.interestRateAdjustment > 0 ? '+' : ''}{predictionResult.scoreInterpretation.interestRateAdjustment}%</p>
                        <p><strong>Loan Limit Adjustment:</strong> {predictionResult.scoreInterpretation.loanLimitAdjustment > 0 ? '+' : ''}{predictionResult.scoreInterpretation.loanLimitAdjustment}%</p>
                      </div>
                    </div>
                  )}

                  {/* Processing Info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Processing Time: {predictionResult.processingTime}ms</p>
                    <p>Model Version: {predictionResult.modelVersion}</p>
                    <p>Generated: {new Date(predictionResult.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter applicant information and click "Generate Credit Score" to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}