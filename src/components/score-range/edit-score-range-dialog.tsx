"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Edit, Save, X } from 'lucide-react'

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

interface EditScoreRangeDialogProps {
  range: ScoreRange | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedRange: Partial<ScoreRange>) => void
}

export default function EditScoreRangeDialog({ range, open, onOpenChange, onSave }: EditScoreRangeDialogProps) {
  const [formData, setFormData] = useState<Partial<ScoreRange>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (range) {
      setFormData(range)
    }
  }, [range])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!range) return

    setLoading(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving score range:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ScoreRange, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!range) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Score Range: {range.name}
          </DialogTitle>
          <DialogDescription>
            Modify the score range configuration and business rules.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                value={formData.priority || 1}
                onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minScore">Minimum Score</Label>
              <Input
                id="minScore"
                type="number"
                min="300"
                max="850"
                value={formData.minScore || 300}
                onChange={(e) => handleInputChange('minScore', parseInt(e.target.value) || 300)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxScore">Maximum Score (leave empty for unbounded)</Label>
              <Input
                id="maxScore"
                type="number"
                min="300"
                max="850"
                value={formData.maxScore || ''}
                onChange={(e) => handleInputChange('maxScore', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color || '#6B7280'}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.color || '#6B7280'}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="#6B7280"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approvalStatus">Approval Status</Label>
              <Select 
                value={formData.approvalStatus || ''} 
                onValueChange={(value) => handleInputChange('approvalStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select approval status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Approved with Conditions">Approved with Conditions</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Manual Review">Manual Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select 
                value={formData.riskLevel || ''} 
                onValueChange={(value) => handleInputChange('riskLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low Risk">Low Risk</SelectItem>
                  <SelectItem value="Medium Risk">Medium Risk</SelectItem>
                  <SelectItem value="High Risk">High Risk</SelectItem>
                  <SelectItem value="Very High Risk">Very High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select 
                value={formData.isActive ? 'true' : 'false'} 
                onValueChange={(value) => handleInputChange('isActive', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interestRateAdjustment">Interest Rate Adjustment (%)</Label>
              <Input
                id="interestRateAdjustment"
                type="number"
                step="0.1"
                value={formData.interestRateAdjustment || 0}
                onChange={(e) => handleInputChange('interestRateAdjustment', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
              />
              <p className="text-xs text-muted-foreground">
                Positive values increase rate, negative values decrease rate
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanLimitAdjustment">Loan Limit Multiplier</Label>
              <Input
                id="loanLimitAdjustment"
                type="number"
                step="0.1"
                min="0"
                value={formData.loanLimitAdjustment || 1}
                onChange={(e) => handleInputChange('loanLimitAdjustment', parseFloat(e.target.value) || 1)}
                placeholder="1.0"
              />
              <p className="text-xs text-muted-foreground">
                1.0 = no change, {'>'}1.0 = increase, {'<'}1.0 = decrease
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Badge variant={formData.approvalStatus === 'Approved' ? 'default' : 
                           formData.approvalStatus === 'Approved with Conditions' ? 'secondary' : 
                           formData.approvalStatus === 'Rejected' ? 'destructive' : 'outline'}>
                {formData.approvalStatus || 'Unknown'}
              </Badge>
              <Badge variant={formData.riskLevel === 'Low Risk' ? 'default' : 
                           formData.riskLevel === 'Medium Risk' ? 'secondary' : 
                           formData.riskLevel === 'High Risk' ? 'destructive' : 'outline'}>
                {formData.riskLevel || 'Unknown'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}