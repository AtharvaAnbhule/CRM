'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { Sun, Moon, ArrowRight, ChevronLeft, BookOpen, Zap, LayoutDashboard, Users, FileText, CreditCard, Settings, Globe, Shield, BarChart2, Mail, Calendar, FileStack, Bell, MessageSquare, Database, Code, GitBranch, Cloud, Terminal } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AboutPage() {
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const [activeDoc, setActiveDoc] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 py-12 md:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header & Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/")} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
              About Our CRM Platform
            </h1>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveDoc('getting-started')}
              className="flex-1 sm:flex-none"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-3"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Documentation Modal */}
        {activeDoc && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">
                    {docs.find(d => d.id === activeDoc)?.title}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveDoc(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 prose dark:prose-invert">
                {activeDoc === 'getting-started' && (
                  <>
                    <h4>Initial Setup</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Sign up for an account at our registration page</li>
                      <li>Verify your email address</li>
                      <li>Complete your company profile including address, industry, and company size</li>
                      <li>Configure your default currency, timezone, and date formats</li>
                      <li>Invite team members with appropriate role assignments</li>
                      <li>Connect your email and calendar services (Gmail, Outlook, etc.)</li>
                      <li>Import existing customer data using our CSV templates</li>
                    </ol>

                    <h4 className="mt-6">Dashboard Overview</h4>
                    <p>The main dashboard provides quick access to all critical business functions:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Recent activities and notifications</li>
                      <li>Upcoming tasks and calendar events</li>
                      <li>Sales pipeline visualization</li>
                      <li>Performance metrics and KPIs</li>
                      <li>Quick navigation to all major sections</li>
                      <li>Customizable widgets that can be rearranged</li>
                    </ul>

                    <h4 className="mt-6">Customizing Your Workspace</h4>
                    <p>Personalize your experience to match your workflow:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Drag-and-drop interface for widget arrangement</li>
                      <li>Choose which metrics and charts to display</li>
                      <li>Select from light or dark theme options</li>
                      <li>Create custom dashboard views for different roles</li>
                      <li>Set default filters for data views</li>
                    </ul>
                  </>
                )}

                {activeDoc === 'automation' && (
                  <>
                    <h4>Automation Basics</h4>
                    <p>Our automation system allows you to create sophisticated workflows that trigger actions based on specific conditions, saving you countless hours of manual work.</p>

                    <h4 className="mt-6">Common Automation Examples</h4>
                    <div className="grid gap-4 mt-4">
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium">Lead Follow-up Sequence</h5>
                        <p>When a new lead is added from your website form, automatically send a welcome email, add them to your newsletter list, create a follow-up task for your sales team in 3 days, and notify the account manager.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium">Project Completion Workflow</h5>
                        <p>When a project is marked as complete, automatically generate an invoice, send a customer satisfaction survey, archive project files, and notify the accounting department.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium">Task Reminders</h5>
                        <p>Send reminder emails 24 hours before a task deadline if its not marked as complete, escalating to the manager if still incomplete after 48 hours.</p>
                      </div>
                    </div>

                    <h4 className="mt-6">Creating Your First Automation</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Navigate to Automation → Create New Workflow</li>
                      <li>Select your trigger (e.g., &quot;New contact added&quot;, &quot;Deal stage changed&quot;)</li>
                      <li>Set conditions to filter which items should trigger (e.g., &quot;Only if contact is from USA&quot;)</li>
                      <li>Add one or more actions (e.g., &quot;Send email&quot;, &quot;Create task&quot;, &quot;Update record&quot;)</li>
                      <li>Configure delays between steps if needed</li>
                      <li>Test your workflow with sample data</li>
                      <li>Save and activate the automation</li>
                    </ol>
                  </>
                )}

                {activeDoc === 'builder' && (
                  <>
                    <h4>Builder Interface Overview</h4>
                    <p>The visual builder consists of three main areas that give you complete control over your custom pages and dashboards:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li><strong>Component palette (left sidebar):</strong> Contains all available building blocks organized by category (forms, displays, charts, etc.)</li>
                      <li><strong>Canvas (center area):</strong> Where you drag components to build your interface with real-time preview</li>
                      <li><strong>Properties panel (right sidebar):</strong> Configure each component&apos;s settings, styling, and data bindings</li>
                    </ol>

                    <h4 className="mt-6">Creating a Custom Page</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Click &quot;New Page&quot; in the builder dashboard</li>
                      <li>Select from starter templates or begin with a blank canvas</li>
                      <li>Drag components from the palette to your desired locations</li>
                      <li>Configure each component&apos;s properties and data sources</li>
                      <li>Set responsive breakpoints for different device sizes</li>
                      <li>Define page-level settings including:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>SEO metadata</li>
                          <li>User permissions</li>
                          <li>Navigation placement</li>
                          <li>Custom URL slug</li>
                        </ul>
                      </li>
                      <li>Save and publish your page</li>
                    </ol>

                    <h4 className="mt-6">Available Components</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {[
                        { name: 'Form', desc: 'Create data entry forms with validation' },
                        { name: 'Data Table', desc: 'Display and filter records' },
                        { name: 'Chart', desc: 'Visualize data with multiple chart types' },
                        { name: 'Rich Text', desc: 'Formatted content with Markdown' },
                        { name: 'Image', desc: 'Upload or link to images' },
                        { name: 'Button', desc: 'Trigger actions or navigation' },
                        { name: 'Divider', desc: 'Visual separation' },
                        { name: 'HTML', desc: 'Custom code injection' },
                        { name: 'Kanban', desc: 'Drag-and-drop task boards' },
                        { name: 'Calendar', desc: 'Event and task scheduling' },
                        { name: 'Progress', desc: 'Track completion metrics' },
                        { name: 'Map', desc: 'Geographic data visualization' },
                      ].map(component => (
                        <div key={component.name} className="p-3 border rounded-lg text-sm">
                          <div className="font-medium">{component.name}</div>
                          <div className="text-muted-foreground text-xs mt-1">{component.desc}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hero Section */}
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                Next-Generation CRM Platform
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              An all-in-one solution that unites your workflow, team collaboration, sales pipelines, and customer relationships in one smart, scalable system designed to grow with your business.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-violet-600 hover:bg-violet-700">
                Request Demo
              </Button>
              <Button variant="outline" onClick={() => setActiveDoc('getting-started')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Quick Start Guide
              </Button>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Sales
              </Button>
            </div>
          </div>
          <div className="relative aspect-video bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/20 rounded-xl overflow-hidden border">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="grid grid-cols-3 gap-2 w-full h-full">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={`rounded ${i % 2 === 0 ? 'bg-violet-500/20' : 'bg-blue-500/20'} animate-pulse`} 
                    style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                Comprehensive Features
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage customer relationships, team collaboration, and business growth - all in one powerful platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-all duration-300 border hover:border-violet-300 dark:hover:border-violet-500/50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg mr-4 bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  {feature.subFeatures && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">Includes:</h4>
                      <ul className="space-y-1 text-sm">
                        {feature.subFeatures.map((sub, i) => (
                          <li key={i} className="flex items-center">
                            <span className="text-violet-500 mr-2">•</span>
                            {sub}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="bg-muted/50 rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                Built With Modern Technology
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform leverages cutting-edge technologies to deliver performance, security, and scalability.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {technologies.map((tech) => (
              <div key={tech.name} className="flex flex-col items-center">
                <div className="p-4 rounded-lg bg-background mb-3">
                  {tech.icon}
                </div>
                <span className="text-sm font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Embedded Documentation Section */}
        <section className="rounded-xl p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                Documentation Center
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn how to get the most out of our platform with these detailed guides and resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {docs.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg mr-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300">
                      {doc.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{doc.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                  <Button
                    variant="link"
                    className="text-violet-600 dark:text-violet-400 p-0 h-auto"
                    onClick={() => setActiveDoc(doc.id)}
                  >
                    Read Guide <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Security & Compliance Section */}
        <section className="bg-muted/50 rounded-xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Enterprise-Grade Security
                </span>
              </h2>
              <p className="text-muted-foreground mb-6">
                We take security seriously with multiple layers of protection for your data and compliance with industry standards.
              </p>
              <div className="space-y-4">
                {securityFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <div className="p-1.5 rounded-full bg-violet-100 dark:bg-violet-900/50 mr-3 mt-0.5">
                      <Shield className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background p-6 rounded-lg border">
              <h3 className="font-bold mb-4">Compliance Certifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {compliance.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                Trusted by Businesses Worldwide
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of companies that have transformed their customer relationships with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="relative overflow-hidden">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/10"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center mb-4">
                    <div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center mr-3">
                      <span className="font-medium text-sm">{testimonial.initials}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.title}, {testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-sm">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} filled={i < testimonial.rating} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="max-w-2xl mx-auto mb-6 text-violet-100">
            Join thousands of businesses that trust our platform to manage their customer relationships and drive growth.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" className="bg-white text-violet-600 hover:bg-white/90">
              Start Free Trial
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Schedule Demo
            </Button>
          </div>
        </section>

      </div>
    </div>
  )
}

const Star = ({ filled }: { filled: boolean }) => (
  <svg
    className={`h-4 w-4 ${filled ? 'text-yellow-400' : 'text-muted-foreground'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const features = [
  { 
    title: "Workflow Automation", 
    description: "Automate repetitive tasks and processes to save time and reduce errors across your organization with our visual workflow builder.",
    icon: <Zap className="h-5 w-5" />,
    subFeatures: [
      "Visual workflow builder with drag-and-drop interface",
      "Conditional logic and branching",
      "Multi-step automations with delays",
      "Scheduled and triggered actions",
      "Integration with third-party apps"
    ]
  },
  { 
    title: "Dashboard Analytics", 
    description: "Real-time insights and customizable reports to track performance and identify opportunities with beautiful visualizations.",
    icon: <LayoutDashboard className="h-5 w-5" />,
    subFeatures: [
      "Custom report builder with 20+ chart types",
      "Real-time data refreshes",
      "Export to PDF/Excel/CSV",
      "Team performance metrics",
      "Scheduled report delivery"
    ]
  },
  { 
    title: "Contacts Management", 
    description: "Centralized customer database with advanced segmentation and communication tools for better relationship management.",
    icon: <Users className="h-5 w-5" />,
    subFeatures: [
      "Unified 360° customer profiles",
      "Advanced tagging & segmentation",
      "Complete interaction history",
      "Bulk actions and imports",
      "Duplicate detection and merging"
    ]
  },
  { 
    title: "Document Generation", 
    description: "Create professional proposals, contracts, and reports with our template system and electronic signature capabilities.",
    icon: <FileText className="h-5 w-5" />,
    subFeatures: [
      "Template library with 50+ templates",
      "Custom branding and styling",
      "Electronic signatures (eSign)",
      "Version control and history",
      "PDF generation and sharing"
    ]
  },
  { 
    title: "Billing & Payments", 
    description: "Integrated payment processing with invoicing and revenue tracking for seamless financial operations.",
    icon: <CreditCard className="h-5 w-5" />,
    subFeatures: [
      "Recurring billing and subscriptions",
      "Multiple payment methods",
      "Automated tax calculations",
      "Revenue recognition",
      "Financial reporting"
    ]
  },
  { 
    title: "Admin & Settings", 
    description: "Complete control over your workspace configuration and user permissions with enterprise-grade security.",
    icon: <Settings className="h-5 w-5" />,
    subFeatures: [
      "Role-based access control",
      "Detailed audit logs",
      "Data export and backup",
      "API management",
      "Single sign-on (SSO)"
    ]
  },
  { 
    title: "Mobile Access", 
    description: "Full-featured mobile apps for iOS and Android to manage your business on the go.",
    icon: <Globe className="h-5 w-5" />,
    subFeatures: [
      "Offline access to critical data",
      "Mobile-optimized forms",
      "Barcode scanning",
      "Location-based features",
      "Push notifications"
    ]
  },
  { 
    title: "Email & Calendar", 
    description: "Integrated email and calendar system that works with your existing providers.",
    icon: <Mail className="h-5 w-5" />,
    subFeatures: [
      "Unified inbox",
      "Email templates",
      "Shared calendars",
      "Meeting scheduling",
      "Activity tracking"
    ]
  },
  { 
    title: "API & Integrations", 
    description: "Powerful API and pre-built integrations with popular business tools.",
    icon: <Code className="h-5 w-5" />,
    subFeatures: [
      "REST API with documentation",
      "Zapier integration",
      "Webhooks support",
      "Pre-built app connectors",
      "Custom integration support"
    ]
  }
]

const docs = [
  { 
    id: 'getting-started',
    title: "Getting Started Guide", 
    description: "Step-by-step instructions to set up your account and configure basic settings for your organization.", 
    icon: <BookOpen className="h-5 w-5" />
  },
  { 
    id: 'automation',
    title: "Automation Guide", 
    description: "Learn how to create powerful automations to streamline your workflow and save time.", 
    icon: <Zap className="h-5 w-5" />
  },
  { 
    id: 'builder',
    title: "Builder Manual", 
    description: "Master our drag-and-drop builder to create custom layouts, dashboards, and components.", 
    icon: <LayoutDashboard className="h-5 w-5" />
  }
]

const technologies = [
  { name: "Next.js", icon: <Terminal className="h-6 w-6" /> },
  { name: "React", icon: <Code className="h-6 w-6" /> },
  { name: "TypeScript", icon: <FileText className="h-6 w-6" /> },
  { name: "Tailwind CSS", icon: <LayoutDashboard className="h-6 w-6" /> },
  { name: "Node.js", icon: <GitBranch className="h-6 w-6" /> },
  { name: "PostgreSQL", icon: <Database className="h-6 w-6" /> },
  { name: "AWS", icon: <Cloud className="h-6 w-6" /> },
  { name: "Docker", icon: <Globe className="h-6 w-6" /> },
  { name: "Kubernetes", icon: <Settings className="h-6 w-6" /> },
  { name: "GraphQL", icon: <BarChart2 className="h-6 w-6" /> }
]

const securityFeatures = [
  {
    title: "Data Encryption",
    description: "All data encrypted in transit and at rest with AES-256 encryption"
  },
  {
    title: "Regular Audits",
    description: "Third-party security audits conducted biannually"
  },
  {
    title: "Role-Based Access",
    description: "Granular permissions control for all users and data"
  },
  {
    title: "Compliance",
    description: "Regularly updated to meet industry compliance standards"
  },
  {
    title: "Backups",
    description: "Automated daily backups with 30-day retention"
  }
]

const compliance = [
  { name: "GDPR", status: "Compliant", icon: <Shield className="h-5 w-5" /> },
  { name: "SOC 2", status: "Certified", icon: <Shield className="h-5 w-5" /> },
  { name: "HIPAA", status: "Ready", icon: <Shield className="h-5 w-5" /> },
  { name: "CCPA", status: "Compliant", icon: <Shield className="h-5 w-5" /> }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    initials: "SJ",
    title: "Sales Director",
    company: "Acme Corp",
    quote: "This CRM has transformed how we manage customer relationships. Our team productivity has increased by 40% since implementation.",
    rating: 5
  },
  {
    name: "Michael Chen",
    initials: "MC",
    title: "CEO",
    company: "TechStart",
    quote: "The automation features alone have saved us hundreds of hours each quarter. Highly recommend for growing businesses.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    initials: "ER",
    title: "Marketing Manager",
    company: "BrandVision",
    quote: "Finally a CRM that actually gets adopted by our team because it&apos;s so intuitive and well-designed.",
    rating: 4
  }
]