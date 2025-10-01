"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Info, Github, ExternalLink, Brain, Target, Shield, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Credit Scoring Engine</h1>
          <p className="text-muted-foreground">
            Learn about our advanced credit scoring platform and its capabilities
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our Credit Scoring Engine leverages advanced machine learning algorithms and configurable business rules to provide accurate, fair, and transparent credit decisions. We empower financial institutions with the tools they need to make data-driven lending decisions while maintaining regulatory compliance and customer trust.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To become the leading provider of intelligent credit scoring solutions, democratizing access to fair credit assessment through innovative technology, configurable systems, and continuous improvement driven by data and feedback.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>
                Comprehensive credit scoring and risk assessment platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced machine learning models for accurate predictions
                  </p>
                </div>
                <div className="text-center p-4">
                  <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold">Configurable</h3>
                  <p className="text-sm text-muted-foreground">
                    Flexible rules and scoring that adapt to your business needs
                  </p>
                </div>
                <div className="text-center p-4">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold">Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security and compliance with regulations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Intelligent Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Machine learning-powered credit scoring</li>
                  <li>• Real-time risk assessment</li>
                  <li>• Configurable scoring factors and weights</li>
                  <li>• Explainable AI decisions</li>
                  <li>• Continuous model improvement</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Business Rules Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Dynamic rule configuration</li>
                  <li>• Conditional logic builder</li>
                  <li>• Real-time rule execution</li>
                  <li>• Rule performance analytics</li>
                  <li>• A/B testing capabilities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Applicant Fields
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Configurable applicant information fields</li>
                  <li>• Dynamic form generation</li>
                  <li>• Validation and data quality checks</li>
                  <li>• Multi-field scoring integration</li>
                  <li>• Flexible data collection</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Analytics & Reporting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Comprehensive analytics dashboard</li>
                  <li>• Real-time performance monitoring</li>
                  <li>• Trend analysis and forecasting</li>
                  <li>• Custom report generation</li>
                  <li>• API and integration support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
              <CardDescription>
                Built with modern, scalable technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="font-semibold mb-3">Frontend</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Next.js 15</Badge>
                      <span className="text-sm">React framework</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">TypeScript</Badge>
                      <span className="text-sm">Type safety</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Tailwind CSS</Badge>
                      <span className="text-sm">Styling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">shadcn/ui</Badge>
                      <span className="text-sm">UI components</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Backend</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Node.js</Badge>
                      <span className="text-sm">Runtime</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Prisma</Badge>
                      <span className="text-sm">Database ORM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">SQLite</Badge>
                      <span className="text-sm">Database</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Zod</Badge>
                      <span className="text-sm">Validation</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Machine Learning</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Python</Badge>
                      <span className="text-sm">ML backend</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">scikit-learn</Badge>
                      <span className="text-sm">ML algorithms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">TensorFlow</Badge>
                      <span className="text-sm">Deep learning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Pandas</Badge>
                      <span className="text-sm">Data processing</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Architecture</CardTitle>
              <CardDescription>
                Scalable and resilient system design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Microservices architecture</li>
                    <li>• RESTful API design</li>
                    <li>• Real-time processing</li>
                    <li>• Horizontal scalability</li>
                    <li>• Fault tolerance</li>
                    <li>• Data encryption</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Integration Capabilities</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• REST API</li>
                    <li>• Webhook support</li>
                    <li>• CSV/JSON import/export</li>
                    <li>• Third-party integrations</li>
                    <li>• Custom plugin system</li>
                    <li>• SDK availability</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Development Team</CardTitle>
              <CardDescription>
                Built with passion and expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-3">Core Contributors</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Lead Developer</p>
                      <p className="text-sm text-muted-foreground">
                        Full-stack development and system architecture
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">ML Engineer</p>
                      <p className="text-sm text-muted-foreground">
                        Machine learning model development and optimization
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">UI/UX Designer</p>
                      <p className="text-sm text-muted-foreground">
                        User interface design and experience optimization
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Special Thanks</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Open Source Community</p>
                      <p className="text-sm text-muted-foreground">
                        For the incredible libraries and tools that power this platform
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Beta Testers</p>
                      <p className="text-sm text-muted-foreground">
                        For valuable feedback and bug reports during development
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Domain Experts</p>
                      <p className="text-sm text-muted-foreground">
                        For providing industry insights and validation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Get Involved</CardTitle>
              <CardDescription>
                Contribute to the project or get in touch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button>
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Button>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Documentation
                </Button>
                <Button variant="outline">
                  Report Issues
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                This project is open source and welcomes contributions from the community. 
                Whether you're reporting bugs, suggesting features, or submitting pull requests, 
                we appreciate your involvement in making this platform better.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </MainLayout>
  )
}