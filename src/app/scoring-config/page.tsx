"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ThresholdBuilder } from "@/components/scoring/threshold-builder"
import { ThresholdDisplay } from "@/components/scoring/threshold-display"
import { configurableScoringEngine } from "@/lib/configurable-scoring"
import { 
  Plus,
  Edit,
  Trash2,
  Settings,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  Target
} from "lucide-react"

interface ScoringConfig {
  id: string
  factor: string
  name: string
  description?: string
  maxPoints: number
  weight: number
  thresholds: string
  category: string
  isActive: boolean
  configType: string
  calculationType: string
  minValue?: number
  maxValue?: number
  optimalValue?: number
  createdAt: Date
  updatedAt: Date
}

const categories = [
  { value: "demographic", label: "Demographic", color: "bg-blue-100 text-blue-800" },
  { value: "financial", label: "Financial", color: "bg-green-100 text-green-800" },
  { value: "credit", label: "Credit", color: "bg-purple-100 text-purple-800" },
  { value: "employment", label: "Employment", color: "bg-orange-100 text-orange-800" },
  { value: "general", label: "General", color: "bg-gray-100 text-gray-800" }
]

const calculationTypes = [
  { value: "linear", label: "Linear", description: "Linear calculation based on value" },
  { value: "threshold", label: "Threshold", description: "Points based on value ranges" },
  { value: "categorical", label: "Categorical", description: "Points based on categories" },
  { value: "optimal", label: "Optimal", description: "Points based on distance from optimal" }
]

export default function ScoringConfigPage() {
  const { toast } = useToast()
  const [configs, setConfigs] = useState<ScoringConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ScoringConfig | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [previewScore, setPreviewScore] = useState<any>(null)
  const [isCalculatingPreview, setIsCalculatingPreview] = useState(false)

  const [newConfig, setNewConfig] = useState({
    factor: "",
    name: "",
    description: "",
    maxPoints: 50,
    weight: 1.0,
    thresholds: "{}",
    category: "general",
    isActive: true,
    configType: "static",
    calculationType: "linear",
    minValue: undefined as number | undefined,
    maxValue: undefined as number | undefined,
    optimalValue: undefined as number | undefined
  })

  // Fetch scoring configurations
  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/scoring-config')
      if (response.ok) {
        const data = await response.json()
        setConfigs(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch scoring configurations",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch scoring configurations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  const calculatePreviewScore = async () => {
    if (configs.length === 0) return
    
    setIsCalculatingPreview(true)
    try {
      // Use sample applicant data for preview
      const sampleApplicant = {
        age: 35,
        annualIncome: 75000,
        loanAmount: 25000,
        creditHistoryLength: 10,
        debtToIncomeRatio: 0.3,
        employmentStatus: "Employed",
        educationLevel: "Bachelor",
        monthlyExpenses: 2500,
        existingLoanAmount: 15000,
        creditUtilization: 0.25,
        latePayments12m: 0,
        recentInquiries: 1
      }
      
      const result = await configurableScoringEngine.calculateScore(sampleApplicant)
      setPreviewScore(result)
    } catch (error) {
      console.error('Error calculating preview score:', error)
      toast({
        title: "Preview Error",
        description: "Could not calculate preview score",
        variant: "destructive"
      })
    } finally {
      setIsCalculatingPreview(false)
    }
  }

  useEffect(() => {
    calculatePreviewScore()
  }, [configs])

  const handleCreateConfig = async () => {
    if (!newConfig.factor || !newConfig.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/scoring-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfig)
      })

      if (response.ok) {
        const createdConfig = await response.json()
        setConfigs([...configs, createdConfig])
        setIsCreating(false)
        resetNewConfig()
        toast({
          title: "Success",
          description: "Scoring configuration created successfully"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create scoring configuration",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create scoring configuration",
        variant: "destructive"
      })
    }
  }

  const handleUpdateConfig = async () => {
    if (!editingConfig) return

    try {
      const response = await fetch(`/api/scoring-config/${editingConfig.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingConfig)
      })

      if (response.ok) {
        const updatedConfig = await response.json()
        setConfigs(configs.map(config => config.id === updatedConfig.id ? updatedConfig : config))
        setEditingConfig(null)
        toast({
          title: "Success",
          description: "Scoring configuration updated successfully"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update scoring configuration",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update scoring configuration",
        variant: "destructive"
      })
    }
  }

  const handleDeleteConfig = async (id: string) => {
    try {
      const response = await fetch(`/api/scoring-config/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setConfigs(configs.filter(config => config.id !== id))
        toast({
          title: "Success",
          description: "Scoring configuration deleted successfully"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete scoring configuration",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete scoring configuration",
        variant: "destructive"
      })
    }
  }

  const handleToggleConfig = async (id: string, isActive: boolean) => {
    try {
      const config = configs.find(c => c.id === id)
      if (!config) return

      const response = await fetch(`/api/scoring-config/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...config, isActive })
      })

      if (response.ok) {
        const updatedConfig = await response.json()
        setConfigs(configs.map(c => c.id === id ? updatedConfig : c))
        toast({
          title: "Success",
          description: `Scoring configuration ${isActive ? 'activated' : 'deactivated'}`
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle scoring configuration",
        variant: "destructive"
      })
    }
  }

  const handleSeedConfigs = async () => {
    try {
      setIsSeeding(true)
      const response = await fetch('/api/scoring-config/seed', {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        setConfigs(result.configs)
        toast({
          title: "Success",
          description: result.message
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to seed scoring configurations",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed scoring configurations",
        variant: "destructive"
      })
    } finally {
      setIsSeeding(false)
    }
  }

  const resetNewConfig = () => {
    setNewConfig({
      factor: "",
      name: "",
      description: "",
      maxPoints: 50,
      weight: 1.0,
      thresholds: "{}",
      category: "general",
      isActive: true,
      configType: "static",
      calculationType: "linear",
      minValue: undefined,
      maxValue: undefined,
      optimalValue: undefined
    })
  }

  const getCategoryConfig = (category: string) => {
    return categories.find(c => c.value === category) || categories[0]
  }

  const getCalculationTypeConfig = (type: string) => {
    return calculationTypes.find(c => c.value === type) || calculationTypes[0]
  }

  const getTotalMaxPoints = () => {
    return configs
      .filter(c => c.isActive && c.maxPoints > 0)
      .reduce((sum, c) => sum + c.maxPoints, 0)
  }

  const getTotalPenaltyPoints = () => {
    return configs
      .filter(c => c.isActive && c.maxPoints < 0)
      .reduce((sum, c) => sum + Math.abs(c.maxPoints), 0)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scoring Configuration</h1>
            <p className="text-muted-foreground">
              Configure maximum points, weights, and calculation methods for credit scoring factors
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSeedConfigs} 
              disabled={isSeeding}
              variant="outline"
            >
              {isSeeding ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Settings className="mr-2 h-4 w-4" />
              )}
              {isSeeding ? "Seeding..." : "Seed Defaults"}
            </Button>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Config
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Scoring Configuration</DialogTitle>
                  <DialogDescription>
                    Define a new scoring factor with configurable maximum points and calculation method
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="factor">Factor Key</Label>
                      <Input
                        id="factor"
                        value={newConfig.factor}
                        onChange={(e) => setNewConfig({...newConfig, factor: e.target.value})}
                        placeholder="e.g., age, annualIncome"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={newConfig.name}
                        onChange={(e) => setNewConfig({...newConfig, name: e.target.value})}
                        placeholder="e.g., Age Factor"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newConfig.description}
                      onChange={(e) => setNewConfig({...newConfig, description: e.target.value})}
                      placeholder="Describe this scoring factor"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxPoints">Max Points</Label>
                      <Input
                        id="maxPoints"
                        type="number"
                        value={newConfig.maxPoints}
                        onChange={(e) => setNewConfig({...newConfig, maxPoints: parseInt(e.target.value) || 0})}
                        placeholder="Maximum points for this factor"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Slider
                        value={[newConfig.weight]}
                        onValueChange={(value) => setNewConfig({...newConfig, weight: value[0]})}
                        max={10}
                        min={0}
                        step={0.1}
                        className="mt-2"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        Current: {newConfig.weight}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={newConfig.category} 
                        onValueChange={(value) => setNewConfig({...newConfig, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="calculationType">Calculation Type</Label>
                      <Select 
                        value={newConfig.calculationType} 
                        onValueChange={(value) => setNewConfig({...newConfig, calculationType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {calculationTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Threshold Configuration</Label>
                    <ThresholdBuilder
                      type={newConfig.calculationType as any}
                      thresholds={(() => {
                        try {
                          return JSON.parse(newConfig.thresholds)
                        } catch {
                          return {}
                        }
                      })()}
                      onChange={(thresholds) => setNewConfig({...newConfig, thresholds: JSON.stringify(thresholds)})}
                      maxPoints={newConfig.maxPoints}
                      factorName={newConfig.name || "Factor"}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateConfig}>
                    Create Config
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{configs.length}</div>
              <p className="text-xs text-muted-foreground">
                {configs.filter(c => c.isActive).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Points Available</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalMaxPoints()}</div>
              <p className="text-xs text-muted-foreground">
                Across all active factors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Penalty Points</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{getTotalPenaltyPoints()}</div>
              <p className="text-xs text-muted-foreground">
                Negative impact factors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scoring Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Scoring Preview
            </CardTitle>
            <CardDescription>
              See how your current configurations affect scoring with sample applicant data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCalculatingPreview ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Calculating preview score...</p>
              </div>
            ) : previewScore ? (
              <div className="space-y-6">
                {/* Preview Score Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {previewScore.totalScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Final Score</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {getTotalMaxPoints()}
                    </div>
                    <div className="text-sm text-muted-foreground">Max Available</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {configs.filter(c => c.isActive).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Factors</div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div>
                  <h4 className="font-medium mb-3">Category Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(previewScore.breakdown).map(([category, points]) => (
                      <div key={category} className="p-3 bg-muted rounded text-center">
                        <div className="font-bold text-sm">
                          {Math.round(Number(points))} pts
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Contributing Factors */}
                <div>
                  <h4 className="font-medium mb-3">Top Contributing Factors</h4>
                  <div className="space-y-2">
                    {previewScore.results
                      .sort((a: any, b: any) => b.weightedScore - a.weightedScore)
                      .slice(0, 5)
                      .map((factor: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm font-medium">{factor.name}</span>
                          <div className="text-right">
                            <span className="font-bold text-sm">
                              {Math.round(factor.weightedScore)} pts
                            </span>
                            <div className="text-xs text-muted-foreground">
                              ×{factor.weight}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p><strong>Sample Data:</strong> 35yo, $75k income, 10yr credit history, 0.3 DTI, Employed, Bachelor's</p>
                  <p>Preview updates automatically when configurations change</p>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No preview available. Add some scoring configurations to see a preview.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Configurations List */}
        <Card>
          <CardHeader>
            <CardTitle>Scoring Configurations</CardTitle>
            <CardDescription>
              Manage all scoring factors and their configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading configurations...</p>
              </div>
            ) : configs.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No scoring configurations found</p>
                <Button onClick={handleSeedConfigs} disabled={isSeeding}>
                  {isSeeding ? "Seeding..." : "Load Default Configurations"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {configs.map((config) => (
                  <Card key={config.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{config.name}</h3>
                          <Badge className={getCategoryConfig(config.category).color}>
                            {getCategoryConfig(config.category).label}
                          </Badge>
                          <Badge variant="outline">
                            {getCalculationTypeConfig(config.calculationType).label}
                          </Badge>
                          {!config.isActive && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {config.description || `Scoring factor for ${config.factor}`}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Max Points:</span>
                            <span className="ml-2 font-medium">{config.maxPoints}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="ml-2 font-medium">{config.weight}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Factor:</span>
                            <span className="ml-2 font-mono text-xs">{config.factor}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-2">{config.configType}</span>
                          </div>
                        </div>
                        
                        {config.thresholds && config.thresholds !== '{}' && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-2">Threshold Configuration:</p>
                            <ThresholdDisplay 
                              thresholds={config.thresholds} 
                              calculationType={config.calculationType}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={config.isActive}
                          onCheckedChange={(checked) => handleToggleConfig(config.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingConfig(config)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the "{config.name}" scoring configuration? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteConfig(config.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Config Dialog */}
      <Dialog open={!!editingConfig} onOpenChange={(open) => !open && setEditingConfig(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Scoring Configuration</DialogTitle>
            <DialogDescription>
              Modify the scoring configuration parameters
            </DialogDescription>
          </DialogHeader>
          
          {editingConfig && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-factor">Factor Key</Label>
                  <Input
                    id="edit-factor"
                    value={editingConfig.factor}
                    onChange={(e) => setEditingConfig({...editingConfig, factor: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-name">Display Name</Label>
                  <Input
                    id="edit-name"
                    value={editingConfig.name}
                    onChange={(e) => setEditingConfig({...editingConfig, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingConfig.description || ''}
                  onChange={(e) => setEditingConfig({...editingConfig, description: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-maxPoints">Max Points</Label>
                  <Input
                    id="edit-maxPoints"
                    type="number"
                    value={editingConfig.maxPoints}
                    onChange={(e) => setEditingConfig({...editingConfig, maxPoints: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-weight">Weight</Label>
                  <Slider
                    value={[editingConfig.weight]}
                    onValueChange={(value) => setEditingConfig({...editingConfig, weight: value[0]})}
                    max={10}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    Current: {editingConfig.weight}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editingConfig.category} 
                    onValueChange={(value) => setEditingConfig({...editingConfig, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-calculationType">Calculation Type</Label>
                  <Select 
                    value={editingConfig.calculationType} 
                    onValueChange={(value) => setEditingConfig({...editingConfig, calculationType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {calculationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Threshold Configuration</Label>
                <ThresholdBuilder
                  type={editingConfig.calculationType as any}
                  thresholds={(() => {
                    try {
                      return JSON.parse(editingConfig.thresholds)
                    } catch {
                      return {}
                    }
                  })()}
                  onChange={(thresholds) => setEditingConfig({...editingConfig, thresholds: JSON.stringify(thresholds)})}
                  maxPoints={editingConfig.maxPoints}
                  factorName={editingConfig.name || "Factor"}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingConfig(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateConfig}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}