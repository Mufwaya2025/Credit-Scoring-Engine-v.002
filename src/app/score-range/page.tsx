"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Target, Plus, RefreshCw, AlertTriangle, CheckCircle, Edit, Zap, Shield, TrendingUp } from 'lucide-react'
import EditScoreRangeDialog from '@/components/score-range/edit-score-range-dialog'
import { motion } from 'framer-motion'

interface ScoreRange {
  id: string
  name: string
  description?: string
  minScore: number
  maxScore?: number
  color?: string
  approvalStatus?: string
  riskLevel?: string
  interestRateAdjustment: number
  loanLimitAdjustment: number
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

interface ValidationResponse {
  isValid: boolean
  overlaps: Array<{ range1: ScoreRange; range2: ScoreRange }>
  gaps: Array<{ min: number; max: number }>
}

export default function ScoreRangePage() {
  const [ranges, setRanges] = useState<ScoreRange[]>([])
  const [validation, setValidation] = useState<ValidationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [editingRange, setEditingRange] = useState<ScoreRange | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Fetch score ranges
      const rangesResponse = await fetch('/api/score-range')
      if (rangesResponse.ok) {
        const rangesData = await rangesResponse.json()
        setRanges(rangesData.data)
      }

      // Validate ranges
      const validationResponse = await fetch('/api/score-range/validate')
      if (validationResponse.ok) {
        const validationData = await validationResponse.json()
        setValidation(validationData.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedDefaults = async () => {
    try {
      setSeeding(true)
      const response = await fetch('/api/score-range/seed', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Seeded:', data)
        await loadData()
      } else {
        console.error('Failed to seed defaults')
      }
    } catch (error) {
      console.error('Error seeding defaults:', error)
    } finally {
      setSeeding(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/score-range/${id}`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        await loadData()
      } else {
        console.error('Failed to toggle range')
      }
    } catch (error) {
      console.error('Error toggling range:', error)
    }
  }

  const handleEditRange = (range: ScoreRange) => {
    setEditingRange(range)
    setIsEditDialogOpen(true)
  }

  const handleSaveRange = async (updatedRange: Partial<ScoreRange>) => {
    if (!editingRange) return

    try {
      const response = await fetch(`/api/score-range/${editingRange.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRange),
      })

      if (response.ok) {
        await loadData()
      } else {
        console.error('Failed to update range')
      }
    } catch (error) {
      console.error('Error updating range:', error)
    }
  }

  const getApprovalBadgeColor = (status?: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'Approved with Conditions': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskBadgeColor = (level?: string) => {
    switch (level) {
      case 'Low Risk': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium Risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'High Risk': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Very High Risk': return 'bg-red-100 text-red-900 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskIcon = (level?: string) => {
    switch (level) {
      case 'Low Risk': return <Shield className="h-4 w-4" />
      case 'Medium Risk': return <AlertTriangle className="h-4 w-4" />
      case 'High Risk': return <AlertTriangle className="h-4 w-4" />
      case 'Very High Risk': return <AlertTriangle className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading score ranges...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const ScoreRangeCard = ({ range }: { range: ScoreRange }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card 
        className={`h-full cursor-pointer transition-all duration-200 hover:shadow-lg border-border/50 bg-card/50 backdrop-blur-sm ${!range.isActive ? 'opacity-60' : ''}`}
        onClick={() => handleEditRange(range)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-background"
                style={{ 
                  backgroundColor: range.color || '#6B7280',
                  borderColor: range.color || '#6B7280'
                }}
              />
              <div>
                <CardTitle className="text-lg">{range.name}</CardTitle>
                <CardDescription className="text-sm">
                  {range.minScore} - {range.maxScore || '∞'} points
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={range.isActive}
                onCheckedChange={(e) => {
                  e.stopPropagation()
                  handleToggleActive(range.id)
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getApprovalBadgeColor(range.approvalStatus)}>
              {range.approvalStatus || 'Unknown'}
            </Badge>
            <Badge variant="outline" className={getRiskBadgeColor(range.riskLevel)}>
              <div className="flex items-center gap-1">
                {getRiskIcon(range.riskLevel)}
                {range.riskLevel || 'Unknown'}
              </div>
            </Badge>
          </div>
          
          {range.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {range.description}
            </p>
          )}
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-accent/30 rounded-lg p-2">
                <div className="text-muted-foreground">Interest Rate</div>
                <div className="font-medium">
                  {range.interestRateAdjustment > 0 ? '+' : ''}{range.interestRateAdjustment}%
                </div>
              </div>
              <div className="bg-accent/30 rounded-lg p-2">
                <div className="text-muted-foreground">Loan Limit</div>
                <div className="font-medium">{range.loanLimitAdjustment}x</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Priority</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="font-medium">{range.priority}</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              handleEditRange(range)
            }}
          >
            <Edit className="mr-2 h-3 w-3" />
            Edit Range
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Score Range Configuration</h1>
            <p className="text-muted-foreground mt-1">
              Configure score ranges and their business interpretations
            </p>
          </div>
          <Button onClick={handleSeedDefaults} disabled={seeding} className="gap-2">
            {seeding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Seed Default Ranges
          </Button>
        </div>

        {/* Validation Status */}
        {validation && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configuration Status
              </CardTitle>
              <CardDescription>
                Overview of your score range configuration health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {validation.isValid ? (
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                    )}
                    <div>
                      <span className="font-medium">
                        {validation.isValid ? 'Configuration is Valid' : 'Configuration Issues Found'}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {validation.isValid ? 'All ranges are properly configured' : 'Some issues need attention'}
                      </p>
                    </div>
                  </div>
                  
                  {!validation.isValid && (
                    <div className="space-y-3">
                      {validation.overlaps.length > 0 && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800">
                            <strong>Overlapping Ranges:</strong> Some score ranges overlap with each other.
                          </AlertDescription>
                        </Alert>
                      )}
                      {validation.gaps.length > 0 && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <AlertTriangle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            <strong>Gaps Found:</strong> There are gaps between score ranges that are not covered.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">Configuration Summary</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-accent/30 rounded-lg p-3">
                      <div className="text-2xl font-bold text-primary">{ranges.length}</div>
                      <div className="text-sm text-muted-foreground">Total Ranges</div>
                    </div>
                    <div className="bg-accent/30 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">{ranges.filter(r => r.isActive).length}</div>
                      <div className="text-sm text-muted-foreground">Active Ranges</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Configuration Health</span>
                      <span className="font-medium">{validation.isValid ? '100%' : '75%'}</span>
                    </div>
                    <Progress value={validation.isValid ? 100 : 75} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {ranges.length === 0 ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-accent/30 rounded-full mb-4">
                <Target className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Score Ranges Configured</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Configure score ranges to define how different credit scores are interpreted and what business decisions should be made.
              </p>
              <Button onClick={handleSeedDefaults} disabled={seeding} className="gap-2">
                {seeding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Default Ranges
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ranges.map((range) => (
              <ScoreRangeCard key={range.id} range={range} />
            ))}
          </div>
        )}

        <EditScoreRangeDialog
          range={editingRange}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveRange}
        />
      </div>
    </MainLayout>
  )
}