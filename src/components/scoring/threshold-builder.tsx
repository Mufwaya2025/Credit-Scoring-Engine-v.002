"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Trash2, 
  Settings, 
  AlertTriangle, 
  Info,
  BarChart3,
  Target,
  Layers,
  Sliders
} from "lucide-react"

interface ThresholdConfig {
  type: 'linear' | 'threshold' | 'categorical' | 'optimal'
  thresholds: any
  onChange: (thresholds: any) => void
  maxPoints?: number
  factorName?: string
}

interface ThresholdRange {
  name: string
  min?: number
  max?: number
  points: number
  description?: string
}

interface CategoryOption {
  name: string
  points: number
  description?: string
}

export function ThresholdBuilder({ 
  type, 
  thresholds, 
  onChange, 
  maxPoints = 100, 
  factorName = "Factor" 
}: ThresholdConfig) {
  const [localThresholds, setLocalThresholds] = useState<any>(thresholds || {})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLocalThresholds(thresholds || getDefaultThresholds(type))
  }, [type, thresholds])

  const getDefaultThresholds = (calcType: string) => {
    switch (calcType) {
      case 'linear':
        return { min: 0, max: 100, rate: maxPoints / 100 }
      case 'threshold':
        return {
          ranges: [
            { name: "Excellent", min: 80, max: 100, points: maxPoints, description: "Outstanding performance" },
            { name: "Good", min: 60, max: 79, points: Math.floor(maxPoints * 0.8), description: "Above average" },
            { name: "Fair", min: 40, max: 59, points: Math.floor(maxPoints * 0.6), description: "Average performance" },
            { name: "Poor", min: 0, max: 39, points: Math.floor(maxPoints * 0.3), description: "Below average" }
          ]
        }
      case 'categorical':
        return {
          categories: [
            { name: "Excellent", points: maxPoints, description: "Best category" },
            { name: "Good", points: Math.floor(maxPoints * 0.8), description: "Above average" },
            { name: "Average", points: Math.floor(maxPoints * 0.6), description: "Standard category" },
            { name: "Poor", points: Math.floor(maxPoints * 0.3), description: "Below average" }
          ]
        }
      case 'optimal':
        return { optimal: 50, tolerance: 20, maxPoints: maxPoints }
      default:
        return {}
    }
  }

  const validateThresholds = (thresholds: any): boolean => {
    try {
      switch (type) {
        case 'linear':
          if (typeof thresholds.min !== 'number' || typeof thresholds.max !== 'number') {
            setError("Linear thresholds must have min and max values")
            return false
          }
          if (thresholds.min >= thresholds.max) {
            setError("Min value must be less than max value")
            return false
          }
          break
        case 'threshold':
          if (!Array.isArray(thresholds.ranges)) {
            setError("Threshold must have ranges array")
            return false
          }
          for (const range of thresholds.ranges) {
            if (typeof range.points !== 'number') {
              setError("Each range must have points")
              return false
            }
          }
          break
        case 'categorical':
          if (!Array.isArray(thresholds.categories)) {
            setError("Categorical must have categories array")
            return false
          }
          for (const category of thresholds.categories) {
            if (typeof category.points !== 'number') {
              setError("Each category must have points")
              return false
            }
          }
          break
        case 'optimal':
          if (typeof thresholds.optimal !== 'number' || typeof thresholds.tolerance !== 'number') {
            setError("Optimal must have optimal value and tolerance")
            return false
          }
          break
      }
      setError(null)
      return true
    } catch (err) {
      setError("Invalid threshold configuration")
      return false
    }
  }

  const updateThresholds = (newThresholds: any) => {
    if (validateThresholds(newThresholds)) {
      setLocalThresholds(newThresholds)
      onChange(newThresholds)
    }
  }

  const addThresholdRange = () => {
    const newRanges = [...(localThresholds.ranges || [])]
    newRanges.push({
      name: `Range ${newRanges.length + 1}`,
      min: 0,
      max: 100,
      points: Math.floor(maxPoints * 0.5),
      description: ""
    })
    updateThresholds({ ...localThresholds, ranges: newRanges })
  }

  const removeThresholdRange = (index: number) => {
    const newRanges = [...(localThresholds.ranges || [])]
    newRanges.splice(index, 1)
    updateThresholds({ ...localThresholds, ranges: newRanges })
  }

  const updateThresholdRange = (index: number, field: string, value: any) => {
    const newRanges = [...(localThresholds.ranges || [])]
    newRanges[index] = { ...newRanges[index], [field]: value }
    updateThresholds({ ...localThresholds, ranges: newRanges })
  }

  const addCategory = () => {
    const newCategories = [...(localThresholds.categories || [])]
    newCategories.push({
      name: `Category ${newCategories.length + 1}`,
      points: Math.floor(maxPoints * 0.5),
      description: ""
    })
    updateThresholds({ ...localThresholds, categories: newCategories })
  }

  const removeCategory = (index: number) => {
    const newCategories = [...(localThresholds.categories || [])]
    newCategories.splice(index, 1)
    updateThresholds({ ...localThresholds, categories: newCategories })
  }

  const updateCategory = (index: number, field: string, value: any) => {
    const newCategories = [...(localThresholds.categories || [])]
    newCategories[index] = { ...newCategories[index], [field]: value }
    updateThresholds({ ...localThresholds, categories: newCategories })
  }

  const getTemplateExamples = () => {
    switch (type) {
      case 'linear':
        return [
          {
            name: "Age-based Linear",
            description: "Linear scoring based on age (18-65)",
            thresholds: { min: 18, max: 65, rate: maxPoints / 47 }
          },
          {
            name: "Income Linear",
            description: "Linear scoring based on annual income",
            thresholds: { min: 0, max: 200000, rate: maxPoints / 200000 }
          }
        ]
      case 'threshold':
        return [
          {
            name: "Credit Score Ranges",
            description: "Standard credit score ranges",
            thresholds: {
              ranges: [
                { name: "Excellent", min: 750, max: 850, points: maxPoints, description: "Excellent credit" },
                { name: "Good", min: 700, max: 749, points: Math.floor(maxPoints * 0.8), description: "Good credit" },
                { name: "Fair", min: 650, max: 699, points: Math.floor(maxPoints * 0.6), description: "Fair credit" },
                { name: "Poor", min: 300, max: 649, points: Math.floor(maxPoints * 0.3), description: "Poor credit" }
              ]
            }
          }
        ]
      case 'categorical':
        return [
          {
            name: "Employment Status",
            description: "Employment status categories",
            thresholds: {
              categories: [
                { name: "Full-time", points: maxPoints, description: "Stable full-time employment" },
                { name: "Part-time", points: Math.floor(maxPoints * 0.7), description: "Part-time employment" },
                { name: "Self-employed", points: Math.floor(maxPoints * 0.8), description: "Self-employed" },
                { name: "Unemployed", points: Math.floor(maxPoints * 0.2), description: "Currently unemployed" }
              ]
            }
          }
        ]
      case 'optimal':
        return [
          {
            name: "Optimal Age",
            description: "Optimal age around 35-45",
            thresholds: { optimal: 40, tolerance: 15, maxPoints: maxPoints }
          },
          {
            name: "Optimal Debt Ratio",
            description: "Optimal debt-to-income ratio around 30%",
            thresholds: { optimal: 30, tolerance: 20, maxPoints: maxPoints }
          }
        ]
      default:
        return []
    }
  }

  const applyTemplate = (template: any) => {
    updateThresholds(template.thresholds)
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder">Visual Builder</TabsTrigger>
          <TabsTrigger value="json">JSON Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          {type === 'linear' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Linear Configuration
                </CardTitle>
                <CardDescription>
                  Configure linear scoring where points are calculated based on where the value falls within a range
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-value">Minimum Value</Label>
                    <Input
                      id="min-value"
                      type="number"
                      value={localThresholds.min || 0}
                      onChange={(e) => updateThresholds({ ...localThresholds, min: parseFloat(e.target.value) || 0 })}
                      placeholder="Minimum value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-value">Maximum Value</Label>
                    <Input
                      id="max-value"
                      type="number"
                      value={localThresholds.max || 100}
                      onChange={(e) => updateThresholds({ ...localThresholds, max: parseFloat(e.target.value) || 100 })}
                      placeholder="Maximum value"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rate">Points per Unit</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={localThresholds.rate || 1}
                    onChange={(e) => updateThresholds({ ...localThresholds, rate: parseFloat(e.target.value) || 1 })}
                    placeholder="Points per unit increase"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Formula: points = (value - min) × rate
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {type === 'threshold' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Threshold Ranges
                </CardTitle>
                <CardDescription>
                  Define ranges of values that correspond to specific point values
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {(localThresholds.ranges || []).map((range: ThresholdRange, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <Label>Range Name</Label>
                            <Input
                              value={range.name}
                              onChange={(e) => updateThresholdRange(index, 'name', e.target.value)}
                              placeholder="e.g., Excellent"
                            />
                          </div>
                          <div>
                            <Label>Points</Label>
                            <Input
                              type="number"
                              value={range.points}
                              onChange={(e) => updateThresholdRange(index, 'points', parseInt(e.target.value) || 0)}
                              placeholder="Points"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeThresholdRange(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Min Value</Label>
                          <Input
                            type="number"
                            value={range.min || ''}
                            onChange={(e) => updateThresholdRange(index, 'min', parseFloat(e.target.value) || undefined)}
                            placeholder="Minimum (optional)"
                          />
                        </div>
                        <div>
                          <Label>Max Value</Label>
                          <Input
                            type="number"
                            value={range.max || ''}
                            onChange={(e) => updateThresholdRange(index, 'max', parseFloat(e.target.value) || undefined)}
                            placeholder="Maximum (optional)"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label>Description</Label>
                        <Input
                          value={range.description || ''}
                          onChange={(e) => updateThresholdRange(index, 'description', e.target.value)}
                          placeholder="Describe this range"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
                <Button onClick={addThresholdRange} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Range
                </Button>
              </CardContent>
            </Card>
          )}

          {type === 'categorical' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Categories
                </CardTitle>
                <CardDescription>
                  Define categories with specific point values
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {(localThresholds.categories || []).map((category: CategoryOption, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <Label>Category Name</Label>
                            <Input
                              value={category.name}
                              onChange={(e) => updateCategory(index, 'name', e.target.value)}
                              placeholder="e.g., Full-time"
                            />
                          </div>
                          <div>
                            <Label>Points</Label>
                            <Input
                              type="number"
                              value={category.points}
                              onChange={(e) => updateCategory(index, 'points', parseInt(e.target.value) || 0)}
                              placeholder="Points"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={category.description || ''}
                          onChange={(e) => updateCategory(index, 'description', e.target.value)}
                          placeholder="Describe this category"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
                <Button onClick={addCategory} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </CardContent>
            </Card>
          )}

          {type === 'optimal' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Optimal Value
                </CardTitle>
                <CardDescription>
                  Define an optimal value where maximum points are awarded, with points decreasing as values move away
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="optimal-value">Optimal Value</Label>
                    <Input
                      id="optimal-value"
                      type="number"
                      value={localThresholds.optimal || 50}
                      onChange={(e) => updateThresholds({ ...localThresholds, optimal: parseFloat(e.target.value) || 50 })}
                      placeholder="Optimal value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tolerance">Tolerance Range</Label>
                    <Input
                      id="tolerance"
                      type="number"
                      value={localThresholds.tolerance || 20}
                      onChange={(e) => updateThresholds({ ...localThresholds, tolerance: parseFloat(e.target.value) || 20 })}
                      placeholder="Tolerance range"
                    />
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>How it works:</strong> Maximum points are awarded when the value equals the optimal value. 
                    Points decrease linearly as the value moves away from optimal, reaching 0 at optimal ± tolerance.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Templates Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Templates & Examples
              </CardTitle>
              <CardDescription>
                Quick-start templates for common {factorName} scoring scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {getTemplateExamples().map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON Configuration</CardTitle>
              <CardDescription>
                Advanced users can edit the threshold configuration directly in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={JSON.stringify(localThresholds, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    updateThresholds(parsed)
                  } catch (err) {
                    // Allow invalid JSON while typing
                    setLocalThresholds(e.target.value)
                  }
                }}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Changes will be applied automatically when valid JSON is entered
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}