"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditScoring } from "@/components/credit-scoring"
import { RiskManagement } from "@/components/risk-management"
import { FieldCalculator } from "@/components/field-calculator"
import { RulesEngine } from "@/components/rules-engine"
import { Toaster } from "@/components/ui/toaster"
import { useSession, signIn, signOut } from "next-auth/react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("scoring")
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">ARC Credit Engine Pro</CardTitle>
            <CardDescription>
              Advanced AI-Powered Credit Scoring & Risk Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Please sign in to access the secure credit scoring system
              </p>
              <button 
                onClick={() => signIn()}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign In
              </button>
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Demo Credentials:</strong><br />
                Email: admin@arc-credit.com<br />
                Password: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">ARC Credit Engine Pro</h1>
              <p className="text-muted-foreground mt-2">Advanced AI-Powered Credit Scoring & Risk Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Welcome, {session.user?.name || session.user?.email}</p>
                <p className="text-xs text-green-600">● System Operational</p>
              </div>
              <button 
                onClick={() => signOut()}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scoring">Credit Scoring</TabsTrigger>
            <TabsTrigger value="risk">Risk Management</TabsTrigger>
            <TabsTrigger value="calculator">Field Calculator</TabsTrigger>
            <TabsTrigger value="rules">Rules Engine</TabsTrigger>
          </TabsList>

          <TabsContent value="scoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Credit Scoring</CardTitle>
                <CardDescription>
                  Advanced machine learning algorithms for accurate credit risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreditScoring />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>
                  Comprehensive risk assessment and mitigation strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Field Calculator</CardTitle>
                <CardDescription>
                  Automated calculation of applicant fields with validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rules Engine</CardTitle>
                <CardDescription>
                  Configurable business rules for automated decision making
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RulesEngine />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 ARC Credit Engine Pro. Secure AI-Powered Credit Assessment.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-green-600">✓ Secured with Enterprise-Grade Protection</span>
            </div>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
