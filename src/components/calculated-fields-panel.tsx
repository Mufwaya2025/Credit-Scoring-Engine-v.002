"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calculator, 
  Plus, 
  Settings, 
  Info,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  DollarSign,
  CreditCard,
  TrendingUp
} from 'lucide-react'
import { calculatedFieldEngine, CALCULATED_FIELDS, CalculatedFieldConfig } from '@/lib/calculated-fields'
import { toast } from 'sonner'

interface CalculatedFieldStatus {
  fieldName: string
  displayName: string
  isActive: boolean
  lastCalculated?: string
  dependencies: string[]
  currentValue?: number
  validation?: {
    isValid: boolean
    errors: string[]
  }
}

export function CalculatedFieldsPanel() {
  const [calculatedFields, setCalculatedFields] = useState<CalculatedFieldConfig[]>(CALCULATED_FIELDS)
  const [fieldStatus, setFieldStatus] = useState<CalculatedFieldStatus[]>([])
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<CalculatedFieldConfig | null>(null)
  const [testData, setTestData] = useState<Record<string, any>>({})
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    loadFieldStatus()
  }, [])

  const loadFieldStatus = () => {
    const status: CalculatedFieldStatus[] = calculatedFields.map(field => ({
      fieldName: field.fieldName,
      displayName: field.displayName,
      isActive: true,
      dependencies: field.dependencies,
      validation: undefined
    }))
    setFieldStatus(status)
  }

  const handleToggleField = (fieldName: string) => {
    setFieldStatus(prev => prev.map(status => 
      status.fieldName === fieldName 
        ? { ...status, isActive: !status.isActive }
        : status
    ))
  }

  const handleConfigureField = (field: CalculatedFieldConfig) => {
    setSelectedField(field)
    setIsConfigOpen(true)
  }

  const handleTestCalculation = async () => {
    if (!selectedField) return

    setIsTesting(true)
    try {
      const result = calculatedFieldEngine.calculateField(selectedField, testData)
      
      if (result !== null) {
        const validation = calculatedFieldEngine.validateField(selectedField.fieldName, result)
        
        setFieldStatus(prev => prev.map(status => 
          status.fieldName === selectedField.fieldName
            ? { 
                ...status, 
                currentValue: result,
                lastCalculated: new Date().toISOString(),
                validation
              }
            : status
        ))

        if (validation.isValid) {
          toast.success('Calculation successful and valid')
        } else {
          toast.warning('Calculation completed but validation failed', {
            description: validation.errors.join(', ')
          })
        }
      } else {
        toast.error('Cannot calculate field - missing dependencies')
      }
    } catch (error) {
      toast.error('Calculation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const getCalculationIcon = (calculation: string) => {
    switch (calculation) {
      case 'debt-to-income-ratio': return <DollarSign className="h-4 w-4" />
      case 'credit-utilization': return <CreditCard className="h-4 w-4" />
      case 'custom': return <Calculator className="h-4 w-4" />
      default: return <TrendingUp className="h-4 w-4" />
    }
  }

  const getCalculationColor = (calculation: string) => {
    switch (calculation) {
      case 'debt-to-income-ratio': return 'bg-green-100 text-green-800'
      case 'credit-utilization': return 'bg-blue-100 text-blue-800'
      case 'custom': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatValue = (value: number | undefined, precision = 3) => {
    if (value === undefined) return 'Not calculated'
    return value.toFixed(precision)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculated Fields
          </h3>
          <p className="text-sm text-muted-foreground">
            Automatically computed financial metrics based on other field values
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Calculated fields</strong> automatically compute values based on other field inputs. 
          They reduce manual data entry and ensure calculation accuracy. 
          Dependencies are automatically detected and validated.
        </AlertDescription>
      </Alert>

      {/* Calculated Fields List */}
      <div className="grid gap-4">
        {calculatedFields.map((field) => {
          const status = fieldStatus.find(s => s.fieldName === field.fieldName)
          
          return (
            <Card key={field.fieldName} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getCalculationIcon(field.calculation)}
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {field.displayName}
                        {status?.validation && !status.validation.isValid && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        {status?.validation && status.validation.isValid && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {field.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCalculationColor(field.calculation)}>
                      {field.calculation.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <Badge variant="outline">
                      {field.category}
                    </Badge>
                    <Switch
                      checked={status?.isActive || false}
                      onCheckedChange={() => handleToggleField(field.fieldName)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConfigureField(field)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Dependencies */}
                <div>
                  <Label className="text-sm font-medium">Dependencies:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {field.dependencies.map(dep => (
                      <Badge key={dep} variant="secondary" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Current Value */}
                {status?.currentValue !== undefined && (
                  <div>
                    <Label className="text-sm font-medium">Current Value:</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-sm">
                        {formatValue(status.currentValue, field.precision)}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Validation Status */}
                {status?.validation && (
                  <div>
                    <Label className="text-sm font-medium">Validation:</Label>
                    <div className="mt-1">
                      {status.validation.isValid ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Valid
                        </Badge>
                      ) : (
                        <div className="space-y-1">
                          <Badge variant="destructive">Invalid</Badge>
                          <div className="text-xs text-red-600">
                            {status.validation.errors.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Last Calculated */}
                {status?.lastCalculated && (
                  <div className="text-xs text-muted-foreground">
                    Last calculated: {new Date(status.lastCalculated).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Configure Calculated Field
            </DialogTitle>
            <DialogDescription>
              Test and configure the calculation for {selectedField?.displayName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedField && (
            <div className="space-y-6">
              {/* Field Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Field Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedField.fieldName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Calculation Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedField.calculation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground">{selectedField.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Precision</Label>
                  <p className="text-sm text-muted-foreground">{selectedField.precision} decimal places</p>
                </div>
              </div>

              {/* Dependencies */}
              <div>
                <Label className="text-sm font-medium">Required Dependencies</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedField.dependencies.map(dep => (
                    <Badge key={dep} variant="outline">{dep}</Badge>
                  ))}
                </div>
              </div>

              {/* Test Data */}
              <div>
                <Label className="text-sm font-medium">Test Data</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Enter values for the dependencies to test the calculation
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {selectedField.dependencies.map(dep => (
                    <div key={dep} className="space-y-1">
                      <Label htmlFor={`test-${dep}`} className="text-xs">{dep}</Label>
                      <Input
                        id={`test-${dep}`}
                        type="number"
                        step="0.01"
                        placeholder={`Enter ${dep}`}
                        value={testData[dep] || ''}
                        onChange={(e) => setTestData(prev => ({
                          ...prev,
                          [dep]: parseFloat(e.target.value) || 0
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Result */}
              <div>
                <Label className="text-sm font-medium">Test Result</Label>
                <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                  {fieldStatus.find(s => s.fieldName === selectedField.fieldName)?.currentValue !== undefined ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Calculated Value:</span>
                        <Badge variant="outline">
                          {formatValue(fieldStatus.find(s => s.fieldName === selectedField.fieldName)?.currentValue, selectedField.precision)}
                        </Badge>
                      </div>
                      {fieldStatus.find(s => s.fieldName === selectedField.fieldName)?.validation && (
                        <div className="flex items-center gap-2">
                          {fieldStatus.find(s => s.fieldName === selectedField.fieldName)?.validation?.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-xs">
                            {fieldStatus.find(s => s.fieldName === selectedField.fieldName)?.validation?.isValid ? 'Valid' : 'Invalid'}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter test data and click "Test Calculation" to see the result
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={handleTestCalculation}
              disabled={isTesting || !selectedField}
            >
              {isTesting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Test Calculation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}