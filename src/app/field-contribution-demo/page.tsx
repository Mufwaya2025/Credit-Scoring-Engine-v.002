"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calculator, 
  TrendingUp, 
  Info, 
  BarChart3, 
  PieChart, 
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Scale
} from "lucide-react"
import { 
  ApplicantData, 
  CalculationEngine, 
  fieldDefinitions, 
  defaultCalculationEngine 
} from "@/lib/calculation-engine"

export default function FieldContributionDemo() {
  const [applicantData, setApplicantData] = useState<ApplicantData>({
    age: 35,
    annualIncome: 75000,
    loanAmount: 25000,
    creditHistoryLength: 8,
    monthlyDebtPayments: 1200,
    totalCreditLimit: 50000,
    creditCardBalances: 15000,
    monthlyExpenses: 3500,
    existingLoanAmount: 10000,
    latePayments12m: 1,
    recentInquiries: 2,
    employmentStatus: "Employed",
    educationLevel: "Bachelor"
  })
  
  const [calculationEngine] = useState<CalculationEngine>(defaultCalculationEngine)
  const [overallScore, setOverallScore] = useState<any>(null)
  const [calculatedData, setCalculatedData] = useState<ApplicantData>({})

  useEffect(() => {
    // Calculate derived fields
    const calculated = calculationEngine.calculateAllFields(applicantData)
    setCalculatedData(calculated)
    
    // Calculate overall score
    const score = calculationEngine.calculateOverallScore(applicantData)
    setOverallScore(score)
  }, [applicantData, calculationEngine])

  const handleFieldChange = (field: string, value: string) => {
    const fieldDef = fieldDefinitions.find(f => f.value === field)
    let processedValue: any = value
    
    if (fieldDef?.type === "number") {
      const numValue = parseFloat(value) || 0
      processedValue = isNaN(numValue) ? 0 : numValue
    } else if (fieldDef?.type === "string") {
      processedValue = value
    }
    
    const newData = { ...applicantData, [field]: processedValue }
    setApplicantData(newData)
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-orange-500"
    return "bg-red-500"
  }

  const getContributionColor = (contribution: number) => {
    if (contribution >= 15) return "bg-green-500"
    if (contribution >= 10) return "bg-blue-500"
    if (contribution >= 5) return "bg-yellow-500"
    return "bg-gray-400"
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Field Contribution Analysis</h1>
          <p className="text-muted-foreground">
            Understand how each field contributes to the overall credit score calculation
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calculation">Calculation Method</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="interactive">Interactive Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* What is Field Contribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  What is Field Contribution?
                </CardTitle>
                <CardDescription>
                  Understanding how individual fields impact the overall credit score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Definition</h3>
                    <p className="text-sm text-muted-foreground">
                      Field Contribution measures how much each individual field (like age, income, credit score) 
                      contributes to the overall credit score. It's calculated based on:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• <strong>Weight:</strong> Importance level (1-10)</li>
                      <li>• <strong>Value:</strong> Actual field value</li>
                      <li>• <strong>Normalization:</strong> How good the value is (0-1 scale)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Formula</h3>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-mono text-blue-800">
                        Field Contribution = Normalized Score × Weight
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      The normalized score (0-1) represents how good the field value is, 
                      and the weight represents its importance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Score Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Current Overall Score
                </CardTitle>
                <CardDescription>
                  Based on the current applicant data and field configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overallScore ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-4xl font-bold">
                          <span className={getScoreColor(overallScore.percentage)}>
                            {overallScore.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Score: {overallScore.totalScore.toFixed(1)} / {overallScore.maxScore.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={overallScore.percentage >= 80 ? "default" : "destructive"}>
                          {overallScore.percentage >= 80 ? "Excellent" : overallScore.percentage >= 60 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress 
                      value={overallScore.percentage} 
                      className="h-4"
                    />
                    
                    <div className="text-sm text-muted-foreground">
                      This score is calculated by summing up all individual field contributions.
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Unable to calculate score - please check field configurations
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Field Contributors
                </CardTitle>
                <CardDescription>
                  Fields that contribute the most to the overall score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overallScore ? (
                  <div className="space-y-4">
                    {overallScore.details
                      .sort((a, b) => b.weightedScore - a.weightedScore)
                      .slice(0, 5)
                      .map((detail, index) => {
                        const contribution = (detail.weightedScore / overallScore.totalScore) * 100
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold">{index + 1}</span>
                              </div>
                              <div>
                                <div className="font-medium">{detail.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  Weight: {detail.weight} | Normalized: {(detail.normalizedScore * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{detail.weightedScore.toFixed(2)}</div>
                              <div className="text-sm text-muted-foreground">
                                {contribution.toFixed(1)}% of total
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No contribution data available
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculation" className="space-y-6">
            {/* Calculation Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Field Contribution Calculation Method
                </CardTitle>
                <CardDescription>
                  Step-by-step breakdown of how field contributions are calculated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Step 1: Normalization</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Convert field values to 0-1 scale based on quality
                    </p>
                    <div className="bg-blue-50 p-2 rounded text-xs font-mono">
                      normalized = normalize(value, fieldDef)
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Step 2: Weight Application</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Multiply normalized score by field weight
                    </p>
                    <div className="bg-green-50 p-2 rounded text-xs font-mono">
                      contribution = normalized × weight
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Step 3: Aggregation</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sum all contributions for final score
                    </p>
                    <div className="bg-purple-50 p-2 rounded text-xs font-mono">
                      total = Σ(contributions)
                    </div>
                  </div>
                </div>

                {/* Normalization Examples */}
                <div>
                  <h3 className="font-semibold mb-3">Normalization Examples</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Age Field</span>
                        <Badge variant="outline">Weight: 8</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Optimal range: 25-55 years. Values outside this range get lower scores.
                      </div>
                      <div className="mt-2 space-y-1 text-xs">
                        <div>• Age 35: Normalized = 1.0 (Perfect)</div>
                        <div>• Age 22: Normalized = 0.7 (Good)</div>
                        <div>• Age 65: Normalized = 0.3 (Poor)</div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Annual Income</span>
                        <Badge variant="outline">Weight: 10</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Higher income is better, normalized to 0-200k range.
                      </div>
                      <div className="mt-2 space-y-1 text-xs">
                        <div>• $75,000: Normalized = 0.375</div>
                        <div>• $150,000: Normalized = 0.75</div>
                        <div>• $200,000+: Normalized = 1.0</div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Debt-to-Income Ratio</span>
                        <Badge variant="outline">Weight: 10</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Lower ratio is better (inverse normalization).
                      </div>
                      <div className="mt-2 space-y-1 text-xs">
                        <div>• 0.2 (20%): Normalized = 0.8</div>
                        <div>• 0.5 (50%): Normalized = 0.5</div>
                        <div>• 0.8 (80%): Normalized = 0.2</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Calculation Example */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Calculation Example</CardTitle>
                <CardDescription>
                  Step-by-step calculation for a specific field
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overallScore && overallScore.details.length > 0 ? (
                  <div className="space-y-4">
                    {overallScore.details.slice(0, 1).map((detail, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">{detail.label} Calculation</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Field Value:</span>
                              <span className="font-medium">{detail.value}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Field Weight:</span>
                              <span className="font-medium">{detail.weight}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Normalized Score:</span>
                              <span className="font-medium">{(detail.normalizedScore * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Final Contribution:</span>
                              <span className="font-bold">{detail.weightedScore.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              <strong>Calculation:</strong>
                            </div>
                            <div className="bg-blue-50 p-2 rounded text-xs font-mono">
                              {detail.weightedScore.toFixed(2)} = {detail.normalizedScore.toFixed(2)} × {detail.weight}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              This represents {(detail.weightedScore / overallScore.totalScore * 100).toFixed(1)}% 
                              of the total score.
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No calculation data available
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6">
            {/* Contribution Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Field Contribution Visualization
                </CardTitle>
                <CardDescription>
                  Visual representation of how each field contributes to the total score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overallScore ? (
                  <div className="space-y-6">
                    {/* Horizontal Bar Chart */}
                    <div>
                      <h3 className="font-semibold mb-4">Contribution Breakdown</h3>
                      <div className="space-y-3">
                        {overallScore.details
                          .sort((a, b) => b.weightedScore - a.weightedScore)
                          .map((detail, index) => {
                            const contribution = (detail.weightedScore / overallScore.totalScore) * 100
                            return (
                              <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{detail.label}</span>
                                  <span className="text-muted-foreground">
                                    {detail.weightedScore.toFixed(2)} ({contribution.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${getContributionColor(contribution)}`}
                                    style={{ width: `${Math.min(contribution * 2, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {overallScore.details.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Fields</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {overallScore.details.filter(d => d.normalizedScore > 0.7).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Strong Fields</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {overallScore.details.filter(d => d.normalizedScore < 0.3).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Weak Fields</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No visualization data available
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Weight vs Contribution Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Weight vs Contribution Analysis
                </CardTitle>
                <CardDescription>
                  Compare field weights with their actual contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overallScore ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      This analysis shows whether high-weight fields are actually contributing proportionally 
                      to their importance, or if some fields are over/under-performing.
                    </div>
                    
                    <div className="space-y-3">
                      {overallScore.details
                        .sort((a, b) => b.weight - a.weight)
                        .map((detail, index) => {
                          const expectedContribution = (detail.weight / overallScore.maxScore) * 100
                          const actualContribution = (detail.weightedScore / overallScore.totalScore) * 100
                          const performance = actualContribution / expectedContribution
                          
                          return (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{detail.label}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">w{detail.weight}</Badge>
                                  {performance > 1.2 ? (
                                    <Badge variant="default" className="bg-green-500">Overperforming</Badge>
                                  ) : performance < 0.8 ? (
                                    <Badge variant="destructive">Underperforming</Badge>
                                  ) : (
                                    <Badge variant="secondary">On Track</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Expected:</span>
                                  <span className="ml-2 font-medium">{expectedContribution.toFixed(1)}%</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Actual:</span>
                                  <span className="ml-2 font-medium">{actualContribution.toFixed(1)}%</span>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                Performance: {performance > 1 ? '+' : ''}{((performance - 1) * 100).toFixed(0)}%
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No analysis data available
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactive" className="space-y-6">
            {/* Interactive Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Interactive Field Contribution Demo
                </CardTitle>
                <CardDescription>
                  Modify field values to see how they affect the overall score and contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Field Controls */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Adjust Field Values</h3>
                    <div className="space-y-3">
                      {fieldDefinitions
                        .filter(f => f.category === "base" && f.type === "number")
                        .slice(0, 4)
                        .map(field => (
                          <div key={field.value} className="space-y-2">
                            <Label htmlFor={field.value} className="text-sm font-medium">
                              {field.label} {field.unit && `(${field.unit})`}
                            </Label>
                            <Input
                              id={field.value}
                              type="number"
                              value={applicantData[field.value] || ""}
                              onChange={(e) => handleFieldChange(field.value, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Live Results */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Live Score Update</h3>
                    {overallScore && (
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold mb-2">
                            <span className={getScoreColor(overallScore.percentage)}>
                              {overallScore.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={overallScore.percentage} className="h-3" />
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Top Contributors:</h4>
                          {overallScore.details
                            .sort((a, b) => b.weightedScore - a.weightedScore)
                            .slice(0, 3)
                            .map((detail, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>{detail.label}</span>
                                <span className="font-medium">{detail.weightedScore.toFixed(2)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  Important observations about field contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 High Weight ≠ High Contribution</h4>
                    <p className="text-sm text-blue-700">
                      A field with high weight but poor value (e.g., high debt-to-income ratio) 
                      may contribute less than a lower-weight field with excellent value.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">🎯 Balanced Profile is Key</h4>
                    <p className="text-sm text-green-700">
                      The best scores come from having multiple strong fields, not just 
                      excelling in one area. Aim for balanced performance across all fields.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">⚡ Quick Wins Matter</h4>
                    <p className="text-sm text-orange-700">
                      Some fields (like reducing credit utilization) can show quick improvements 
                      in contribution with small changes to the underlying values.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">📊 Context is Everything</h4>
                    <p className="text-sm text-purple-700">
                      Field contributions should always be interpreted in the context of 
                      the applicant's complete profile and the specific scoring requirements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}