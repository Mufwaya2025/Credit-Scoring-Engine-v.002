"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Users, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react"

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  activeSessions: number
  dailyPredictions: number
}

interface PerformanceData {
  hour: number
  predictions: number
  responseTime: number
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    activeSessions: 234,
    dailyPredictions: 1245
  })
  
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])

  // Generate sample performance data
  const generatePerformanceData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return hours.map(hour => ({
      hour,
      predictions: Math.floor(Math.random() * 100) + 20,
      responseTime: Math.floor(Math.random() * 150) + 50
    }))
  }

  // Simulate real-time updates
  const updateMetrics = () => {
    setMetrics(prev => ({
      cpuUsage: Math.max(10, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 10)),
      memoryUsage: Math.max(20, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 8)),
      activeSessions: Math.max(100, prev.activeSessions + Math.floor((Math.random() - 0.5) * 20)),
      dailyPredictions: prev.dailyPredictions + Math.floor(Math.random() * 5)
    }))
    
    // Generate alerts based on metrics
    const newAlerts: string[] = []
    if (metrics.cpuUsage > 80) {
      newAlerts.push("High CPU Usage")
    }
    if (metrics.memoryUsage > 85) {
      newAlerts.push("High Memory Usage")
    }
    if (performanceData.length > 0 && 
        performanceData.reduce((sum, data) => sum + data.responseTime, 0) / performanceData.length > 200) {
      newAlerts.push("Slow Response Times")
    }
    
    setAlerts(newAlerts)
  }

  useEffect(() => {
    setPerformanceData(generatePerformanceData())
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        updateMetrics()
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusColor = (value: number, threshold: number) => {
    if (value > threshold * 1.2) return "text-red-600"
    if (value > threshold) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusBadge = (value: number, threshold: number) => {
    if (value > threshold * 1.2) return <Badge variant="destructive">Critical</Badge>
    if (value > threshold) return <Badge variant="secondary">Warning</Badge>
    return <Badge variant="default">Normal</Badge>
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time monitoring of system performance and health
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Auto Refresh {autoRefresh ? "(30s)" : ""}
            </Button>
            <Button onClick={updateMetrics}>
              <Activity className="mr-2 h-4 w-4" />
              Refresh Now
            </Button>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.cpuUsage.toFixed(1)}%</div>
              <Progress value={metrics.cpuUsage} className="mt-2" />
              <div className="mt-2">
                {getStatusBadge(metrics.cpuUsage, 70)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}%</div>
              <Progress value={metrics.memoryUsage} className="mt-2" />
              <div className="mt-2">
                {getStatusBadge(metrics.memoryUsage, 80)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                Concurrent users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Predictions Today</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.dailyPredictions}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(metrics.dailyPredictions * 0.15)} from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Predictions per Hour</CardTitle>
              <CardDescription>
                Number of credit score predictions processed each hour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {performanceData.slice(-12).map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{data.hour}:00</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(data.predictions / 120) * 100} 
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground w-8">
                        {data.predictions}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Average Response Time</CardTitle>
              <CardDescription>
                Average API response time in milliseconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {performanceData.slice(-12).map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{data.hour}:00</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(data.responseTime / 300) * 100} 
                        className="w-20"
                      />
                      <span className={`text-sm w-12 ${getStatusColor(data.responseTime, 150)}`}>
                        {data.responseTime}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Real-time system alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {alert === "High CPU Usage" && `High CPU Usage: CPU usage at ${metrics.cpuUsage.toFixed(1)}%`}
                      {alert === "High Memory Usage" && `High Memory Usage: Memory usage at ${metrics.memoryUsage.toFixed(1)}%`}
                      {alert === "Slow Response Times" && `Slow Response Times: Average response time exceeding 200ms`}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ All systems operating normally
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* System Health Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Incident</span>
                  <span className="text-sm">2 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Database Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Query Time</span>
                  <span className="text-sm">12ms avg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Connections</span>
                  <span className="text-sm">5/20</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Version</span>
                  <span className="text-sm">v1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Accuracy</span>
                  <span className="text-sm">87.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}