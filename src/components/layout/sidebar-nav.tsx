"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Brain, 
  Users, 
  Activity, 
  BarChart3, 
  GitCompare, 
  Settings, 
  Calculator,
  BookOpen,
  Info,
  Sliders,
  Target,
  User,
  FileText,
  ChevronDown,
  ChevronRight,
  X
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navigationGroups = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/", icon: Home },
      { name: "Single Prediction", href: "/prediction", icon: Brain },
      { name: "Batch Processing", href: "/batch", icon: Users },
    ]
  },
  {
    title: "Advanced",
    items: [
      { name: "Single Prediction (Dynamic)", href: "/prediction-dynamic", icon: Brain },
      { name: "Train Model", href: "/training", icon: Activity },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "Monitoring",
    items: [
      { name: "Monitoring", href: "/monitoring", icon: Activity },
      { name: "Model Comparison", href: "/comparison", icon: GitCompare },
    ]
  },
  {
    title: "Configuration",
    items: [
      { name: "Rules Configuration", href: "/rules", icon: Settings },
      { name: "Scoring Configuration", href: "/scoring-config", icon: Calculator },
      { name: "Score Range Configuration", href: "/score-range", icon: Target },
      { name: "Applicant Fields Configuration", href: "/applicant-fields", icon: FileText },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Advanced Settings", href: "/advanced", icon: Sliders },
      { name: "API Documentation", href: "/api-docs", icon: BookOpen },
      { name: "About", href: "/about", icon: Info },
    ]
  }
]

interface NavGroupProps {
  title: string
  items: Array<{ name: string; href: string; icon: any }>
  pathname: string
  isMobile?: boolean
  onItemClick?: () => void
}

function NavGroup({ title, items, pathname, isMobile = false, onItemClick }: NavGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const hasActiveItem = items.some(item => pathname === item.href)
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      
      {isExpanded && (
        <ul role="list" className="mt-1 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "group flex gap-x-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 mx-1",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent hover:scale-[1.02]"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )} 
                    aria-hidden="true" 
                  />
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

interface SidebarNavProps {
  onItemClick?: () => void
}

export function SidebarNav({ onItemClick }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col p-4 space-y-6 h-full">
      {/* Logo/Brand */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Target className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">ARC Credit Engine</div>
            <div className="text-xs text-muted-foreground">Pro v1.0.0</div>
          </div>
        </div>
        {/* Mobile close button */}
        {onItemClick && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={onItemClick}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto">
        {navigationGroups.map((group) => (
          <NavGroup
            key={group.title}
            title={group.title}
            items={group.items}
            pathname={pathname}
            onItemClick={onItemClick}
          />
        ))}
      </div>
      
      {/* Footer */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-3 px-3 py-3 bg-accent/50 rounded-lg">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">System Online</div>
            <div className="text-xs text-muted-foreground">All services operational</div>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
    </nav>
  )
}