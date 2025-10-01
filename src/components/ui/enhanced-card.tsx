import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface EnhancedCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  variant?: "default" | "glass" | "elevated" | "bordered"
  hover?: "lift" | "glow" | "scale" | "none"
  loading?: boolean
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", hover = "none", loading = false, children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-card border-border",
      glass: "bg-card/50 backdrop-blur-sm border-border/50",
      elevated: "bg-card shadow-lg border-border/30",
      bordered: "bg-card border-2 border-border"
    }

    const hoverClasses = {
      lift: "hover:shadow-xl hover:-translate-y-1",
      glow: "hover:shadow-lg hover:shadow-primary/10",
      scale: "hover:scale-[1.02]",
      none: ""
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-200",
          variantClasses[variant],
          hover !== "none" && hoverClasses[hover],
          loading && "animate-pulse",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    )
  }
)

EnhancedCard.displayName = "EnhancedCard"

// Enhanced Card Header
const EnhancedCardHeader = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardHeader>
>(({ className, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn("pb-4", className)}
    {...props}
  />
))

EnhancedCardHeader.displayName = "EnhancedCardHeader"

// Enhanced Card Title
const EnhancedCardTitle = forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof CardTitle>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn("text-lg font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
))

EnhancedCardTitle.displayName = "EnhancedCardTitle"

// Enhanced Card Description
const EnhancedCardDescription = forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof CardDescription>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))

EnhancedCardDescription.displayName = "EnhancedCardDescription"

// Enhanced Card Content
const EnhancedCardContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardContent>
>(({ className, ...props }, ref) => (
  <CardContent
    ref={ref}
    className={cn("pt-0", className)}
    {...props}
  />
))

EnhancedCardContent.displayName = "EnhancedCardContent"

export { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardDescription, EnhancedCardContent }