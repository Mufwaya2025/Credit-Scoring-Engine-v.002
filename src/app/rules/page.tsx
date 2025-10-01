"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ConditionBuilder } from "@/components/rules/condition-builder"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Gavel,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  Loader2
} from "lucide-react"

interface Rule {
  id: string
  name: string
  description?: string
  type: string
  category: string
  condition: string
  action: string
  actionValue?: string
  priority: number
  isActive: boolean
  weight: number
  createdAt: string
  executionCount?: number
}

interface RuleTemplate {
  name: string
  description: string
  type: string
  category: string
  condition: string
  action: string
  actionValue?: string
}

const ruleTemplates: RuleTemplate[] = [
  {
    name: "Minimum Credit Score",
    description: "Reject applications below minimum credit score",
    type: "eligibility",
    category: "credit_score",
    condition: '{"field": "creditScore", "operator": "<", "value": 600}',
    action: "reject",
    actionValue: '{"reason": "Credit score below minimum requirement"}'
  },
  {
    name: "Maximum Debt-to-Income Ratio",
    description: "Reject applications with high debt-to-income ratio",
    type: "risk",
    category: "debt",
    condition: '{"field": "debtToIncomeRatio", "operator": ">", "value": 0.5}',
    action: "reject",
    actionValue: '{"reason": "Debt-to-income ratio too high"}'
  },
  {
    name: "Employment Stability",
    description: "Require minimum employment duration",
    type: "eligibility",
    category: "employment",
    condition: '{"field": "employmentDuration", "operator": "<", "value": 6}',
    action: "flag",
    actionValue: '{"flag": "Employment stability review required"}'
  },
  {
    name: "Income Verification",
    description: "Adjust loan amount based on income",
    type: "pricing",
    category: "income",
    condition: '{"field": "annualIncome", "operator": "<", "value": 50000}',
    action: "adjust_limit",
    actionValue: '{"multiplier": 3, "maxAmount": 50000}'
  }
]

const ruleTypes = [
  { value: "eligibility", label: "Eligibility", icon: Shield, color: "bg-blue-100 text-blue-800" },
  { value: "risk", label: "Risk Assessment", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
  { value: "pricing", label: "Pricing", icon: DollarSign, color: "bg-green-100 text-green-800" },
  { value: "limit", label: "Limit Setting", icon: TrendingUp, color: "bg-purple-100 text-purple-800" }
]

const ruleCategories = [
  "credit_score", "income", "debt", "employment", "age", "loan_amount", "payment_history"
]

const ruleActions = [
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "flag", label: "Flag for Review" },
  { value: "adjust_score", label: "Adjust Credit Score" },
  { value: "adjust_limit", label: "Adjust Loan Limit" }
]

export default function RulesPage() {
  const { toast } = useToast()
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [showJsonCondition, setShowJsonCondition] = useState(false)
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: "",
    description: "",
    type: "eligibility",
    category: "credit_score",
    condition: '{"field": "creditScore", "operator": ">", "value": 600}',
    action: "approve",
    actionValue: "",
    priority: 1,
    isActive: true,
    weight: 1.0
  })

  // Fetch rules from API
  const fetchRules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rules')
      if (response.ok) {
        const data = await response.json()
        setRules(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch rules",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rules",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  useEffect(() => {
    console.log("isCreating changed to:", isCreating);
  }, [isCreating])

  useEffect(() => {
    console.log("editingRule changed to:", editingRule);
  }, [editingRule])

  const handleCreateRule = async () => {
    console.log("handleCreateRule called");
    console.log("newRule:", newRule);
    
    if (!newRule.name || !newRule.condition || !newRule.action) {
      console.log("Validation failed - missing required fields");
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      console.log("Attempting to create rule via API...");
      const response = await fetch('/api/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRule)
      })

      console.log("API response status:", response.status);
      
      if (response.ok) {
        const createdRule = await response.json()
        console.log("Rule created successfully:", createdRule);
        setRules([...rules, createdRule])
        setIsCreating(false)
        setNewRule({
          name: "",
          description: "",
          type: "eligibility",
          category: "credit_score",
          condition: '{"field": "creditScore", "operator": ">", "value": 600}',
          action: "approve",
          actionValue: "",
          priority: 1,
          isActive: true,
          weight: 1.0
        })
        toast({
          title: "Success",
          description: "Rule created successfully"
        })
      } else {
        const error = await response.json()
        console.log("API error:", error);
        toast({
          title: "Error",
          description: error.error || "Failed to create rule",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.log("Exception occurred:", error);
      toast({
        title: "Error",
        description: "Failed to create rule",
        variant: "destructive"
      })
    }
  }

  const handleUpdateRule = async () => {
    if (!editingRule) return

    console.log("Updating rule:", editingRule);

    // Ensure proper data types and handle null values
    const updateData = {
      ...editingRule,
      priority: Number(editingRule.priority),
      weight: Number(editingRule.weight),
      actionValue: editingRule.actionValue || "" // Convert null to empty string
    };

    console.log("Update data with proper types:", updateData);

    try {
      const response = await fetch(`/api/rules/${editingRule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      console.log("API response status:", response.status);
      
      if (response.ok) {
        const updatedRule = await response.json()
        console.log("Rule updated successfully:", updatedRule);
        setRules(rules.map(rule => rule.id === updatedRule.id ? updatedRule : rule))
        setEditingRule(null)
        toast({
          title: "Success",
          description: "Rule updated successfully"
        })
      } else {
        const error = await response.json()
        console.log("API error:", error);
        toast({
          title: "Error",
          description: error.message || error.error || "Failed to update rule",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.log("Exception occurred:", error);
      toast({
        title: "Error",
        description: "Failed to update rule",
        variant: "destructive"
      })
    }
  }

  const handleDeleteRule = async (id: string) => {
    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRules(rules.filter(rule => rule.id !== id))
        toast({
          title: "Success",
          description: "Rule deleted successfully"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete rule",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive"
      })
    }
  }

  const handleToggleRule = async (id: string) => {
    console.log("Toggling rule with id:", id);
    console.log("Full rule object:", rules.find(r => r.id === id));
    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log("Toggle response status:", response.status);
      console.log("Toggle response headers:", response.headers);

      if (response.ok) {
        const updatedRule = await response.json()
        console.log("Rule toggled successfully:", updatedRule);
        setRules(rules.map(rule => rule.id === id ? updatedRule : rule))
        toast({
          title: "Success",
          description: `Rule ${updatedRule.isActive ? 'activated' : 'deactivated'} successfully`
        })
      } else {
        const error = await response.json()
        console.log("Toggle error:", error);
        console.log("Error details:", JSON.stringify(error, null, 2));
        toast({
          title: "Error",
          description: error.message || error.error || "Failed to toggle rule",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.log("Toggle exception:", error);
      console.log("Exception details:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to toggle rule",
        variant: "destructive"
      })
    }
  }

  const applyTemplate = (template: RuleTemplate) => {
    setNewRule({
      ...template,
      actionValue: template.actionValue || "",
      priority: 1,
      isActive: true,
      weight: 1.0
    })
    setIsCreating(true)
  }

  const getRuleTypeConfig = (type: string) => {
    return ruleTypes.find(rt => rt.value === type) || ruleTypes[0]
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Edit Rule Dialog */}
        <Dialog open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Rule</DialogTitle>
              <DialogDescription>
                Modify the rule configuration
              </DialogDescription>
            </DialogHeader>
            
            {editingRule && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-rule-name">Rule Name</Label>
                    <Input
                      id="edit-rule-name"
                      value={editingRule.name || ""}
                      onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
                      placeholder="Enter rule name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-rule-type">Rule Type</Label>
                    <Select 
                      value={editingRule.type}
                      onValueChange={(value) => setEditingRule({...editingRule, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-rule-description">Description</Label>
                  <Textarea
                    id="edit-rule-description"
                    value={editingRule.description || ""}
                    onChange={(e) => setEditingRule({...editingRule, description: e.target.value})}
                    placeholder="Describe what this rule does"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-rule-category">Category</Label>
                    <Select 
                      value={editingRule.category}
                      onValueChange={(value) => setEditingRule({...editingRule, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-rule-action">Action</Label>
                    <Select 
                      value={editingRule.action}
                      onValueChange={(value) => setEditingRule({...editingRule, action: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleActions.map(action => (
                          <SelectItem key={action.value} value={action.value}>
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-rule-priority">Priority</Label>
                    <Select 
                      value={String(editingRule.priority || 1)}
                      onValueChange={(value) => setEditingRule({...editingRule, priority: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(priority => (
                          <SelectItem key={priority} value={String(priority)}>
                            {priority} {priority === 10 ? '(Highest)' : priority === 1 ? '(Lowest)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-rule-weight">Weight</Label>
                    <Select 
                      value={String(editingRule.weight || 1.0)}
                      onValueChange={(value) => setEditingRule({...editingRule, weight: parseFloat(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0.1, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map(weight => (
                          <SelectItem key={weight} value={String(weight)}>
                            {weight} {weight === 3.0 ? '(Highest)' : weight === 0.1 ? '(Lowest)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Value Field */}
                <div>
                  <Label htmlFor="edit-rule-action-value">Action Value (JSON)</Label>
                  <Textarea
                    id="edit-rule-action-value"
                    value={editingRule.actionValue || ""}
                    onChange={(e) => setEditingRule({...editingRule, actionValue: e.target.value})}
                    placeholder='{"reason": "Explanation for action"}'
                    className="font-mono text-sm"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional: JSON object with additional action parameters
                  </p>
                </div>

                {/* Condition Builder for Edit */}
                <ConditionBuilder
                  condition={editingRule.condition || ""}
                  onConditionChange={(condition) => setEditingRule({...editingRule, condition})}
                  showJson={showJsonCondition}
                  onToggleJson={() => setShowJsonCondition(!showJsonCondition)}
                />

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-rule-active"
                    checked={editingRule.isActive}
                    onCheckedChange={(checked) => setEditingRule({...editingRule, isActive: checked})}
                  />
                  <Label htmlFor="edit-rule-active">Rule is active</Label>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRule(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRule}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rules Configuration</h1>
            <p className="text-muted-foreground">
              Manage business rules and decision logic for credit scoring
            </p>
          </div>
          <Button onClick={() => {
            console.log("Create Rule button clicked");
            console.log("isCreating before:", isCreating);
            setIsCreating(true);
            console.log("isCreating after:", true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Button>
        </div>

        {/* Simple Create Rule Form - Always visible for debugging */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Rule</CardTitle>
            <CardDescription>
              Define the rule conditions and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={newRule.name || ""}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  placeholder="Enter rule name"
                />
              </div>
              
              <div>
                <Label htmlFor="rule-type">Rule Type</Label>
                <Select 
                  value={newRule.type}
                  onValueChange={(value) => setNewRule({...newRule, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ruleTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="rule-description">Description</Label>
              <Textarea
                id="rule-description"
                value={newRule.description || ""}
                onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                placeholder="Describe what this rule does"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-category">Category</Label>
                <Select 
                  value={newRule.category}
                  onValueChange={(value) => setNewRule({...newRule, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ruleCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rule-action">Action</Label>
                <Select 
                  value={newRule.action}
                  onValueChange={(value) => setNewRule({...newRule, action: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ruleActions.map(action => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-priority">Priority</Label>
                <Select 
                  value={String(newRule.priority || 1)}
                  onValueChange={(value) => setNewRule({...newRule, priority: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(priority => (
                      <SelectItem key={priority} value={String(priority)}>
                        {priority} {priority === 10 ? '(Highest)' : priority === 1 ? '(Lowest)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rule-weight">Weight</Label>
                <Select 
                  value={String(newRule.weight || 1.0)}
                  onValueChange={(value) => setNewRule({...newRule, weight: parseFloat(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0.1, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map(weight => (
                      <SelectItem key={weight} value={String(weight)}>
                        {weight} {weight === 3.0 ? '(Highest)' : weight === 0.1 ? '(Lowest)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Value Field */}
            <div>
              <Label htmlFor="rule-action-value">Action Value (JSON)</Label>
              <Textarea
                id="rule-action-value"
                value={newRule.actionValue || ""}
                onChange={(e) => setNewRule({...newRule, actionValue: e.target.value})}
                placeholder='{"reason": "Explanation for action"}'
                className="font-mono text-sm"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional: JSON object with additional action parameters
              </p>
            </div>

            {/* Condition Builder */}
            <ConditionBuilder
              condition={newRule.condition || ""}
              onConditionChange={(condition) => setNewRule({...newRule, condition})}
              showJson={showJsonCondition}
              onToggleJson={() => setShowJsonCondition(!showJsonCondition)}
            />

            <div className="flex gap-2">
              <Button 
                onClick={handleCreateRule}
              >
                Create Rule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : rules.length}</div>
              <p className="text-xs text-muted-foreground">
                {loading ? '-' : `${rules.filter(r => r.isActive).length} active`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : rules.reduce((sum, rule) => sum + (rule.executionCount || 0), 0)}</div>
              <p className="text-xs text-muted-foreground">
                {loading ? '-' : '+12% from yesterday'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Trigger Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : '23.4%'}</div>
              <p className="text-xs text-muted-foreground">
                Rules triggered
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : '87.5'}</div>
              <p className="text-xs text-muted-foreground">
                Decision quality
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rules">Rules Management</TabsTrigger>
            <TabsTrigger value="templates">Rule Templates</TabsTrigger>
            <TabsTrigger value="analytics">Rule Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            {/* Rules List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading rules...</span>
                </div>
              ) : rules.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Rules Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first rule to start managing credit scoring logic
                    </p>
                    <Button onClick={() => setIsCreating(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Rule
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                rules.map(rule => {
                  const typeConfig = getRuleTypeConfig(rule.type)
                  return (
                    <Card key={rule.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge className={typeConfig.color}>
                                <typeConfig.icon className="h-3 w-3 mr-1" />
                                {typeConfig.label}
                              </Badge>
                              <Badge variant="outline">
                                {rule.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                              {rule.isActive ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                            
                            <h3 className="text-lg font-semibold">{rule.name}</h3>
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                            
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="font-medium">Condition:</span>
                                <code className="ml-2 bg-muted px-1 py-0.5 rounded text-xs">
                                  {rule.condition}
                                </code>
                              </div>
                              <div>
                                <span className="font-medium">Action:</span>
                                <span className="ml-2">{rule.action}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>Priority: {rule.priority}</span>
                                <span>Weight: {rule.weight}</span>
                                {rule.executionCount && <span>Executions: {rule.executionCount}</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleRule(rule.id)}
                              disabled={loading}
                            >
                              {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log("Edit button clicked for rule:", rule);
                                setEditingRule(rule);
                              }}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Rule</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the rule "{rule.name}"? This action cannot be undone and will remove all associated execution records.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteRule(rule.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {ruleTemplates.map((template, index) => {
                const typeConfig = getRuleTypeConfig(template.type)
                return (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Badge className={typeConfig.color}>
                          <typeConfig.icon className="h-3 w-3 mr-1" />
                          {typeConfig.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Category:</span>
                          <span className="ml-2">{template.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                        <div>
                          <span className="font-medium">Action:</span>
                          <span className="ml-2">{template.action}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <code className="bg-muted px-1 py-0.5 rounded">
                            {template.condition}
                          </code>
                        </div>
                      </div>
                      <Button 
                        className="mt-4 w-full" 
                        size="sm"
                        onClick={() => applyTemplate(template)}
                      >
                        Apply Template
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Rule Performance</CardTitle>
                  <CardDescription>Execution statistics and effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Trigger Rate</span>
                        <span>23.4%</span>
                      </div>
                      <Progress value={23.4} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span>87.5%</span>
                      </div>
                      <Progress value={87.5} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. Processing Time</span>
                        <span>45ms</span>
                      </div>
                      <Progress value={75} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rule Distribution</CardTitle>
                  <CardDescription>Breakdown by rule type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ruleTypes.map(type => {
                      const count = rules.filter(r => r.type === type.value).length
                      const percentage = rules.length > 0 ? (count / rules.length) * 100 : 0
                      return (
                        <div key={type.value}>
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center">
                              <type.icon className="h-3 w-3 mr-1" />
                              {type.label}
                            </span>
                            <span>{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="mt-1" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
                <CardDescription>Latest rule execution logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Minimum Credit Score - Triggered
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Application #1234 • Credit Score: 523 • 2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Maximum Debt-to-Income Ratio - Not Triggered
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Application #1235 • DTI: 0.35 • 5 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Employment Stability - Flagged
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Application #1236 • Employment: 3 months • 8 minutes ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rule Engine Settings</CardTitle>
                <CardDescription>Configure global rule execution behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="execution-mode">Execution Mode</Label>
                    <Select defaultValue="sequential">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential (Priority Order)</SelectItem>
                        <SelectItem value="weighted">Weighted Scoring</SelectItem>
                        <SelectItem value="parallel">Parallel Execution</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose how rules are executed against applications
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="max-rules">Maximum Rules per Application</Label>
                    <Input id="max-rules" type="number" defaultValue="100" min="1" max="1000" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Limit the number of rules that can be executed per application
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="audit-logging" defaultChecked />
                    <Label htmlFor="audit-logging">Enable Audit Logging</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Log all rule executions for compliance and debugging
                  </p>

                  <div className="flex items-center space-x-2">
                    <Switch id="performance-monitoring" defaultChecked />
                    <Label htmlFor="performance-monitoring">Performance Monitoring</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track rule execution performance and metrics
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Rule engine status and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">Healthy</div>
                    <p className="text-sm text-muted-foreground">System Status</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">45ms</div>
                    <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">99.9%</div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
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