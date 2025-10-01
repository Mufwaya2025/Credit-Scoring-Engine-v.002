"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, TrendingDown, Users, Target, Clock, AlertCircle } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for credit scoring operations
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Predictions</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                    <p className="text-2xl font-bold">68.4%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3.2% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Credit Score</p>
                    <p className="text-2xl font-bold">712</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8 points from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Processing Time</p>
                    <p className="text-2xl font-bold">124ms</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2 flex items-center text-xs text-red-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -15ms from last month
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>
                  Distribution of credit scores across all predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { range: '750-850', count: 342, percentage: 27.4, color: 'bg-green-500' },
                    { range: '700-749', count: 289, percentage: 23.2, color: 'bg-blue-500' },
                    { range: '650-699', count: 234, percentage: 18.8, color: 'bg-yellow-500' },
                    { range: '600-649', count: 198, percentage: 15.9, color: 'bg-orange-500' },
                    { range: '300-599', count: 184, percentage: 14.7, color: 'bg-red-500' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.range}</span>
                        <span>{item.count} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval Status Breakdown</CardTitle>
                <CardDescription>
                  Distribution of approval decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { status: 'Approved', count: 853, percentage: 68.4, color: 'bg-green-500' },
                    { status: 'Approved with Conditions', count: 234, percentage: 18.8, color: 'bg-yellow-500' },
                    { status: 'Rejected', count: 160, percentage: 12.8, color: 'bg-red-500' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.status}</span>
                        <span>{item.count} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Analytics</CardTitle>
              <CardDescription>
                Detailed analysis of prediction patterns and outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-xs text-muted-foreground">Total Predictions (30 days)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">89.2%</div>
                    <p className="text-xs text-muted-foreground">Model Confidence</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">124ms</div>
                    <p className="text-xs text-muted-foreground">Avg. Processing Time</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Prediction Volume by Day</h4>
                <div className="text-center text-muted-foreground py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Chart showing daily prediction volume will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
              <CardDescription>
                Key performance metrics and model accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Accuracy Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Accuracy</span>
                      <div className="flex items-center gap-2">
                        <Progress value={87} className="w-20" />
                        <span className="text-sm font-medium">87%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Precision</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-20" />
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Recall</span>
                      <div className="flex items-center gap-2">
                        <Progress value={89} className="w-20" />
                        <span className="text-sm font-medium">89%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">F1 Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={86} className="w-20" />
                        <span className="text-sm font-medium">86%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Trends</h4>
                  <div className="text-center text-muted-foreground py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                    <p>Performance trend charts will be displayed here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>
                Long-term trends and patterns in credit scoring data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">30-Day Trend</p>
                          <p className="text-lg font-semibold text-green-600">+12.4%</p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Increase in total predictions</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Approval Trend</p>
                          <p className="text-lg font-semibold text-green-600">+3.2%</p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Improvement in approval rate</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center text-muted-foreground py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                  <p>Detailed trend charts and analysis will be displayed here</p>
                  <p className="text-sm">More data needed for comprehensive trend analysis</p>
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