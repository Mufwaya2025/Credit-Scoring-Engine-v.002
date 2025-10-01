"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Layers, Target, Sliders } from "lucide-react"

interface ThresholdDisplayProps {
  thresholds: string
  calculationType: string
}

export function ThresholdDisplay({ thresholds, calculationType }: ThresholdDisplayProps) {
  try {
    const parsedThresholds = JSON.parse(thresholds)
    
    switch (calculationType) {
      case 'linear':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Linear Scoring</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Min:</span> {parsedThresholds.min}
              </div>
              <div>
                <span className="text-muted-foreground">Max:</span> {parsedThresholds.max}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Rate:</span> {parsedThresholds.rate} points per unit
              </div>
            </div>
          </div>
        )
        
      case 'threshold':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Threshold Ranges</span>
            </div>
            <div className="space-y-1">
              {parsedThresholds.ranges?.map((range: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                  <div>
                    <span className="font-medium text-xs">{range.name}</span>
                    {range.description && (
                      <p className="text-xs text-muted-foreground">{range.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {range.points} pts
                    </Badge>
                    {(range.min !== undefined || range.max !== undefined) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {range.min !== undefined ? range.min : '∞'} - {range.max !== undefined ? range.max : '∞'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
        
      case 'categorical':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Categories</span>
            </div>
            <div className="space-y-1">
              {parsedThresholds.categories?.map((category: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                  <div>
                    <span className="font-medium text-xs">{category.name}</span>
                    {category.description && (
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )
        
      case 'optimal':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Optimal Value</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Optimal:</span> {parsedThresholds.optimal}
              </div>
              <div>
                <span className="text-muted-foreground">Tolerance:</span> ±{parsedThresholds.tolerance}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Max Points:</span> {parsedThresholds.maxPoints}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Max points at optimal value, decreasing to 0 at optimal ± tolerance
            </p>
          </div>
        )
        
      default:
        return (
          <div className="space-y-2">
            <span className="text-sm font-medium">Custom Configuration</span>
            <pre className="text-xs text-muted-foreground overflow-x-auto">
              {JSON.stringify(parsedThresholds, null, 2)}
            </pre>
          </div>
        )
    }
  } catch (error) {
    return (
      <div className="text-xs text-muted-foreground">
        Invalid threshold configuration
      </div>
    )
  }
}