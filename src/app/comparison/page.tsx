"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { 
  GitCompare, 
  BarChart3, 
  Target, 
  Zap, 
  Play, 
  Pause,
  Trophy,
  TrendingUp
} from "lucide-react"

interface ModelMetrics {
  name: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  auc: number
  inferenceTime: number
}

interface ABTest {
  modelA: string
  modelB: string
  trafficSplitA: number
  trafficSplitB: number
  duration: string
  status: string
  progress: number
  winner?: string
}

export default function ComparisonPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "Neural Network v1.0",
    "Random Forest"
  ])
  
  const [abTest, setAbTest] = useState<ABTest>({
    modelA: "Neural Network v1.0",
    modelB: "Random Forest",
    trafficSplitA: 50,
    trafficSplitB: 50,
    duration: "1 week",
    status: "running",
    progress: 25
  })

  const availableModels = [
    "Neural Network v1.0",
    "Random Forest",
    "XGBoost",
    "Ensemble",
    "Logistic Regression",
    "SVM"
  ]

  // Generate sample model comparison data
  const modelData: ModelMetrics[] = [
    {
      name: "Neural Network v1.0",
      accuracy: 0.89,
      precision: 0.87,
      recall: 0.91,
      f1Score: 0.89,
      auc: 0.93,
      inferenceTime: 45
    },
    {
      name: "Random Forest",
      accuracy: 0.86,
      precision: 0.84,
      recall: 0.88,
      f1Score: 0.86,
      auc: 0.90,
      inferenceTime: 23
    },
    {
      name: "XGBoost",
      accuracy: 0.88,
      precision: 0.86,
      recall: 0.90,
      f1Score: 0.88,
      auc: 0.92,
      inferenceTime: 31
    },
    {
      name: "Ensemble",
      accuracy: 0.91,
      precision: 0.89,
      recall: 0.93,
      f1Score: 0.91,
      auc: 0.95,
      inferenceTime: 67
    }
  ]

  const filteredModelData = modelData.filter(model => selectedModels.includes(model.name))

  const handleModelSelection = (modelName: string, isSelected: boolean) => {
    if (isSelected && !selectedModels.includes(modelName)) {
      setSelectedModels([...selectedModels, modelName])
    } else if (!isSelected && selectedModels.includes(modelName)) {
      setSelectedModels(selectedModels.filter(name => name !== modelName))
    }
  }

  const startABTest = () => {
    setAbTest(prev => ({
      ...prev,
      status: "running",
      progress: 0
    }))
    
    // Simulate test progress
    const interval = setInterval(() => {
      setAbTest(prev => {
        const newProgress = Math.min(prev.progress + Math.random() * 15, 100)
        if (newProgress >= 100) {
          clearInterval(interval)
          return {
            ...prev,
            progress: 100,
            status: "completed",
            winner: prev.modelA // Randomly choose winner for demo
          }
        }
        return { ...prev, progress: newProgress }
      })
    }, 1000)
  }

  const getBestModel = (metric: keyof ModelMetrics) => {
    return filteredModelData.reduce((best, current) => 
      current[metric] > best[metric] ? current : best
    )
  }

  const formatMetric = (value: number) => {
    if (value < 1) return (value * 100).toFixed(1) + '%'
    return value.toFixed(1)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Comparison & A/B Testing</h1>
          <p className="text-muted-foreground">
            Compare different models and run A/B tests to find the best performing one
          </p>
        </div>

        <Tabs defaultValue="comparison" className="space-y-6">
          <TabsList>
            <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
            <TabsTrigger value="abtest">A/B Testing</TabsTrigger>
            <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-6">
            {/* Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5" />
                  Select Models to Compare
                </CardTitle>
                <CardDescription>
                  Choose at least 2 models to compare their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableModels.map(model => (
                    <div
                      key={model}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedModels.includes(model)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleModelSelection(model, !selectedModels.includes(model))}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{model}</span>
                        {selectedModels.includes(model) && (
                          <Badge variant="default" className="text-xs">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Comparison Table */}
            {selectedModels.length >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Detailed comparison of model performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Model</th>
                          <th className="text-left p-2">Accuracy</th>
                          <th className="text-left p-2">Precision</th>
                          <th className="text-left p-2">Recall</th>
                          <th className="text-left p-2">F1-Score</th>
                          <th className="text-left p-2">AUC</th>
                          <th className="text-left p-2">Inference Time (ms)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredModelData.map((model, index) => (
                          <tr key={model.name} className="border-b">
                            <td className="p-2 font-medium">{model.name}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span>{formatMetric(model.accuracy)}</span>
                                {model.name === getBestModel('accuracy').name && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span>{formatMetric(model.precision)}</span>
                                {model.name === getBestModel('precision').name && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span>{formatMetric(model.recall)}</span>
                                {model.name === getBestModel('recall').name && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span>{formatMetric(model.f1Score)}</span>
                                {model.name === getBestModel('f1Score').name && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span>{formatMetric(model.auc)}</span>
                                {model.name === getBestModel('auc').name && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span>{formatMetric(model.inferenceTime)}</span>
                                {model.name === filteredModelData.reduce((best, current) => 
                                  current.inferenceTime < best.inferenceTime ? current : best
                                ).name && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Radar Chart */}
            {selectedModels.length >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Radar Chart</CardTitle>
                  <CardDescription>
                    Visual comparison of model performance across all metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 flex items-center justify-center border rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                      <p>Interactive radar chart would be displayed here</p>
                      <p className="text-sm">Showing performance comparison across all metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="abtest" className="space-y-6">
            {/* A/B Test Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  A/B Test Configuration
                </CardTitle>
                <CardDescription>
                  Set up and run A/B tests to compare model performance in production
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Model A (Control)</label>
                      <Select 
                        value={abTest.modelA}
                        onValueChange={(value) => setAbTest(prev => ({ ...prev, modelA: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableModels.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Traffic Split for Model A</label>
                      <div className="mt-2">
                        <Slider
                          value={[abTest.trafficSplitA]}
                          onValueChange={(value) => setAbTest(prev => ({ 
                            ...prev, 
                            trafficSplitA: value[0],
                            trafficSplitB: 100 - value[0]
                          }))}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>{abTest.trafficSplitA}%</span>
                          <span>Model A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Model B (Variant)</label>
                      <Select 
                        value={abTest.modelB}
                        onValueChange={(value) => setAbTest(prev => ({ ...prev, modelB: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableModels.filter(m => m !== abTest.modelA).map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Traffic Split for Model B</label>
                      <div className="mt-2">
                        <div className="text-center mb-2">
                          <span className="text-lg font-semibold">{abTest.trafficSplitB}%</span>
                        </div>
                        <Progress value={abTest.trafficSplitB} className="w-full" />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>Model B</span>
                          <span>{abTest.trafficSplitB}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Test Duration</label>
                  <Select 
                    value={abTest.duration}
                    onValueChange={(value) => setAbTest(prev => ({ ...prev, duration: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 day">1 day</SelectItem>
                      <SelectItem value="1 week">1 week</SelectItem>
                      <SelectItem value="2 weeks">2 weeks</SelectItem>
                      <SelectItem value="1 month">1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={startABTest} 
                  disabled={abTest.status === "running"}
                  className="w-full"
                >
                  {abTest.status === "running" ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Test Running
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start A/B Test
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* A/B Test Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  A/B Test Results
                </CardTitle>
                <CardDescription>
                  Live results and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{abTest.progress}%</div>
                        <p className="text-sm text-muted-foreground">Test Progress</p>
                        <Progress value={abTest.progress} className="mt-2" />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">Not yet</div>
                        <p className="text-sm text-muted-foreground">Statistical Significance</p>
                        <p className="text-xs text-muted-foreground mt-1">Need more data</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">
                          {abTest.winner || "TBD"}
                        </div>
                        <p className="text-sm text-muted-foreground">Winner</p>
                        {abTest.status === "completed" && abTest.winner && (
                          <Badge variant="default" className="mt-2">Test Complete</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {abTest.status === "running" && (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                        <Zap className="h-4 w-4 animate-pulse" />
                        <span className="font-medium">A/B test in progress...</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Comparing {abTest.modelA} vs {abTest.modelB} with {abTest.trafficSplitA}:{abTest.trafficSplitB} split
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>
                  Detailed performance analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Best Overall Model</h4>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{getBestModel('accuracy').name}</span>
                          <Badge variant="default">Best Accuracy</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Highest overall accuracy with balanced precision and recall
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Fastest Model</h4>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">
                            {filteredModelData.reduce((best, current) => 
                              current.inferenceTime < best.inferenceTime ? current : best
                            ).name}
                          </span>
                          <Badge variant="secondary">Fastest</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Lowest inference time, suitable for real-time applications
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm">For production deployment, consider the Ensemble model for highest accuracy</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm">For real-time applications, Random Forest offers the best speed-accuracy tradeoff</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm">Run A/B tests to validate performance with real production data</p>
                        </div>
                      </div>
                    </div>
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