"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Brain, TrendingUp, AlertCircle, Clock, Target } from 'lucide-react'

export default function TrainingPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Training</h1>
          <p className="text-muted-foreground">
            Train and improve credit scoring models using historical data
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Model Overview</TabsTrigger>
          <TabsTrigger value="training">Training Configuration</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="history">Training History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Current Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Model Version</p>
                    <p className="font-semibold">v1.0.0</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Algorithm</p>
                    <p className="font-semibold">Random Forest</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Features</p>
                    <p className="font-semibold">12</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Training Date</p>
                    <p className="font-semibold">2024-01-15</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <div className="flex items-center gap-2">
                      <Progress value={87} className="flex-1" />
                      <span className="text-sm font-medium">87%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precision</p>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="flex-1" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recall</p>
                    <div className="flex items-center gap-2">
                      <Progress value={89} className="flex-1" />
                      <span className="text-sm font-medium">89%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Training Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Ready</Badge>
                    <span className="text-sm">Model is ready for predictions</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Training</p>
                    <p className="font-semibold">2 days ago</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Training Duration</p>
                    <p className="font-semibold">45 minutes</p>
                  </div>
                  <Button className="w-full" size="sm">
                    Retrain Model
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feature Importance</CardTitle>
              <CardDescription>
                Most influential factors in credit scoring decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Credit History Length', importance: 0.23 },
                  { name: 'Debt-to-Income Ratio', importance: 0.19 },
                  { name: 'Annual Income', importance: 0.17 },
                  { name: 'Credit Utilization', importance: 0.15 },
                  { name: 'Late Payments', importance: 0.12 },
                  { name: 'Employment Status', importance: 0.08 },
                  { name: 'Age', importance: 0.06 }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{feature.name}</span>
                    <div className="flex items-center gap-2 flex-1 max-w-48 ml-4">
                      <Progress value={feature.importance * 100} className="flex-1" />
                      <span className="text-xs font-medium w-10 text-right">
                        {(feature.importance * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Configuration</CardTitle>
              <CardDescription>
                Configure model training parameters and data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Data Source</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Training Dataset</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Historical Applications (2020-2024)</option>
                      <option>Recent Applications (2023-2024)</option>
                      <option>Custom Dataset</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Split</label>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 border rounded">
                        <div className="font-semibold">70%</div>
                        <div className="text-xs">Training</div>
                      </div>
                      <div className="p-2 border rounded">
                        <div className="font-semibold">15%</div>
                        <div className="text-xs">Validation</div>
                      </div>
                      <div className="p-2 border rounded">
                        <div className="font-semibold">15%</div>
                        <div className="text-xs">Test</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Model Parameters</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Algorithm</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Random Forest</option>
                      <option>Gradient Boosting</option>
                      <option>Logistic Regression</option>
                      <option>Neural Network</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cross-Validation Folds</label>
                    <input type="number" defaultValue="5" className="w-full p-2 border rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Training Time</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>4 hours</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button>Start Training</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Confusion Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                  <p>Confusion matrix will be displayed after training</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROC Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2" />
                  <p>ROC curve will be displayed after training</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training History</CardTitle>
              <CardDescription>
                View previous model training sessions and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2" />
                  <p>No training history available</p>
                  <p className="text-sm">Train a model to see history here</p>
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