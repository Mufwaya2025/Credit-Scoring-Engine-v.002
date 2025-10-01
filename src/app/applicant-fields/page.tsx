"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  FileText, 
  Plus, 
  RefreshCw, 
  Users, 
  DollarSign, 
  Briefcase, 
  CreditCard,
  Edit,
  Trash2,
  Settings,
  Save,
  X,
  Table,
  Grid,
  Calculator
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FieldManagementDashboard } from '@/components/field-management-dashboard'
import { CalculatedFieldsPanel } from '@/components/calculated-fields-panel'

const fieldFormSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Field name must be a valid identifier'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  fieldType: z.enum(['text', 'number', 'select', 'checkbox', 'date', 'radio'], {
    required_error: 'Field type is required'
  }),
  category: z.enum(['personal', 'financial', 'employment', 'credit'], {
    required_error: 'Category is required'
  }),
  isRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
  validationRules: z.string().optional(),
  options: z.string().optional(),
  defaultValue: z.string().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  order: z.number().min(0).max(100).default(0),
  scoringWeight: z.number().min(0).max(10).default(0),
  scoringConfig: z.string().optional()
})

type FieldFormData = z.infer<typeof fieldFormSchema>

interface ApplicantField {
  id: string
  fieldName: string
  displayName: string
  description?: string
  fieldType: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'radio'
  category: 'personal' | 'financial' | 'employment' | 'credit'
  isActive: boolean
  isRequired: boolean
  validationRules?: string
  options?: string
  defaultValue?: string
  placeholder?: string
  helpText?: string
  order: number
  scoringWeight?: number
  scoringConfig?: string
  createdAt: string
  updatedAt: string
}

export default function ApplicantFieldsPage() {
  const [fields, setFields] = useState<ApplicantField[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [editingField, setEditingField] = useState<ApplicantField | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingField, setDeletingField] = useState<ApplicantField | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      fieldName: '',
      displayName: '',
      description: '',
      fieldType: 'text',
      category: 'personal',
      isRequired: false,
      isActive: true,
      validationRules: '',
      options: '',
      defaultValue: '',
      placeholder: '',
      helpText: '',
      order: 0,
      scoringWeight: 0,
      scoringConfig: ''
    }
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/applicant-fields')
      if (response.ok) {
        const data = await response.json()
        setFields(data.data)
      }
    } catch (error) {
      console.error('Error loading fields:', error)
      toast.error('Failed to load applicant fields')
    } finally {
      setLoading(false)
    }
  }

  const handleSeedDefaults = async () => {
    try {
      setSeeding(true)
      const response = await fetch('/api/applicant-fields/seed', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success('Default fields seeded successfully')
        await loadData()
      } else {
        toast.error('Failed to seed default fields')
      }
    } catch (error) {
      console.error('Error seeding defaults:', error)
      toast.error('Error seeding default fields')
    } finally {
      setSeeding(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/applicant-fields/${id}`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        toast.success('Field status updated successfully')
        await loadData()
      } else {
        toast.error('Failed to update field status')
      }
    } catch (error) {
      console.error('Error toggling field:', error)
      toast.error('Error updating field status')
    }
  }

  const handleEditField = (field: ApplicantField) => {
    setEditingField(field)
    form.reset({
      fieldName: field.fieldName,
      displayName: field.displayName,
      description: field.description || '',
      fieldType: field.fieldType,
      category: field.category,
      isRequired: field.isRequired,
      isActive: field.isActive,
      validationRules: field.validationRules || '',
      options: field.options || '',
      defaultValue: field.defaultValue || '',
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      order: field.order,
      scoringWeight: field.scoringWeight || 0,
      scoringConfig: field.scoringConfig || ''
    })
    setIsDialogOpen(true)
  }

  const handleDeleteField = (field: ApplicantField) => {
    setDeletingField(field)
    setIsDeleteDialogOpen(true)
  }

  const handleAddField = () => {
    setEditingField(null)
    form.reset({
      fieldName: '',
      displayName: '',
      description: '',
      fieldType: 'text',
      category: 'personal',
      isRequired: false,
      isActive: true,
      validationRules: '',
      options: '',
      defaultValue: '',
      placeholder: '',
      helpText: '',
      order: fields.length,
      scoringWeight: 0,
      scoringConfig: ''
    })
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: FieldFormData) => {
    try {
      const url = editingField 
        ? `/api/applicant-fields/${editingField.id}`
        : '/api/applicant-fields'
      
      const method = editingField ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success(editingField ? 'Field updated successfully' : 'Field created successfully')
        setIsDialogOpen(false)
        await loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save field')
      }
    } catch (error) {
      console.error('Error saving field:', error)
      toast.error('Error saving field')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingField) return
    
    try {
      const response = await fetch(`/api/applicant-fields/${deletingField.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Field deleted successfully')
        setIsDeleteDialogOpen(false)
        await loadData()
      } else {
        toast.error('Failed to delete field')
      }
    } catch (error) {
      console.error('Error deleting field:', error)
      toast.error('Error deleting field')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal': return <Users className="h-4 w-4" />
      case 'financial': return <DollarSign className="h-4 w-4" />
      case 'employment': return <Briefcase className="h-4 w-4" />
      case 'credit': return <CreditCard className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal': return 'bg-blue-100 text-blue-800'
      case 'financial': return 'bg-green-100 text-green-800'
      case 'employment': return 'bg-purple-100 text-purple-800'
      case 'credit': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFieldTypeColor = (fieldType: string) => {
    switch (fieldType) {
      case 'text': return 'bg-gray-100 text-gray-800'
      case 'number': return 'bg-blue-100 text-blue-800'
      case 'select': return 'bg-purple-100 text-purple-800'
      case 'checkbox': return 'bg-green-100 text-green-800'
      case 'date': return 'bg-orange-100 text-orange-800'
      case 'radio': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFieldsByCategory = (category: string) => {
    return fields.filter(field => field.category === category && field.isActive)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const categories = [
    { key: 'personal', label: 'Personal Information', icon: Users },
    { key: 'financial', label: 'Financial Information', icon: DollarSign },
    { key: 'employment', label: 'Employment Information', icon: Briefcase },
    { key: 'credit', label: 'Credit Information', icon: CreditCard }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applicant Fields Configuration</h1>
            <p className="text-muted-foreground">
              Configure and manage applicant information fields for credit scoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddField}>
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
            <Button onClick={handleSeedDefaults} disabled={seeding} variant="outline">
              {seeding ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
              Seed Defaults
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {fields.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applicant Fields Configured</h3>
              <p className="text-muted-foreground text-center mb-4">
                Configure applicant fields to enable dynamic form generation and flexible data collection.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleAddField}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Field
                </Button>
                <Button onClick={handleSeedDefaults} disabled={seeding} variant="outline">
                  {seeding ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                  Use Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="management" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="management">
                <Table className="mr-2 h-4 w-4" />
                Management Dashboard
              </TabsTrigger>
              <TabsTrigger value="fields">
                <Grid className="mr-2 h-4 w-4" />
                Field Details
              </TabsTrigger>
              <TabsTrigger value="calculated">
                <Calculator className="mr-2 h-4 w-4" />
                Calculated Fields
              </TabsTrigger>
            </TabsList>

            {/* Management Dashboard Tab */}
            <TabsContent value="management" className="space-y-4">
              <FieldManagementDashboard
                onEditField={handleEditField}
                onDeleteField={handleDeleteField}
                onToggleField={(field) => handleToggleActive(field.id)}
              />
            </TabsContent>

            {/* Field Details Tab */}
            <TabsContent value="fields" className="space-y-4">
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">All Fields ({fields.length})</TabsTrigger>
                  <TabsTrigger value="scoring">
                    <Settings className="mr-2 h-4 w-4" />
                    Scoring Fields
                  </TabsTrigger>
                </TabsList>

            {/* All Fields Tab */}
            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4">
                {fields.map((field) => (
                  <Card key={field.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(field.category)}
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {field.displayName}
                              {!field.isActive && (
                                <Badge variant="secondary" className="text-xs">Inactive</Badge>
                              )}
                            </CardTitle>
                            <CardDescription>
                              {field.fieldName} • {field.fieldType}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(field.category)}>
                            {field.category}
                          </Badge>
                          <Badge className={getFieldTypeColor(field.fieldType)}>
                            {field.fieldType}
                          </Badge>
                          {field.isRequired && (
                            <Badge variant="destructive">Required</Badge>
                          )}
                          {field.scoringWeight && field.scoringWeight > 0 && (
                            <Badge variant="outline">Scoring: {field.scoringWeight}x</Badge>
                          )}
                          <Switch
                            checked={field.isActive}
                            onCheckedChange={() => handleToggleActive(field.id)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {field.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {field.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium">Category:</span>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(field.category)}
                            <span className="capitalize">{field.category}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Type:</span>
                          <div className="capitalize">{field.fieldType}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Required:</span>
                          <div>{field.isRequired ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Order:</span>
                          <div>{field.order}</div>
                        </div>
                      </div>

                      {field.scoringWeight && field.scoringWeight > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Scoring Weight:</span>
                            <span>{field.scoringWeight}x multiplier</span>
                          </div>
                          <Progress value={field.scoringWeight * 20} className="mt-1 h-2" />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditField(field)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteField(field)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Category Tabs */}
            {categories.map(category => (
              <TabsContent key={category.key} value={category.key} className="space-y-4">
                <div className="grid gap-4">
                  {getFieldsByCategory(category.key).map((field) => (
                    <Card key={field.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getCategoryIcon(field.category)}
                            <div>
                              <CardTitle className="text-lg">{field.displayName}</CardTitle>
                              <CardDescription>
                                {field.fieldName} • {field.fieldType}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getFieldTypeColor(field.fieldType)}>
                              {field.fieldType}
                            </Badge>
                            {field.isRequired && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                            {field.scoringWeight && field.scoringWeight > 0 && (
                              <Badge variant="outline">Scoring: {field.scoringWeight}x</Badge>
                            )}
                            <Switch
                              checked={field.isActive}
                              onCheckedChange={() => handleToggleActive(field.id)}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {field.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {field.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-sm font-medium">Type:</span>
                            <div className="capitalize">{field.fieldType}</div>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Required:</span>
                            <div>{field.isRequired ? 'Yes' : 'No'}</div>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Order:</span>
                            <div>{field.order}</div>
                          </div>
                        </div>

                        {field.scoringWeight && field.scoringWeight > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">Scoring Weight:</span>
                              <span>{field.scoringWeight}x multiplier</span>
                            </div>
                            <Progress value={field.scoringWeight * 20} className="mt-1 h-2" />
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditField(field)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteField(field)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}

            {/* Scoring Fields Tab */}
            <TabsContent value="scoring" className="space-y-4">
              <div className="grid gap-4">
                {fields.filter(f => f.scoringWeight && f.scoringWeight > 0).map((field) => (
                  <Card key={field.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(field.category)}
                          <div>
                            <CardTitle className="text-lg">{field.displayName}</CardTitle>
                            <CardDescription>
                              {field.fieldName} • Used in scoring calculations
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(field.category)}>
                            {field.category}
                          </Badge>
                          <Badge variant="outline">Weight: {field.scoringWeight}x</Badge>
                          <Switch
                            checked={field.isActive}
                            onCheckedChange={() => handleToggleActive(field.id)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {field.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {field.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium">Category:</span>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(field.category)}
                            <span className="capitalize">{field.category}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Type:</span>
                          <div className="capitalize">{field.fieldType}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Required:</span>
                          <div>{field.isRequired ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Order:</span>
                          <div>{field.order}</div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Scoring Weight:</span>
                          <span>{field.scoringWeight}x multiplier</span>
                        </div>
                        <Progress value={field.scoringWeight * 20} className="mt-1 h-2" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditField(field)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteField(field)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            </Tabs>
            </TabsContent>

            {/* Calculated Fields Tab */}
            <TabsContent value="calculated" className="space-y-4">
            <CalculatedFieldsPanel />
          </TabsContent>
          </Tabs>
        )}

        {/* Add/Edit Field Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingField ? 'Edit Field' : 'Add New Field'}
              </DialogTitle>
              <DialogDescription>
                {editingField 
                  ? 'Modify the configuration for this applicant field' 
                  : 'Create a new applicant field for data collection'
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fieldName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., annualIncome" 
                            {...field}
                            disabled={!!editingField} // Prevent changing field name after creation
                          />
                        </FormControl>
                        <FormDescription>
                          Technical name used in API and database
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Annual Income" {...field} />
                        </FormControl>
                        <FormDescription>
                          User-friendly name shown in forms
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the field purpose..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Help text for users understanding the field
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fieldType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Select Dropdown</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="radio">Radio Buttons</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Type of input field to generate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
                            <SelectItem value="employment">Employment</SelectItem>
                            <SelectItem value="credit">Credit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Group for organizing fields
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Order in form (0-100)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scoringWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scoring Weight</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="10" 
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Weight multiplier (0-10, 0 = no scoring)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="placeholder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placeholder</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter value..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Example text shown in empty field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="defaultValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Value</FormLabel>
                        <FormControl>
                          <Input placeholder="Default value..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Pre-filled value for the field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="options"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Options (for select/radio)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Option1|Option2|Option3&#10;Or: value1:Label1|value2:Label2"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        For select/radio fields. Use | to separate options, or value:label format
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validationRules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validation Rules</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='{"min": 0, "max": 100, "required": true}'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        JSON validation rules for the field
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="helpText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Help Text</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional help information for users..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Detailed help text shown below the field
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-4">
                  <FormField
                    control={form.control}
                    name="isRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Required Field</FormLabel>
                          <FormDescription>
                            This field must be filled out
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Field is available in forms
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    {editingField ? 'Update Field' : 'Create Field'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the field "{deletingField?.displayName}"? 
                This action cannot be undone and may affect existing forms and scoring calculations.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}