import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  lines?: number
  avatar?: boolean
  button?: boolean
  card?: boolean
}

export function LoadingSkeleton({ 
  className, 
  lines = 3, 
  avatar = false, 
  button = false,
  card = false 
}: LoadingSkeletonProps) {
  if (card) {
    return (
      <div className={cn("space-y-4 p-6", className)}>
        <div className="flex items-center space-x-4">
          {avatar && <div className="h-12 w-12 rounded-full bg-muted" />}
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 bg-muted rounded",
                i === lines - 1 ? "w-5/6" : "w-full"
              )}
            />
          ))}
        </div>
        {button && <div className="h-9 bg-muted rounded w-1/3" />}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 bg-muted rounded",
            i === lines - 1 ? "w-5/6" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

interface CardSkeletonProps {
  count?: number
  className?: string
}

export function CardSkeleton({ count = 1, className }: CardSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-32 bg-muted rounded-lg animate-pulse"
        />
      ))}
    </div>
  )
}

interface StatsSkeletonProps {
  count?: number
  className?: string
}

export function StatsSkeleton({ count = 4, className }: StatsSkeletonProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-24 bg-muted rounded-lg animate-pulse"
        />
      ))}
    </div>
  )
}