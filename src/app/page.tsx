"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Brain,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  Target,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"

const statsData = [
  {
    title: "Total Predictions",
    value: "12,234",
    change: "+20.1%",
    changeType: "positive",
    icon: CreditCard,
    description: "from last month"
  },
  {
    title: "Approval Rate",
    value: "78.5%",
    change: "+5.2%",
    changeType: "positive",
    icon: TrendingUp,
    description: "from last month"
  },
  {
    title: "Risk Score Avg",
    value: "724",
    change: "+12.3%",
    changeType: "positive",
    icon: Target,
    description: "ARC Score"
  },
  {
    title: "High Risk Alerts",
    value: "23",
    change: "-8.2%",
    changeType: "negative",
    icon: AlertTriangle,
    description: "from last month"
  }
]

const quickActions = [
  {
    title: "ARC Single Prediction",
    description: "Evaluate a single credit application with ARC AI",
    icon: Brain,
    color: "bg-blue-600",
    href: "/prediction"
  },
  {
    title: "ARC Batch Processing",
    description: "Process multiple applications with ARC algorithms",
    icon: Users,
    color: "bg-green-600",
    href: "/batch"
  },
  {
    title: "ARC Model Training",
    description: "Train or retrain ARC credit scoring models",
    icon: Activity,
    color: "bg-purple-600",
    href: "/training"
  }
]

const recentActivity = [
  {
    id: 1,
    type: "approval",
    title: "ARC Application #1234 - Approved",
    details: "ARC Score: 742",
    time: "2 minutes ago",
    status: "success"
  },
  {
    id: 2,
    type: "rejection",
    title: "ARC Application #1235 - Rejected",
    details: "ARC Score: 523",
    time: "5 minutes ago",
    status: "error"
  },
  {
    id: 3,
    type: "training",
    title: "ARC Model Training Completed",
    details: "Accuracy improved by 2.3%",
    time: "1 hour ago",
    status: "success"
  },
  {
    id: 4,
    type: "alert",
    title: "ARC High Risk Alert",
    details: "3 applications require review",
    time: "2 hours ago",
    status: "warning"
  }
]

const StatCard = ({ stat }: { stat: typeof statsData[0] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        <div className="p-2 bg-accent/50 rounded-lg">
          <stat.icon className="h-4 w-4 text-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <div className="flex items-center gap-1 mt-1">
          <Badge 
            variant={stat.changeType === "positive" ? "default" : "destructive"}
            className="text-xs"
          >
            {stat.change}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {stat.description}
          </span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

const QuickActionCard = ({ action }: { action: typeof quickActions[0] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
  >
    <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-200 border-border/50 bg-card/50 backdrop-blur-sm group">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${action.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-200`}>
            <action.icon className="h-5 w-5" style={{ color: action.color.replace('bg-', '') }} />
          </div>
          <CardTitle className="text-lg">{action.title}</CardTitle>
        </div>
        <CardDescription className="text-sm">
          {action.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          Get Started
        </Button>
      </CardContent>
    </Card>
  </motion.div>
)

const ActivityItem = ({ activity }: { activity: typeof recentActivity[0] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-500"
      case "error": return "bg-red-500"
      case "warning": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0">
        {getStatusIcon(activity.status)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-none">
          {activity.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {activity.details} • {activity.time}
        </p>
      </div>
      <div className="flex-shrink-0">
        <div className={`w-2 h-2 ${getStatusColor(activity.status)} rounded-full animate-pulse`} />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight arc-gradient-text">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome to ARC Credit Engine Pro - Advanced AI-Powered Credit Risk Management System
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="arc-badge">
              <Zap className="h-3 w-3 mr-1" />
              ARC System Online
            </Badge>
            <Badge variant="outline">
              Last updated: Just now
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <QuickActionCard key={action.title} action={action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest predictions and system events
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All Activity
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ARC Model Performance
              </CardTitle>
              <CardDescription>
                Current ARC model accuracy and metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Overall Accuracy</span>
                  <span className="font-medium">94.2%</span>
                </div>
                <Progress value={94.2} className="mt-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Precision</span>
                  <span className="font-medium">91.8%</span>
                </div>
                <Progress value={91.8} className="mt-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Recall</span>
                  <span className="font-medium">89.5%</span>
                </div>
                <Progress value={89.5} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ARC System Health
              </CardTitle>
              <CardDescription>
                Current ARC system status and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response Time</span>
                <Badge variant="outline">120ms</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Status</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">2.4GB / 8GB</span>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span className="font-medium">45%</span>
                </div>
                <Progress value={45} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ARC Risk Assessment Widget */}
        <Card className="arc-card border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 arc-gradient-text">
              <Brain className="h-5 w-5" />
              ARC Real-Time Risk Assessment
            </CardTitle>
            <CardDescription>
              Live risk analysis and monitoring dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 arc-glow">
                <div className="text-2xl font-bold text-green-700">85%</div>
                <div className="text-sm text-green-600">Low Risk</div>
                <div className="text-xs text-green-500 mt-1">2,341 applications</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">12%</div>
                <div className="text-sm text-yellow-600">Medium Risk</div>
                <div className="text-xs text-yellow-500 mt-1">331 applications</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 arc-glow">
                <div className="text-2xl font-bold text-red-700">3%</div>
                <div className="text-sm text-red-600">High Risk</div>
                <div className="text-xs text-red-500 mt-1">83 applications</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}