'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const { setTheme, theme } = useTheme()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header & Theme Toggle with Back Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              ← Back
            </Button>
            <h1 className="text-4xl font-bold text-violet-600 dark:text-violet-400">About Our CRM</h1>
          </div>
          <Button variant="outline" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Hero Intro */}
        <section>
          <p className="text-lg text-muted-foreground mb-4">
            We’re building the next-generation CRM platform—an all-in-one solution that unites your workflow, team collaboration, sales pipelines, and customer relationships in one smart, scalable system.
          </p>
          <p className="text-base leading-relaxed">
            Designed for modern teams and fast-paced businesses, our CRM includes visual builders, automation, content tools, project management, and full billing integration. Built to grow with you, no matter your size.
          </p>
        </section>

        <Separator />

        {/* Features Section */}
        <section>
          <h2 className="text-3xl font-semibold text-violet-500 dark:text-violet-300 mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-violet-200 dark:border-violet-900 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <h3 className="text-xl font-semibold text-violet-700 dark:text-violet-300 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <h2 className="text-3xl font-semibold mb-4 text-violet-500 dark:text-violet-300">Why Choose Us?</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>⚡ Lightning-fast performance and real-time syncing</li>
            <li>📊 Comprehensive analytics & tracking dashboards</li>
            <li>🧠 Built-in AI tools for smart suggestions & content</li>
            <li>🔒 Role-based permissions with enterprise-grade security</li>
            <li>⚙️ Full customization with visual builders & workflow designers</li>
          </ul>
        </section>

        <Separator />

        {/* Mission & Vision */}
        <section>
          <h2 className="text-3xl font-semibold text-violet-500 dark:text-violet-300 mb-4">Our Mission & Vision</h2>
          <p className="mb-4 text-muted-foreground">
            <strong>Mission:</strong> To simplify and supercharge how businesses manage relationships, teams, and growth—from the inside out.
          </p>
          <p className="text-muted-foreground">
            <strong>Vision:</strong> To become the most intuitive, all-encompassing CRM platform that empowers every team to do their best work.
          </p>
        </section>

        {/* Core Values */}
        <section>
          <h2 className="text-3xl font-semibold text-violet-500 dark:text-violet-300 mb-4">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="border-muted">
                <CardContent className="p-5 text-center">
                  <h3 className="text-lg font-bold mb-2 text-violet-700 dark:text-violet-300">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Documentation Section */}
        <section>
          <h2 className="text-3xl font-semibold text-violet-500 dark:text-violet-300 mb-6">Documentation & Getting Started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((doc) => (
              <Card key={doc.title} className="hover:shadow-md transition-shadow border-muted">
                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-violet-700 dark:text-violet-300 mb-2">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                  <Button
                    variant="link"
                    className="text-violet-600 dark:text-violet-400 p-0"
                    onClick={() => window.open(doc.link, "_blank")}
                  >
                    View Guide →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-3xl font-semibold text-violet-500 dark:text-violet-300 mb-6">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-muted/30">
                <CardContent className="p-5">
                  <p className="italic text-sm mb-2">“{t.feedback}”</p>
                  <p className="text-sm font-semibold text-violet-600 dark:text-violet-300">— {t.name}, {t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-semibold text-violet-500 dark:text-violet-300 mb-6">Meet Our Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="mx-auto rounded-full border-2 border-violet-400"
                />
                <p className="mt-2 font-semibold">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-20">
          <h2 className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-4">Ready to Experience the Future of CRM?</h2>
          <p className="text-muted-foreground mb-6">Join hundreds of teams already growing with our platform.</p>
          <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white">Get Started Now</Button>
        </section>
      </div>
    </div>
  )
}

const features = [
  { title: "Workflow Automation", description: "Automate tasks, emails, and processes to save time and reduce errors." },
  { title: "Visual Builder", description: "Build custom components, emails, and pages with a drag-and-drop UI." },
  { title: "Contacts Management", description: "Tag, segment, and communicate with leads and customers in one place." },
  { title: "Team Collaboration", description: "Assign roles, tasks, and responsibilities to teams and individuals." },
  { title: "Employee Management", description: "Track employee details, attendance, and performance with ease." },
  { title: "Project Management", description: "Plan, track, and deliver projects efficiently with task views and calendars." },
  { title: "Content Writing", description: "Integrated AI tools help you write blogs, emails, and campaigns faster." },
  { title: "Billing & Invoicing", description: "Manage payments, generate invoices, and track transactions." },
  { title: "Account & Access Control", description: "Secure and control access using granular role management." },
  { title: "Task Board", description: "Kanban-style task boards with due dates, tags, and priorities." },
]

const values = [
  { title: "Transparency", description: "We are open with our customers and our team. No secrets." },
  { title: "Innovation", description: "We challenge norms and build solutions that push the industry forward." },
  { title: "Customer First", description: "Every feature and update begins with listening to your feedback." },
]

const docs = [
  { title: "Getting Started", description: "How to set up your CRM account, connect your team, and go live in minutes.", link: "https://your-crm.com/docs/getting-started" },
  { title: "Automation Guide", description: "Learn how to automate tasks, emails, and workflows without writing code.", link: "https://your-crm.com/docs/automation" },
  { title: "Builder Manual", description: "Master our drag-and-drop builder to create custom layouts, content, and logic.", link: "https://your-crm.com/docs/builder" },
]

const testimonials = [
  { name: "Aarti Sharma", role: "Marketing Lead", feedback: "The builder and automation saved my team hours every week!" },
  { name: "Rahul Verma", role: "Product Manager", feedback: "Our team collaboration has never been smoother." },
  { name: "Neha Gupta", role: "Founder, SaaSify", feedback: "Finally, a CRM that feels modern and helps me grow." },
  { name: "Jayesh Patil", role: "CTO", feedback: "Robust, fast, and flexible—just what we needed." },
]

const team = [
  { name: "Atarva Anbhule", role: "Founder & CEO", avatar: "/team1.jpg" },

]
 