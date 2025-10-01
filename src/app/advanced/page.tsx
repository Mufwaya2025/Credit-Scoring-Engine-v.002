"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  Mail, 
  Plug, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Key,
  Database,
  Globe,
  Bell,
  Lock,
  Server,
  Zap
} from "lucide-react"

export default function AdvancedFeaturesPage() {
  const [config, setConfig] = useState({
    // Security settings
    enableAuth: true,
    authMethod: "Basic Auth",
    enableAudit: true,
    retainLogs: "90 days",
    anonymizeData: true,
    gdprCompliance: true,
    
    // Notification settings
    enableNotifications: false,
    smtpServer: "",
    smtpPort: 587,
    emailUsername: "",
    emailPassword: "",
    notificationTypes: [] as string[],
    
    // API Integration
    enableCreditBureau: false,
    bureauProvider: "",
    apiKey: "",
    enableBankVerification: false,
    enableIncomeVerification: false,
    webhookUrl: "",
    webhookEvents: [] as string[],
    
    // System configuration
    confidenceThreshold: 0.5,
    riskTolerance: "Moderate",
    batchSize: 1000,
    maxConcurrentRequests: 10,
    cacheDuration: "6 hours",
    minCreditScore: 600,
    maxLoanAmount: 100000,
    minIncomeMultiple: 3.0
  })

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleNotificationTypeToggle = (type: string) => {
    setConfig(prev => ({
      ...prev,
      notificationTypes: prev.notificationTypes.includes(type)
        ? prev.notificationTypes.filter(t => t !== type)
        : [...prev.notificationTypes, type]
    }))
  }

  const handleWebhookEventToggle = (event: string) => {
    setConfig(prev => ({
      ...prev,
      webhookEvents: prev.webhookEvents.includes(event)
        ? prev.webhookEvents.filter(e => e !== event)
        : [...prev.webhookEvents, event]
    }))
  }

  const saveConfiguration = () => {
    // In a real app, this would save to the database
    console.log("Saving configuration:", config)
    alert("Configuration saved successfully!")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Settings</h1>
          <p className="text-muted-foreground">
            Configure security, notifications, API integrations, and system settings
          </p>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              API Integration
            </TabsTrigger>
            <TabsTrigger value="configuration" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure authentication and security measures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require users to authenticate before accessing the system
                    </p>
                  </div>
                  <Switch
                    checked={config.enableAuth}
                    onCheckedChange={(checked) => handleConfigChange("enableAuth", checked)}
                  />
                </div>

                {config.enableAuth && (
                  <div className="space-y-4">
                    <div>
                      <Label>Authentication Method</Label>
                      <Select 
                        value={config.authMethod}
                        onValueChange={(value) => handleConfigChange("authMethod", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic Auth">Basic Auth</SelectItem>
                          <SelectItem value="OAuth 2.0">OAuth 2.0</SelectItem>
                          <SelectItem value="LDAP">LDAP</SelectItem>
                          <SelectItem value="SSO">SSO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {config.authMethod === "Basic Auth" && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="admin-username">Admin Username</Label>
                          <Input
                            id="admin-username"
                            placeholder="admin"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin-password">Admin Password</Label>
                          <Input
                            id="admin-password"
                            type="password"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Audit & Compliance
                </CardTitle>
                <CardDescription>
                  Configure audit logging and compliance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all system activities for security and compliance
                    </p>
                  </div>
                  <Switch
                    checked={config.enableAudit}
                    onCheckedChange={(checked) => handleConfigChange("enableAudit", checked)}
                  />
                </div>

                <div>
                  <Label>Log Retention Period</Label>
                  <Select 
                    value={config.retainLogs}
                    onValueChange={(value) => handleConfigChange("retainLogs", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30 days">30 days</SelectItem>
                      <SelectItem value="90 days">90 days</SelectItem>
                      <SelectItem value="1 year">1 year</SelectItem>
                      <SelectItem value="Indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Data Privacy
                </CardTitle>
                <CardDescription>
                  Configure data privacy and protection settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anonymize Personal Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically anonymize sensitive personal information
                    </p>
                  </div>
                  <Switch
                    checked={config.anonymizeData}
                    onCheckedChange={(checked) => handleConfigChange("anonymizeData", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>GDPR Compliance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable GDPR-specific data handling and user rights
                    </p>
                  </div>
                  <Switch
                    checked={config.gdprCompliance}
                    onCheckedChange={(checked) => handleConfigChange("gdprCompliance", checked)}
                  />
                </div>

                {config.gdprCompliance && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      GDPR mode enabled: Personal data will be automatically anonymized after 30 days
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure email notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={config.enableNotifications}
                    onCheckedChange={(checked) => handleConfigChange("enableNotifications", checked)}
                  />
                </div>

                {config.enableNotifications && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-server">SMTP Server</Label>
                        <Input
                          id="smtp-server"
                          placeholder="smtp.gmail.com"
                          value={config.smtpServer}
                          onChange={(e) => handleConfigChange("smtpServer", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          value={config.smtpPort}
                          onChange={(e) => handleConfigChange("smtpPort", parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email-username">Email Username</Label>
                        <Input
                          id="email-username"
                          placeholder="your-email@gmail.com"
                          value={config.emailUsername}
                          onChange={(e) => handleConfigChange("emailUsername", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email-password">Email Password</Label>
                        <Input
                          id="email-password"
                          type="password"
                          placeholder="••••••••"
                          value={config.emailPassword}
                          onChange={(e) => handleConfigChange("emailPassword", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Notification Types</Label>
                      <div className="grid md:grid-cols-2 gap-3 mt-2">
                        {[
                          "High Risk Applications",
                          "System Alerts",
                          "Daily Reports",
                          "Model Performance Issues"
                        ].map(type => (
                          <label key={type} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.notificationTypes.includes(type)}
                              onChange={() => handleNotificationTypeToggle(type)}
                              className="rounded"
                            />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline">
                      Test Email Configuration
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  External Data Sources
                </CardTitle>
                <CardDescription>
                  Configure integrations with external data providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Credit Bureau Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Connect to credit bureaus for enhanced risk assessment
                    </p>
                  </div>
                  <Switch
                    checked={config.enableCreditBureau}
                    onCheckedChange={(checked) => handleConfigChange("enableCreditBureau", checked)}
                  />
                </div>

                {config.enableCreditBureau && (
                  <div className="space-y-4">
                    <div>
                      <Label>Credit Bureau Provider</Label>
                      <Select 
                        value={config.bureauProvider}
                        onValueChange={(value) => handleConfigChange("bureauProvider", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Experian">Experian</SelectItem>
                          <SelectItem value="Equifax">Equifax</SelectItem>
                          <SelectItem value="TransUnion">TransUnion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="api-key">API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="••••••••"
                        value={config.apiKey}
                        onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Bank Account Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Verify bank account information for loan applications
                    </p>
                  </div>
                  <Switch
                    checked={config.enableBankVerification}
                    onCheckedChange={(checked) => handleConfigChange("enableBankVerification", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Income Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Verify applicant income through external sources
                    </p>
                  </div>
                  <Switch
                    checked={config.enableIncomeVerification}
                    onCheckedChange={(checked) => handleConfigChange("enableIncomeVerification", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Configure webhooks for real-time event notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-app.com/webhook"
                    value={config.webhookUrl}
                    onChange={(e) => handleConfigChange("webhookUrl", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Webhook Events</Label>
                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    {[
                      "prediction_made",
                      "high_risk_detected",
                      "batch_processing_complete"
                    ].map(event => (
                      <label key={event} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.webhookEvents.includes(event)}
                          onChange={() => handleWebhookEventToggle(event)}
                          className="rounded"
                        />
                        <span className="text-sm font-mono text-xs">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button variant="outline">
                  Test Webhook
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Model Parameters
                </CardTitle>
                <CardDescription>
                  Configure AI model parameters and thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Confidence Threshold</Label>
                  <div className="mt-2">
                    <Slider
                      value={[config.confidenceThreshold]}
                      onValueChange={(value) => handleConfigChange("confidenceThreshold", value[0])}
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0.0</span>
                      <span className="font-medium">{config.confidenceThreshold.toFixed(2)}</span>
                      <span>1.0</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Risk Tolerance</Label>
                  <Select 
                    value={config.riskTolerance}
                    onValueChange={(value) => handleConfigChange("riskTolerance", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conservative">Conservative</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Settings
                </CardTitle>
                <CardDescription>
                  Configure system performance and processing settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="batch-size">Batch Processing Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={config.batchSize}
                    onChange={(e) => handleConfigChange("batchSize", parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="max-requests">Max Concurrent Requests</Label>
                  <Input
                    id="max-requests"
                    type="number"
                    value={config.maxConcurrentRequests}
                    onChange={(e) => handleConfigChange("maxConcurrentRequests", parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Cache Duration</Label>
                  <Select 
                    value={config.cacheDuration}
                    onValueChange={(value) => handleConfigChange("cacheDuration", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="6 hours">6 hours</SelectItem>
                      <SelectItem value="24 hours">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Business Rules
                </CardTitle>
                <CardDescription>
                  Configure business rules and lending criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="min-score">Minimum Credit Score for Approval</Label>
                  <Input
                    id="min-score"
                    type="number"
                    value={config.minCreditScore}
                    onChange={(e) => handleConfigChange("minCreditScore", parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="max-loan">Maximum Loan Amount ($)</Label>
                  <Input
                    id="max-loan"
                    type="number"
                    value={config.maxLoanAmount}
                    onChange={(e) => handleConfigChange("maxLoanAmount", parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="income-multiple">Minimum Income Multiple</Label>
                  <Input
                    id="income-multiple"
                    type="number"
                    step="0.1"
                    value={config.minIncomeMultiple}
                    onChange={(e) => handleConfigChange("minIncomeMultiple", parseFloat(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveConfiguration}>
                Save Configuration
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}