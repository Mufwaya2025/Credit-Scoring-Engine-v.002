"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Upload, FileText, Download, AlertCircle } from 'lucide-react'

export default function BatchPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batch Processing</h1>
          <p className="text-muted-foreground">
            Process multiple credit applications simultaneously
          </p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
          <TabsTrigger value="results">Processing Results</TabsTrigger>
          <TabsTrigger value="history">Batch History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Batch File
                </CardTitle>
                <CardDescription>
                  Upload a CSV or JSON file containing applicant data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json,.xlsx"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: CSV, JSON, Excel (max 10MB)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Expected Data Format</Label>
                  <div className="p-3 bg-muted rounded text-sm">
                    <p className="font-medium mb-1">Required Fields:</p>
                    <p>age, annualIncome, employmentStatus, educationLevel, debtToIncomeRatio, creditHistoryLength, creditUtilization</p>
                  </div>
                </div>

                <Button className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Process
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sample Data Format
                </CardTitle>
                <CardDescription>
                  Example of the expected data structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="font-medium">CSV Format:</div>
                  <div className="p-2 bg-muted rounded text-xs font-mono">
                    age,annualIncome,employmentStatus,educationLevel,debtToIncomeRatio,creditHistoryLength,creditUtilization<br/>
                    35,75000,Employed,Bachelor,0.35,8,0.25<br/>
                    28,65000,Self-Employed,Master,0.28,5,0.15
                  </div>
                  
                  <div className="font-medium">JSON Format:</div>
                  <div className="p-2 bg-muted rounded text-xs font-mono">
                    [{`{`}<br/>
                    &nbsp;&nbsp;"age": 35,<br/>
                    &nbsp;&nbsp;"annualIncome": 75000,<br/>
                    &nbsp;&nbsp;"employmentStatus": "Employed",<br/>
                    &nbsp;&nbsp;"educationLevel": "Bachelor",<br/>
                    &nbsp;&nbsp;"debtToIncomeRatio": 0.35,<br/>
                    &nbsp;&nbsp;"creditHistoryLength": 8,<br/>
                    &nbsp;&nbsp;"creditUtilization": 0.25<br/>
                    {`}`}]
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Results</CardTitle>
              <CardDescription>
                Monitor batch processing progress and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Total Applications</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Processed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">0%</div>
                      <p className="text-xs text-muted-foreground">Complete</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Progress</span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} />
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                  <p>No batch processing currently running</p>
                  <p className="text-sm">Upload a file to start batch processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Processing History</CardTitle>
              <CardDescription>
                View previous batch processing jobs and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>No batch processing history available</p>
                  <p className="text-sm">Complete a batch process to see history here</p>
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