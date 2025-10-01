"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, CheckCircle, AlertTriangle, Info, Settings } from "lucide-react"
import { 
  ApplicantData, 
  CalculationEngine, 
  fieldDefinitions, 
  defaultCalculationEngine 
} from "@/lib/calculation-engine"
import { FieldConfiguration } from "./field-configuration"

interface ApplicantDataPanelProps {
  data: ApplicantData
  onChange: (data: ApplicantData) => void
  calculationEngine?: CalculationEngine
  onEngineUpdate?: (engine: CalculationEngine) => void
}

export function ApplicantDataPanel({ 
  data, 
  onChange, 
  calculationEngine = defaultCalculationEngine,
  onEngineUpdate
}: ApplicantDataPanelProps) {
  const [calculatedData, setCalculatedData] = useState<ApplicantData>({})
  const [validation, setValidation] = useState<{ valid: boolean; missing: string[] }>({
    valid: true,
    missing: []
  })

  // Auto-calculate derived fields when base data changes
  useEffect(() => {
    const calculated = calculationEngine.calculateAllFields(data)
    setCalculatedData(calculated)
    
    // Validate base fields
    const validation = calculationEngine.validateBaseFields(data)
    setValidation(validation)
  }, [data, calculationEngine])

  const handleBaseFieldChange = (field: string, value: string) => {
    const fieldDef = fieldDefinitions.find(f => f.value === field)
    
    let processedValue: any = value
    
    if (fieldDef?.type === "number") {
      const numValue = parseFloat(value) || 0
      processedValue = isNaN(numValue) ? 0 : numValue
    } else if (fieldDef?.type === "string") {
      processedValue = value
    }
    
    const newData = { 
      ...data, 
      [field]: processedValue 
    }
    onChange(newData)
  }

  const baseFields = calculationEngine.getBaseFields()
  const derivedFields = calculationEngine.getCalculatedFields()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Applicant Information & Configuration
            </CardTitle>
            <CardDescription>
              Enter applicant information and configure field weights for custom scoring
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {validation.valid ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Incomplete
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data-entry" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="data-entry" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Data Entry
            </TabsTrigger>
            <TabsTrigger value="configuration" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Field Configuration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="data-entry" className="space-y-6">
            {/* Validation Alert */}
            {!validation.valid && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Missing required information: {validation.missing.join(", ")}. 
                  Please fill in all base fields to enable calculations.
                </AlertDescription>
              </Alert>
            )}

            {/* Base Fields Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <span>Base Information</span>
                <Badge variant="secondary" className="text-xs">
                  Manual Input Required
                </Badge>
              </h3>
              
              {/* Number Fields */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-blue-700">Numeric Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {baseFields.filter(field => field.type === "number").map(field => (
                    <div key={field.value} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={field.value} className="text-sm font-medium">
                          {field.label}
                          {field.unit && (
                            <span className="text-muted-foreground ml-1">({field.unit})</span>
                          )}
                        </Label>
                        {field.weight && (
                          <Badge variant="outline" className="text-xs">
                            w{field.weight}
                          </Badge>
                        )}
                      </div>
                      <Input
                        id={field.value}
                        type="number"
                        value={data[field.value] || ""}
                        onChange={(e) => handleBaseFieldChange(field.value, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="transition-colors focus:border-blue-500"
                      />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {field.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* String Fields */}
              <div>
                <h4 className="text-md font-medium mb-3 text-purple-700">Categorical Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {baseFields.filter(field => field.type === "string").map(field => (
                    <div key={field.value} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={field.value} className="text-sm font-medium">
                          {field.label}
                        </Label>
                        {field.weight && (
                          <Badge variant="outline" className="text-xs">
                            w{field.weight}
                          </Badge>
                        )}
                      </div>
                      {field.value === "employmentStatus" ? (
                        <select
                          id={field.value}
                          value={data[field.value] || ""}
                          onChange={(e) => handleBaseFieldChange(field.value, e.target.value)}
                          className="w-full p-2 border border-input bg-background text-sm rounded-md focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select employment status</option>
                          <option value="Employed">Employed</option>
                          <option value="Self-Employed">Self-Employed</option>
                          <option value="Retired">Retired</option>
                          <option value="Unemployed">Unemployed</option>
                          <option value="Student">Student</option>
                        </select>
                      ) : field.value === "educationLevel" ? (
                        <select
                          id={field.value}
                          value={data[field.value] || ""}
                          onChange={(e) => handleBaseFieldChange(field.value, e.target.value)}
                          className="w-full p-2 border border-input bg-background text-sm rounded-md focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select education level</option>
                          <option value="PhD">PhD</option>
                          <option value="Master">Master's Degree</option>
                          <option value="Bachelor">Bachelor's Degree</option>
                          <option value="Associate">Associate's Degree</option>
                          <option value="High School">High School</option>
                          <option value="Some College">Some College</option>
                        </select>
                      ) : (
                        <Input
                          id={field.value}
                          type="text"
                          value={data[field.value] || ""}
                          onChange={(e) => handleBaseFieldChange(field.value, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="transition-colors focus:border-blue-500"
                        />
                      )}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {field.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Fields Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <span>Calculated Fields</span>
                <Badge variant="outline" className="text-xs bg-blue-50">
                  <Calculator className="h-3 w-3 mr-1" />
                  Automatic
                </Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {derivedFields.map(field => {
                  const value = calculatedData[field.value]
                  const isValid = value !== null && value !== undefined && !isNaN(value)
                  const dependencies = calculationEngine.getDependencies(field.value)
                  const missingDeps = dependencies.filter(dep => data[dep] === undefined || data[dep] === null)
                  
                  return (
                    <div key={field.value} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={field.value} className="text-sm font-medium">
                          {field.label}
                          {field.unit && (
                            <span className="text-muted-foreground ml-1">({field.unit})</span>
                          )}
                        </Label>
                        {field.weight && (
                          <Badge variant="outline" className="text-xs">
                            w{field.weight}
                          </Badge>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          id={field.value}
                          type="number"
                          value={isValid ? value : ""}
                          readOnly
                          className={`bg-muted/50 ${
                            isValid ? "text-green-700" : "text-muted-foreground"
                          }`}
                          placeholder={isValid ? "" : "—"}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </div>
                      
                      {/* Field Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {field.description}
                      </p>
                      
                      {/* Formula Display */}
                      {field.calculation && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Info className="h-3 w-3 text-blue-600" />
                            <span className="text-xs font-medium text-blue-800">Formula:</span>
                          </div>
                          <p className="text-xs text-blue-700 font-mono">
                            {field.calculation.description}
                          </p>
                        </div>
                      )}
                      
                      {/* Dependencies Status */}
                      {missingDeps.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2">
                          <p className="text-xs text-orange-800">
                            Requires: {missingDeps.map(dep => {
                              const depField = baseFields.find(f => f.value === dep)
                              return depField ? depField.label : dep
                            }).join(", ")}
                          </p>
                        </div>
                      )}
                      
                      {/* Formatted Value */}
                      {isValid && field.calculation?.format && (
                        <p className="text-xs font-medium text-green-700">
                          {field.calculation.format(value)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Summary Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Applicant Profile Summary</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Base Fields:</span>
                    <span className="ml-2">{baseFields.length} fields</span>
                  </div>
                  <div>
                    <span className="font-medium">Calculated Fields:</span>
                    <span className="ml-2">{derivedFields.length} fields</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 ${validation.valid ? "text-green-600" : "text-orange-600"}`}>
                      {validation.valid ? "Ready for evaluation" : "Incomplete data"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Accuracy:</span>
                    <span className="ml-2 text-green-600">100% Automatic</span>
                  </div>
                </div>
                
                {/* Key Metrics Display */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-3">Key Credit Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {calculatedData.creditScore && (
                      <div className="bg-white rounded p-3 border">
                        <div className="text-xs text-muted-foreground">Credit Score</div>
                        <div className="text-lg font-bold">{calculatedData.creditScore}</div>
                        <div className="text-xs text-green-600">
                          {calculatedData.creditScore >= 700 ? "Excellent" : 
                           calculatedData.creditScore >= 650 ? "Good" : 
                           calculatedData.creditScore >= 600 ? "Fair" : "Poor"}
                        </div>
                      </div>
                    )}
                    
                    {calculatedData.debtToIncomeRatio !== undefined && (
                      <div className="bg-white rounded p-3 border">
                        <div className="text-xs text-muted-foreground">DTI Ratio</div>
                        <div className="text-lg font-bold">
                          {(calculatedData.debtToIncomeRatio * 100).toFixed(1)}%
                        </div>
                        <div className={`text-xs ${
                          calculatedData.debtToIncomeRatio <= 0.36 ? "text-green-600" :
                          calculatedData.debtToIncomeRatio <= 0.43 ? "text-orange-600" : "text-red-600"
                        }`}>
                          {calculatedData.debtToIncomeRatio <= 0.36 ? "Excellent" :
                           calculatedData.debtToIncomeRatio <= 0.43 ? "Acceptable" : "High Risk"}
                        </div>
                      </div>
                    )}
                    
                    {calculatedData.creditUtilization !== undefined && (
                      <div className="bg-white rounded p-3 border">
                        <div className="text-xs text-muted-foreground">Credit Utilization</div>
                        <div className="text-lg font-bold">
                          {(calculatedData.creditUtilization * 100).toFixed(1)}%
                        </div>
                        <div className={`text-xs ${
                          calculatedData.creditUtilization <= 0.10 ? "text-green-600" :
                          calculatedData.creditUtilization <= 0.30 ? "text-orange-600" : "text-red-600"
                        }`}>
                          {calculatedData.creditUtilization <= 0.10 ? "Excellent" :
                           calculatedData.creditUtilization <= 0.30 ? "Good" : "High Risk"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="configuration" className="space-y-6">
            {onEngineUpdate ? (
              <FieldConfiguration 
                calculationEngine={calculationEngine}
                applicantData={data}
                onEngineUpdate={onEngineUpdate}
              />
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Field configuration is not available in this context. Please use the full rules configuration page to customize field weights and settings.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}