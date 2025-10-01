"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Settings, 
  Code, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Copy,
  Download,
  Upload
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const validationFormSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required'),
  validationType: z.enum(['min', 'max', 'required', 'pattern', 'custom']),
  value: z.string().min(1, 'Validation value is required'),
  errorMessage: z.string().min(1, 'Error message is required')
})

type ValidationFormData = z.infer<typeof validationFormSchema>

interface ValidationRule {
  id: string
  fieldName: string
  validationType: 'min' | 'max' | 'required' | 'pattern' | 'custom'
  value: string
  errorMessage: string
  isActive: boolean
}

interface FieldConfigurationProps {
  fieldId?: string
  onValidationChange?: (validations: ValidationRule[]) => void
}

export function FieldConfiguration({ fieldId, onValidationChange }: FieldConfigurationProps) {
  const [validations, setValidations] = useState<ValidationRule[]>([])
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false)
  const [editingValidation, setEditingValidation] = useState<ValidationRule | null>(null)

  const validationForm = useForm<ValidationFormData>({
    resolver: zodResolver(validationFormSchema),
    defaultValues: {
      fieldName: '',
      validationType: 'required',
      value: '',
      errorMessage: ''
    }
  })

  const fieldTypeOptions = [
    { value: 'text', label: 'Text Input', description: 'Single line text input' },
    { value: 'number', label: 'Number Input', description: 'Numeric values only' },
    { value: 'select', label: 'Select Dropdown', description: 'Choose from predefined options' },
    { value: 'checkbox', label: 'Checkbox', description: 'True/False selection' },
    { value: 'date', label: 'Date Picker', description: 'Calendar date selection' },
    { value: 'radio', label: 'Radio Buttons', description: 'Single choice from options' }
  ]

  const categoryOptions = [
    { value: 'personal', label: 'Personal Information', icon: '👤' },
    { value: 'financial', label: 'Financial Information', icon: '💰' },
    { value: 'employment', label: 'Employment Information', icon: '💼' },
    { value: 'credit', label: 'Credit Information', icon: '💳' }
  ]

  const validationTypes = [
    { value: 'required', label: 'Required Field', description: 'Field must not be empty' },
    { value: 'min', label: 'Minimum Value', description: 'Minimum value for numbers or text length' },
    { value: 'max', label: 'Maximum Value', description: 'Maximum value for numbers or text length' },
    { value: 'pattern', label: 'Pattern Match', description: 'Regex pattern validation' },
    { value: 'custom', label: 'Custom Validation', description: 'Custom validation logic' }
  ]

  const handleAddValidation = (data: ValidationFormData) => {
    const newValidation: ValidationRule = {
      id: Date.now().toString(),
      fieldName: data.fieldName,
      validationType: data.validationType,
      value: data.value,
      errorMessage: data.errorMessage,
      isActive: true
    }
    
    const updatedValidations = [...validations, newValidation]
    setValidations(updatedValidations)
    onValidationChange?.(updatedValidations)
    setIsValidationDialogOpen(false)
    validationForm.reset()
    toast.success('Validation rule added successfully')
  }

  const handleEditValidation = (validation: ValidationRule) => {
    setEditingValidation(validation)
    validationForm.reset({
      fieldName: validation.fieldName,
      validationType: validation.validationType,
      value: validation.value,
      errorMessage: validation.errorMessage
    })
    setIsValidationDialogOpen(true)
  }

  const handleDeleteValidation = (id: string) => {
    const updatedValidations = validations.filter(v => v.id !== id)
    setValidations(updatedValidations)
    onValidationChange?.(updatedValidations)
    toast.success('Validation rule deleted successfully')
  }

  const generateValidationJSON = () => {
    const validationRules = validations.reduce((acc, validation) => {
      if (!validation.isActive) return acc
      
      switch (validation.validationType) {
        case 'required':
          acc.required = true
          break
        case 'min':
          acc.min = Number(validation.value)
          break
        case 'max':
          acc.max = Number(validation.value)
          break
        case 'pattern':
          acc.pattern = validation.value
          break
        case 'custom':
          acc.custom = validation.value
          break
      }
      
      if (validation.errorMessage) {
        acc.errorMessage = validation.errorMessage
      }
      
      return acc
    }, {} as any)
    
    return JSON.stringify(validationRules, null, 2)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const getValidationTypeColor = (type: string) => {
    switch (type) {
      case 'required': return 'bg-red-100 text-red-800'
      case 'min': return 'bg-blue-100 text-blue-800'
      case 'max': return 'bg-green-100 text-green-800'
      case 'pattern': return 'bg-purple-100 text-purple-800'
      case 'custom': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Field Configuration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Field Configuration
          </CardTitle>
          <CardDescription>
            Advanced configuration options for applicant fields including validation, scoring, and display settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="validation" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="validation">
                <CheckCircle className="mr-2 h-4 w-4" />
                Validation
              </TabsTrigger>
              <TabsTrigger value="scoring">
                <Code className="mr-2 h-4 w-4" />
                Scoring
              </TabsTrigger>
              <TabsTrigger value="display">
                <Settings className="mr-2 h-4 w-4" />
                Display
              </TabsTrigger>
              <TabsTrigger value="export">
                <Download className="mr-2 h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>

            {/* Validation Tab */}
            <TabsContent value="validation" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Validation Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure validation rules to ensure data quality and consistency
                  </p>
                </div>
                <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingValidation(null)
                      validationForm.reset()
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Validation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingValidation ? 'Edit Validation Rule' : 'Add Validation Rule'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure validation rules to ensure data quality for this field.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...validationForm}>
                      <form onSubmit={validationForm.handleSubmit(handleAddValidation)} className="space-y-4">
                        <FormField
                          control={validationForm.control}
                          name="fieldName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., annualIncome" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={validationForm.control}
                          name="validationType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Validation Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select validation type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {validationTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{type.label}</span>
                                        <span className="text-xs text-muted-foreground">{type.description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={validationForm.control}
                          name="value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Validation Value</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 0, 100, ^[A-Za-z]+$" 
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Value for validation (number, regex pattern, etc.)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={validationForm.control}
                          name="errorMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Error Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="This field is required" 
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Message to show when validation fails
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsValidationDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingValidation ? 'Update' : 'Add'} Rule
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {validations.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No validation rules configured. Add validation rules to ensure data quality.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {validations.map((validation) => (
                    <Card key={validation.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getValidationTypeColor(validation.validationType)}>
                              {validation.validationType}
                            </Badge>
                            <span className="font-medium">{validation.fieldName}</span>
                            {!validation.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Value: {validation.value} | Error: {validation.errorMessage}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditValidation(validation)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteValidation(validation.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Scoring Tab */}
            <TabsContent value="scoring" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Scoring Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure how this field contributes to the credit scoring calculation
                </p>
                
                <div className="grid gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Scoring Weight</CardTitle>
                      <CardDescription>
                        Set the multiplier for this field's impact on the final score
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Weight Multiplier</span>
                          <span className="text-sm text-muted-foreground">0.0x - 10.0x</span>
                        </div>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scoring weight" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0.0x - Not used in scoring</SelectItem>
                            <SelectItem value="0.5">0.5x - Low impact</SelectItem>
                            <SelectItem value="1">1.0x - Normal impact</SelectItem>
                            <SelectItem value="2">2.0x - High impact</SelectItem>
                            <SelectItem value="5">5.0x - Very high impact</SelectItem>
                            <SelectItem value="10">10.0x - Maximum impact</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Scoring Configuration</CardTitle>
                      <CardDescription>
                        Advanced scoring rules and thresholds
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        placeholder='{"type": "linear", "multiplier": 0.1, "cap": 100000}'
                        className="font-mono text-sm"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        JSON configuration for scoring calculation
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Display Tab */}
            <TabsContent value="display" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Display Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure how this field appears in forms and user interfaces
                </p>
                
                <div className="grid gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Field Type</CardTitle>
                      <CardDescription>
                        Choose the appropriate input type for this field
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {fieldTypeOptions.map((type) => (
                          <div key={type.value} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                            <Button variant="outline" size="sm">
                              Select
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Category</CardTitle>
                      <CardDescription>
                        Group this field with related fields
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryOptions.map((category) => (
                          <div key={category.value} className="flex items-center gap-3 p-3 border rounded-lg">
                            <span className="text-lg">{category.icon}</span>
                            <div>
                              <div className="font-medium">{category.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Display Options</CardTitle>
                      <CardDescription>
                        Additional display and formatting options
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Placeholder Text</label>
                          <Input 
                            placeholder="Enter value..." 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Help Text</label>
                          <Textarea 
                            placeholder="Additional help information..." 
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Default Value</label>
                          <Input 
                            placeholder="Default value..." 
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Export Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export field configuration for backup or deployment
                </p>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Validation Rules JSON</CardTitle>
                      <CardDescription>
                        Export validation rules as JSON configuration
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Textarea 
                          value={generateValidationJSON()}
                          readOnly
                          className="font-mono text-sm"
                          rows={8}
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(generateValidationJSON())}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy JSON
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Complete Field Configuration</CardTitle>
                      <CardDescription>
                        Export complete field configuration including all settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Textarea 
                          placeholder="Complete field configuration will appear here..."
                          readOnly
                          className="font-mono text-sm"
                          rows={12}
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Config
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download JSON
                          </Button>
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Import Config
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}