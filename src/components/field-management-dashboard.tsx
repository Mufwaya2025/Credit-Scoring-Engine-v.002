"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Copy,
  FileText,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

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

interface FieldManagementDashboardProps {
  onEditField?: (field: ApplicantField) => void
  onDeleteField?: (field: ApplicantField) => void
  onToggleField?: (field: ApplicantField) => void
}

export function FieldManagementDashboard({ 
  onEditField, 
  onDeleteField, 
  onToggleField 
}: FieldManagementDashboardProps) {
  const [fields, setFields] = useState<ApplicantField[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete'>('activate')

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

  const filteredFields = fields.filter(field => {
    const matchesSearch = field.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (field.description && field.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || field.category === selectedCategory
    const matchesType = selectedType === 'all' || field.fieldType === selectedType
    const matchesActive = activeFilter === 'all' || 
                         (activeFilter === 'active' && field.isActive) ||
                         (activeFilter === 'inactive' && !field.isActive)

    return matchesSearch && matchesCategory && matchesType && matchesActive
  })

  const handleSelectField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFields.length === filteredFields.length) {
      setSelectedFields([])
    } else {
      setSelectedFields(filteredFields.map(f => f.id))
    }
  }

  const handleBulkAction = async () => {
    if (selectedFields.length === 0) {
      toast.error('No fields selected')
      return
    }

    try {
      const promises = selectedFields.map(fieldId => {
        switch (bulkAction) {
          case 'activate':
            return fetch(`/api/applicant-fields/${fieldId}`, { method: 'PATCH' })
          case 'deactivate':
            return fetch(`/api/applicant-fields/${fieldId}`, { method: 'PATCH' })
          case 'delete':
            return fetch(`/api/applicant-fields/${fieldId}`, { method: 'DELETE' })
          default:
            return Promise.resolve()
        }
      })

      await Promise.all(promises)
      toast.success(`Bulk ${bulkAction} completed successfully`)
      setSelectedFields([])
      setIsBulkDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to complete bulk action')
    }
  }

  const exportFields = () => {
    const exportData = filteredFields.map(field => ({
      fieldName: field.fieldName,
      displayName: field.displayName,
      description: field.description,
      fieldType: field.fieldType,
      category: field.category,
      isRequired: field.isRequired,
      isActive: field.isActive,
      scoringWeight: field.scoringWeight,
      validationRules: field.validationRules,
      options: field.options,
      defaultValue: field.defaultValue,
      placeholder: field.placeholder,
      helpText: field.helpText,
      order: field.order
    }))

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `applicant-fields-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('Fields exported successfully')
  }

  const copyFieldConfig = (field: ApplicantField) => {
    const config = {
      fieldName: field.fieldName,
      displayName: field.displayName,
      description: field.description,
      fieldType: field.fieldType,
      category: field.category,
      isRequired: field.isRequired,
      isActive: field.isActive,
      validationRules: field.validationRules ? JSON.parse(field.validationRules) : undefined,
      options: field.options,
      defaultValue: field.defaultValue,
      placeholder: field.placeholder,
      helpText: field.helpText,
      order: field.order,
      scoringWeight: field.scoringWeight,
      scoringConfig: field.scoringConfig ? JSON.parse(field.scoringConfig) : undefined
    }

    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    toast.success('Field configuration copied to clipboard')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal': return '👤'
      case 'financial': return '💰'
      case 'employment': return '💼'
      case 'credit': return '💳'
      default: return '📄'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fields</p>
                <p className="text-2xl font-bold">{fields.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Fields</p>
                <p className="text-2xl font-bold">{fields.filter(f => f.isActive).length}</p>
              </div>
              <ToggleRight className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scoring Fields</p>
                <p className="text-2xl font-bold">{fields.filter(f => f.scoringWeight && f.scoringWeight > 0).length}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Required Fields</p>
                <p className="text-2xl font-bold">{fields.filter(f => f.isRequired).length}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Field Management
          </CardTitle>
          <CardDescription>
            Manage and configure applicant fields with advanced filtering and bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search fields by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedFields.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
              <span className="text-sm font-medium">
                {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('activate')
                    setIsBulkDialogOpen(true)
                  }}
                >
                  <ToggleRight className="mr-2 h-4 w-4" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('deactivate')
                    setIsBulkDialogOpen(true)
                  }}
                >
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete')
                    setIsBulkDialogOpen(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Export Actions */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              Showing {filteredFields.length} of {fields.length} fields
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportFields}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Fields Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedFields.length === filteredFields.length && filteredFields.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scoring</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFields.map((field) => (
                  <TableRow key={field.id} className="hover:bg-gray-50">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field.id)}
                        onChange={() => handleSelectField(field.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{field.displayName}</div>
                        <div className="text-sm text-gray-500">{field.fieldName}</div>
                        {field.description && (
                          <div className="text-xs text-gray-400 mt-1">
                            {field.description.length > 50 
                              ? `${field.description.substring(0, 50)}...` 
                              : field.description
                            }
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getCategoryIcon(field.category)}</span>
                        <Badge className={getCategoryColor(field.category)}>
                          {field.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getFieldTypeColor(field.fieldType)}>
                        {field.fieldType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {field.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {field.isRequired && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {field.scoringWeight && field.scoringWeight > 0 ? (
                        <Badge variant="outline">{field.scoringWeight}x</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{field.order}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditField?.(field)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onToggleField?.(field)}>
                            {field.isActive ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyFieldConfig(field)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Config
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteField?.(field)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredFields.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No fields found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedFields.length} selected field{selectedFields.length !== 1 ? 's' : ''}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
            >
              {bulkAction === 'delete' ? 'Delete' : bulkAction === 'activate' ? 'Activate' : 'Deactivate'} Fields
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}