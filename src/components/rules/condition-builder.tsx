"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Code, Eye, EyeOff } from "lucide-react"

interface ConditionBuilderProps {
  condition: string
  onConditionChange: (condition: string) => void
  showJson?: boolean
  onToggleJson?: () => void
}

interface ConditionData {
  field: string
  operator: string
  value: any
}

const fieldOptions = [
  { value: "creditScore", label: "Credit Score", type: "number", description: "Applicant's credit score" },
  { value: "annualIncome", label: "Annual Income", type: "number", description: "Applicant's annual income" },
  { value: "loanAmount", label: "Loan Amount", type: "number", description: "Requested loan amount" },
  { value: "creditHistoryLength", label: "Credit History Length", type: "number", description: "Years of credit history" },
  { value: "debtToIncomeRatio", label: "Debt-to-Income Ratio", type: "number", description: "Debt divided by income (0-1)" },
  { value: "employmentStatus", label: "Employment Status", type: "string", description: "Current employment status" },
  { value: "educationLevel", label: "Education Level", type: "string", description: "Highest education level" },
  { value: "monthlyExpenses", label: "Monthly Expenses", type: "number", description: "Total monthly expenses" },
  { value: "existingLoanAmount", label: "Existing Loan Amount", type: "number", description: "Current outstanding loans" },
  { value: "creditUtilization", label: "Credit Utilization", type: "number", description: "Credit utilization ratio (0-1)" },
  { value: "latePayments12m", label: "Late Payments (12m)", type: "number", description: "Late payments in last 12 months" },
  { value: "recentInquiries", label: "Recent Inquiries", type: "number", description: "Recent credit inquiries" },
  { value: "age", label: "Age", type: "number", description: "Applicant's age" },
  { value: "employmentDuration", label: "Employment Duration", type: "number", description: "Months at current job" }
]

const operatorOptions = [
  { value: ">", label: "Greater than", types: ["number"] },
  { value: "<", label: "Less than", types: ["number"] },
  { value: ">=", label: "Greater than or equal", types: ["number"] },
  { value: "<=", label: "Less than or equal", types: ["number"] },
  { value: "==", label: "Equal to", types: ["number", "string"] },
  { value: "!=", label: "Not equal to", types: ["number", "string"] },
  { value: "includes", label: "Includes", types: ["string"] },
  { value: "startsWith", label: "Starts with", types: ["string"] },
  { value: "endsWith", label: "Ends with", types: ["string"] }
]

export function ConditionBuilder({ condition, onConditionChange, showJson = false, onToggleJson }: ConditionBuilderProps) {
  const [conditionData, setConditionData] = useState<ConditionData>(() => {
    try {
      if (condition) {
        const parsed = JSON.parse(condition)
        return {
          field: parsed.field || "creditScore",
          operator: parsed.operator || ">",
          value: parsed.value !== undefined ? parsed.value : ""
        }
      }
    } catch (error) {
      // If JSON is invalid, use defaults
    }
    
    return {
      field: "creditScore",
      operator: ">",
      value: ""
    }
  })

  const selectedField = fieldOptions.find(f => f.value === conditionData.field)
  const availableOperators = operatorOptions.filter(op => 
    selectedField && op.types.includes(selectedField.type)
  )

  const updateCondition = (updates: Partial<ConditionData>) => {
    const newConditionData = { ...conditionData, ...updates }
    setConditionData(newConditionData)
    
    // Convert to JSON and call parent callback
    const jsonString = JSON.stringify({
      field: newConditionData.field,
      operator: newConditionData.operator,
      value: newConditionData.value
    })
    onConditionChange(jsonString)
  }

  const handleFieldChange = (field: string) => {
    const newField = fieldOptions.find(f => f.value === field)
    if (newField) {
      // Reset value if field type changes
      const currentValue = conditionData.value
      const newValue = newField.type === "number" && typeof currentValue === "string" 
        ? (parseFloat(currentValue) || 0)
        : newField.type === "string" && typeof currentValue === "number"
        ? String(currentValue)
        : currentValue
      
      updateCondition({
        field,
        operator: availableOperators[0]?.value || ">",
        value: newValue
      })
    }
  }

  const handleValueChange = (value: string) => {
    const selectedField = fieldOptions.find(f => f.value === conditionData.field)
    if (selectedField) {
      if (selectedField.type === "number") {
        const numValue = parseFloat(value) || 0
        updateCondition({ value: numValue })
      } else {
        updateCondition({ value: value })
      }
    }
  }

  const getConditionPreview = () => {
    const field = fieldOptions.find(f => f.value === conditionData.field)
    const operator = operatorOptions.find(o => o.value === conditionData.operator)
    
    if (!field || !operator) return ""
    
    const valueDisplay = field.type === "number" 
      ? Number(conditionData.value).toLocaleString()
      : `"${conditionData.value}"`
    
    return `${field.label} ${operator.label.toLowerCase()} ${valueDisplay}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Condition Builder</CardTitle>
            <CardDescription>
              Build your rule condition using the visual form below
            </CardDescription>
          </div>
          {onToggleJson && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleJson}
            >
              {showJson ? <Eye className="h-4 w-4 mr-2" /> : <Code className="h-4 w-4 mr-2" />}
              {showJson ? "Show Builder" : "Show JSON"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showJson ? (
          <>
            {/* Visual Builder */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="field-select">Field</Label>
                <Select value={conditionData.field} onValueChange={handleFieldChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        <div>
                          <div className="font-medium">{field.label}</div>
                          <div className="text-xs text-muted-foreground">{field.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedField && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedField.description} (Type: {selectedField.type})
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="operator-select">Operator</Label>
                <Select 
                  value={conditionData.operator} 
                  onValueChange={(value) => updateCondition({ operator: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOperators.map((operator) => (
                      <SelectItem key={operator.value} value={operator.value}>
                        {operator.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value-input">Value</Label>
                {selectedField?.type === "number" ? (
                  <Input
                    id="value-input"
                    type="number"
                    value={conditionData.value}
                    onChange={(e) => handleValueChange(e.target.value)}
                    placeholder="Enter a number"
                    step="any"
                  />
                ) : (
                  <Input
                    id="value-input"
                    type="text"
                    value={conditionData.value}
                    onChange={(e) => handleValueChange(e.target.value)}
                    placeholder="Enter text"
                  />
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">Preview</Badge>
              </div>
              <div className="font-mono text-sm">
                {getConditionPreview() || "Select field, operator, and value to see preview"}
              </div>
            </div>

            {/* Field Info */}
            {selectedField && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Field Information</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div><strong>Name:</strong> {selectedField.label}</div>
                  <div><strong>Type:</strong> {selectedField.type}</div>
                  <div><strong>Description:</strong> {selectedField.description}</div>
                  <div><strong>Available Operators:</strong> {availableOperators.map(o => o.label).join(", ")}</div>
                </div>
              </div>
            )}

            {/* Quick Start Examples */}
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-2">Quick Start Examples:</div>
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">Credit Score Rules:</div>
                  <div className="text-muted-foreground">• Credit Score greater than 600</div>
                  <div className="text-muted-foreground">• Credit Score less than 500</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Income Rules:</div>
                  <div className="text-muted-foreground">• Annual Income greater than 50000</div>
                  <div className="text-muted-foreground">• Debt-to-Income Ratio less than 0.4</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Employment Rules:</div>
                  <div className="text-muted-foreground">• Employment Duration greater than 6 months</div>
                  <div className="text-muted-foreground">• Employment Status equals "employed"</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* JSON View */}
            <div>
              <Label htmlFor="json-condition">Condition (JSON)</Label>
              <Textarea
                id="json-condition"
                value={condition}
                onChange={(e) => onConditionChange(e.target.value)}
                placeholder='{"field": "creditScore", "operator": ">", "value": 600}'
                className="font-mono text-sm"
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter the condition as a JSON object. Must include field, operator, and value properties.
              </p>
            </div>

            {/* JSON Examples */}
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-2">JSON Examples:</div>
              <div className="space-y-2 text-sm font-mono">
                <div className="bg-muted p-2 rounded">
                  {"{\"field\": \"creditScore\", \"operator\": \">\", \"value\": 600}"}
                  <div className="text-xs text-muted-foreground mt-1">Credit Score greater than 600</div>
                </div>
                <div className="bg-muted p-2 rounded">
                  {"{\"field\": \"debtToIncomeRatio\", \"operator\": \"<\", \"value\": 0.5}"}
                  <div className="text-xs text-muted-foreground mt-1">Debt-to-Income Ratio less than 0.5 (50%)</div>
                </div>
                <div className="bg-muted p-2 rounded">
                  {"{\"field\": \"employmentStatus\", \"operator\": \"==\", \"value\": \"employed\"}"}
                  <div className="text-xs text-muted-foreground mt-1">Employment Status equals "employed"</div>
                </div>
                <div className="bg-muted p-2 rounded">
                  {"{\"field\": \"age\", \"operator\": \">=\", \"value\": 21}"}
                  <div className="text-xs text-muted-foreground mt-1">Age greater than or equal to 21</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}