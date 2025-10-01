"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  Plus, 
  Trash2, 
  Weight, 
  Eye, 
  EyeOff, 
  Info,
  TrendingUp,
  Calculator,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { 
  FieldDefinition, 
  ApplicantData, 
  CalculationEngine, 
  defaultCalculationEngine 
} from "@/lib/calculation-engine"

interface FieldConfigurationProps {
  calculationEngine: CalculationEngine
  applicantData: ApplicantData
  onEngineUpdate: (engine: CalculationEngine) => void
}

export function FieldConfiguration({ 
  calculationEngine, 
  applicantData, 
  onEngineUpdate 
}: FieldConfigurationProps) {
  const [fields, setFields] = useState<FieldDefinition[]>([])
  const [overallScore, setOverallScore] = useState<any>(null)
  const [isAddingField, setIsAddingField] = useState(false)
  const [newField, setNewField] = useState<Partial<FieldDefinition>>({
    value: "",
    label: "",
    type: "number",
    category: "base",
    description: "",
    weight: 5,
    enabled: true
  })

  useEffect(() => {
    setFields(calculationEngine.getBaseFields().concat(calculationEngine.getCalculatedFields()))
    
    // Calculate overall score
    const score = calculationEngine.calculateOverallScore(applicantData)
    setOverallScore(score)
  }, [calculationEngine, applicantData])

  const handleFieldUpdate = (fieldValue: string, updates: Partial<FieldDefinition>) => {
    const updatedFields = fields.map(field => 
      field.value === fieldValue ? { ...field, ...updates } : field
    )
    setFields(updatedFields)
    
    // Update the calculation engine
    const fieldUpdates: { [key: string]: Partial<FieldDefinition> } = {}
    fieldUpdates[fieldValue] = updates
    calculationEngine.updateFieldConfig(fieldUpdates)
    
    onEngineUpdate(calculationEngine)
    
    // Recalculate overall score
    const score = calculationEngine.calculateOverallScore(applicantData)
    setOverallScore(score)
  }

  const handleFieldToggle = (fieldValue: string, enabled: boolean) => {
    handleFieldUpdate(fieldValue, { enabled })
  }

  const handleWeightChange = (fieldValue: string, weight: number) => {
    handleFieldUpdate(fieldValue, { weight })
  }

  const handleAddField = () => {
    if (!newField.value || !newField.label) return
    
    const fieldDef: FieldDefinition = {
      value: newField.value!,
      label: newField.label!,
      type: newField.type as "number" | "string" | "calculated",
      category: newField.category as "base" | "derived",
      description: newField.description || "",
      weight: newField.weight || 5,
      enabled: newField.enabled !== false
    }
    
    calculationEngine.addCustomField(fieldDef)
    onEngineUpdate(calculationEngine)
    
    setFields(calculationEngine.getBaseFields().concat(calculationEngine.getCalculatedFields()))
    setIsAddingField(false)
    setNewField({
      value: "",
      label: "",
      type: "number",
      category: "base",
      description: "",
      weight: 5,
      enabled: true
    })
  }

  const handleRemoveField = (fieldValue: string) => {
    calculationEngine.removeField(fieldValue)
    onEngineUpdate(calculationEngine)
    
    setFields(calculationEngine.getBaseFields().concat(calculationEngine.getCalculatedFields()))
    
    // Recalculate overall score
    const score = calculationEngine.calculateOverallScore(applicantData)
    setOverallScore(score)
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent"
    if (percentage >= 60) return "Good"
    if (percentage >= 40) return "Fair"
    return "Poor"
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Weighted Score
          </CardTitle>
          <CardDescription>
            Credit score based on weighted field values and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overallScore ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    <span className={getScoreColor(overallScore.percentage)}>
                      {overallScore.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Score: {overallScore.totalScore.toFixed(1)} / {overallScore.maxScore.toFixed(1)}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={overallScore.percentage >= 80 ? "default" : overallScore.percentage >= 60 ? "secondary" : "destructive"}>
                    {getScoreLabel(overallScore.percentage)}
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${
                    overallScore.percentage >= 80 ? "bg-green-500" :
                    overallScore.percentage >= 60 ? "bg-orange-500" : "bg-red-500"
                  }`}
                  style={{ width: `${overallScore.percentage}%` }}
                ></div>
              </div>
              
              {/* Field Contributions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {overallScore.details
                  .sort((a, b) => b.weightedScore - a.weightedScore)
                  .slice(0, 6)
                  .map((detail, index) => (
                    <div key={index} className="bg-muted/50 rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{detail.label}</span>
                        <Badge variant="outline" className="text-xs">
                          w{detail.weight}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Score: {detail.weightedScore.toFixed(2)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="h-1 rounded-full bg-blue-500"
                          style={{ width: `${(detail.normalizedScore * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Enter applicant data to see weighted score calculations
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Field Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Field Configuration
              </CardTitle>
              <CardDescription>
                Configure weights, enable/disable fields, and manage scoring parameters
              </CardDescription>
            </div>
            <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Field
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Field</DialogTitle>
                  <DialogDescription>
                    Create a new custom field for scoring
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="field-value">Field Value (Code)</Label>
                    <Input
                      id="field-value"
                      value={newField.value || ""}
                      onChange={(e) => setNewField({...newField, value: e.target.value})}
                      placeholder="e.g., customField1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="field-label">Field Label</Label>
                    <Input
                      id="field-label"
                      value={newField.label || ""}
                      onChange={(e) => setNewField({...newField, label: e.target.value})}
                      placeholder="e.g., Custom Field 1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="field-type">Type</Label>
                      <Select 
                        value={newField.type} 
                        onValueChange={(value) => setNewField({...newField, type: value as any})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="string">String</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="field-category">Category</Label>
                      <Select 
                        value={newField.category} 
                        onValueChange={(value) => setNewField({...newField, category: value as any})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base">Base</SelectItem>
                          <SelectItem value="derived">Derived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="field-description">Description</Label>
                    <Input
                      id="field-description"
                      value={newField.description || ""}
                      onChange={(e) => setNewField({...newField, description: e.target.value})}
                      placeholder="Field description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="field-weight">Weight (1-10)</Label>
                    <Slider
                      value={[newField.weight || 5]}
                      onValueChange={(value) => setNewField({...newField, weight: value[0]})}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Current: {newField.weight || 5}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingField(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddField}>
                    Add Field
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="numeric" className="space-y-4">
            <TabsList>
              <TabsTrigger value="numeric">Numeric Fields</TabsTrigger>
              <TabsTrigger value="categorical">Categorical Fields</TabsTrigger>
              <TabsTrigger value="calculated">Calculated Fields</TabsTrigger>
            </TabsList>
            
            <TabsContent value="numeric" className="space-y-4">
              <div className="grid gap-4">
                {fields
                  .filter(field => field.type === "number" && field.category === "base")
                  .map(field => (
                    <FieldConfigCard 
                      key={field.value}
                      field={field}
                      onUpdate={handleFieldUpdate}
                      onToggle={handleFieldToggle}
                      onWeightChange={handleWeightChange}
                      onRemove={handleRemoveField}
                      applicantData={applicantData}
                      overallScore={overallScore}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="categorical" className="space-y-4">
              <div className="grid gap-4">
                {fields
                  .filter(field => field.type === "string")
                  .map(field => (
                    <FieldConfigCard 
                      key={field.value}
                      field={field}
                      onUpdate={handleFieldUpdate}
                      onToggle={handleFieldToggle}
                      onWeightChange={handleWeightChange}
                      onRemove={handleRemoveField}
                      applicantData={applicantData}
                      overallScore={overallScore}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="calculated" className="space-y-4">
              <div className="grid gap-4">
                {fields
                  .filter(field => field.category === "derived")
                  .map(field => (
                    <FieldConfigCard 
                      key={field.value}
                      field={field}
                      onUpdate={handleFieldUpdate}
                      onToggle={handleFieldToggle}
                      onWeightChange={handleWeightChange}
                      onRemove={handleRemoveField}
                      applicantData={applicantData}
                      overallScore={overallScore}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface FieldConfigCardProps {
  field: FieldDefinition
  onUpdate: (fieldValue: string, updates: Partial<FieldDefinition>) => void
  onToggle: (fieldValue: string, enabled: boolean) => void
  onWeightChange: (fieldValue: string, weight: number) => void
  onRemove: (fieldValue: string) => void
  applicantData: ApplicantData
  overallScore: any
}

function FieldConfigCard({ 
  field, 
  onUpdate, 
  onToggle, 
  onWeightChange, 
  onRemove,
  applicantData,
  overallScore 
}: FieldConfigCardProps) {
  const fieldScore = overallScore?.details?.find((d: any) => d.field === field.value)
  
  return (
    <Card className={`${field.enabled === false ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{field.label}</h3>
                <Badge variant="outline" className="text-xs">
                  {field.category === "base" ? "Base" : "Derived"}
                </Badge>
                {field.unit && (
                  <Badge variant="secondary" className="text-xs">
                    {field.unit}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.enabled !== false}
                  onCheckedChange={(checked) => onToggle(field.value, checked)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(field.value)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {field.description}
            </p>
            
            {/* Weight Configuration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Weight</Label>
                <Badge variant="outline" className="text-xs">
                  {field.weight || 0}
                </Badge>
              </div>
              <Slider
                value={[field.weight || 0]}
                onValueChange={(value) => onWeightChange(field.value, value[0])}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 (No Impact)</span>
                <span>10 (High Impact)</span>
              </div>
            </div>
            
            {/* Field Score */}
            {fieldScore && field.enabled !== false && (
              <div className="bg-blue-50 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Field Contribution</span>
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                    {fieldScore.weightedScore.toFixed(2)}
                  </Badge>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${(fieldScore.normalizedScore * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Normalized: {(fieldScore.normalizedScore * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}