"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle, Code, BookOpen, Zap, Shield, Database } from "lucide-react"
import { useState } from "react"

export default function APIDocumentationPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const copyToClipboard = async (text: string, endpoint: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedEndpoint(endpoint)
      setTimeout(() => setCopiedEndpoint(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const endpoints = [
    {
      method: "POST",
      path: "/predict",
      title: "Single Prediction",
      description: "Generate a credit score for a single applicant",
      request: `{
  "age": 35,
  "annual_income": 75000,
  "loan_amount": 25000,
  "credit_history_length": 10,
  "debt_to_income_ratio": 0.3,
  "employment_status": "Employed",
  "education_level": "Bachelor",
  "monthly_expenses": 2500,
  "existing_loan_amount": 15000,
  "credit_utilization": 0.25,
  "late_payments_12m": 0,
  "recent_inquiries": 1
}`,
      response: `{
  "credit_score": 742,
  "approval_probability": 0.85,
  "approval_status": "Approved",
  "risk_level": "Low Risk",
  "processing_time_ms": 45,
  "model_version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z"
}`
    },
    {
      method: "POST",
      path: "/batch",
      title: "Batch Processing",
      description: "Process multiple credit applications in a single request",
      request: `{
  "applications": [
    {
      "id": "app_001",
      "age": 35,
      "annual_income": 75000,
      "loan_amount": 25000,
      "credit_history_length": 10,
      "debt_to_income_ratio": 0.3,
      "employment_status": "Employed",
      "education_level": "Bachelor",
      "monthly_expenses": 2500,
      "existing_loan_amount": 15000,
      "credit_utilization": 0.25,
      "late_payments_12m": 0,
      "recent_inquiries": 1
    },
    {
      "id": "app_002",
      "age": 28,
      "annual_income": 45000,
      "loan_amount": 15000,
      "credit_history_length": 5,
      "debt_to_income_ratio": 0.4,
      "employment_status": "Employed",
      "education_level": "High School",
      "monthly_expenses": 1800,
      "existing_loan_amount": 5000,
      "credit_utilization": 0.6,
      "late_payments_12m": 2,
      "recent_inquiries": 3
    }
  ]
}`,
      response: `{
  "batch_id": "batch_20240115_001",
  "total_applications": 2,
  "processed": 2,
  "results": [
    {
      "id": "app_001",
      "credit_score": 742,
      "approval_status": "Approved"
    },
    {
      "id": "app_002",
      "credit_score": 628,
      "approval_status": "Rejected"
    }
  ]
}`
    },
    {
      method: "GET",
      path: "/health",
      title: "Health Check",
      description: "Check the health status of the API service",
      request: "",
      response: `{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "database": "connected",
  "model": "loaded"
}`
    }
  ]

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-800"
      case "POST": return "bg-blue-100 text-blue-800"
      case "PUT": return "bg-yellow-100 text-yellow-800"
      case "DELETE": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-muted-foreground">
            Complete documentation for the Credit Engine Pro REST API
          </p>
        </div>

        {/* API Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              API Overview
            </CardTitle>
            <CardDescription>
              The Credit Score Engine provides a comprehensive REST API for credit scoring and risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Base URL</h4>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                https://api.credit-engine.yourdomain.com/v1
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Authentication</h4>
              <div className="bg-muted p-3 rounded-md">
                <code className="text-sm">
                  curl -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json"
                </code>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <Zap className="h-8 w-8 text-blue-500 mb-2" />
                  <h4 className="font-medium">Fast & Reliable</h4>
                  <p className="text-sm text-muted-foreground">
                    Sub-50ms response times with 99.9% uptime
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <Shield className="h-8 w-8 text-green-500 mb-2" />
                  <h4 className="font-medium">Secure</h4>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security and compliance
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <Database className="h-8 w-8 text-purple-500 mb-2" />
                  <h4 className="font-medium">Scalable</h4>
                  <p className="text-sm text-muted-foreground">
                    Built for high-volume processing
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API Endpoints
            </CardTitle>
            <CardDescription>
              Detailed documentation for all available API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="predict" className="space-y-4">
              <TabsList>
                {endpoints.map(endpoint => (
                  <TabsTrigger key={endpoint.path} value={endpoint.path}>
                    {endpoint.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {endpoints.map(endpoint => (
                <TabsContent key={endpoint.path} value={endpoint.path} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getMethodColor(endpoint.method)}>
                      {endpoint.method}
                    </Badge>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {endpoint.path}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `curl -X ${endpoint.method} https://api.credit-engine.yourdomain.com/v1${endpoint.path}`,
                        endpoint.path
                      )}
                    >
                      {copiedEndpoint === endpoint.path ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>

                  {endpoint.request && (
                    <div>
                      <h4 className="font-medium mb-2">Request</h4>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm">
                          <code>{endpoint.request}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Response</h4>
                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm">
                        <code>{endpoint.response}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Error Handling */}
        <Card>
          <CardHeader>
            <CardTitle>Error Handling</CardTitle>
            <CardDescription>
              Understanding API error responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Error Response Format</h4>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm">
                    <code>{`{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}`}</code>
                  </pre>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Common Error Codes</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">400 Bad Request</span>
                      <Badge variant="destructive">Invalid input</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">401 Unauthorized</span>
                      <Badge variant="destructive">Invalid API key</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">429 Too Many Requests</span>
                      <Badge variant="secondary">Rate limit exceeded</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">500 Internal Server Error</span>
                      <Badge variant="destructive">Server error</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Rate Limits</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Free Tier</span>
                      <span>100 requests/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pro Tier</span>
                      <span>10,000 requests/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enterprise</span>
                      <span>Unlimited</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>
              Sample code for integrating with the API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript" className="space-y-4">
              <TabsList>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>

              <TabsContent value="javascript">
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm">
                    <code>{`const response = await fetch('https://api.credit-engine.yourdomain.com/v1/predict', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    age: 35,
    annual_income: 75000,
    loan_amount: 25000,
    credit_history_length: 10,
    debt_to_income_ratio: 0.3,
    employment_status: 'Employed',
    education_level: 'Bachelor',
    monthly_expenses: 2500,
    existing_loan_amount: 15000,
    credit_utilization: 0.25,
    late_payments_12m: 0,
    recent_inquiries: 1
  })
});

const result = await response.json();
console.log('Credit Score:', result.credit_score);
console.log('Approval Status:', result.approval_status);`}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="python">
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm">
                    <code>{`import requests
import json

url = 'https://api.credit-engine.yourdomain.com/v1/predict'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

data = {
    'age': 35,
    'annual_income': 75000,
    'loan_amount': 25000,
    'credit_history_length': 10,
    'debt_to_income_ratio': 0.3,
    'employment_status': 'Employed',
    'education_level': 'Bachelor',
    'monthly_expenses': 2500,
    'existing_loan_amount': 15000,
    'credit_utilization': 0.25,
    'late_payments_12m': 0,
    'recent_inquiries': 1
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

print(f'Credit Score: {result["credit_score"]}')
print(f'Approval Status: {result["approval_status"]}')`}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="curl">
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm">
                    <code>{`curl -X POST https://api.credit-engine.yourdomain.com/v1/predict \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "age": 35,
    "annual_income": 75000,
    "loan_amount": 25000,
    "credit_history_length": 10,
    "debt_to_income_ratio": 0.3,
    "employment_status": "Employed",
    "education_level": "Bachelor",
    "monthly_expenses": 2500,
    "existing_loan_amount": 15000,
    "credit_utilization": 0.25,
    "late_payments_12m": 0,
    "recent_inquiries": 1
  }'`}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}