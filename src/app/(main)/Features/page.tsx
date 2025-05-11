// app/features/page.tsx

import React from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold font-serif text-center mb-12">
          Explore the Powerful Features of Our CRM Platform
        </h1>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-2xl p-6 shadow-md bg-card border border-border hover:shadow-lg transition-all duration-300"
              )}
            >
              <CheckCircle className="text-green-500 w-6 h-6 mb-3" />
              <h2 className="text-xl font-semibold font-sans mb-2">
                {feature.title}
              </h2>
              <p className="text-sm leading-relaxed font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-semibold mb-4 font-serif">Built for Modern Teams &amp; Growing Businesses</h2>
          <p className="text-md font-light max-w-4xl mx-auto">
            Our CRM is an all-in-one platform built to simplify team collaboration, increase productivity, and maximize customer satisfaction. With robust features tailored for dynamic teams and enterprises, you can automate complex workflows, track every customer interaction, build internal tools with our visual builder, and scale your operations effortlessly. Whether you&apos;re a startup or an enterprise, our CRM evolves with your needs.
          </p>
          <p className="text-md font-light max-w-4xl mx-auto mt-4">
            Whether it&apos;s managing thousands of leads from multi-channel campaigns or optimizing team output through detailed analytics, every feature in our CRM is built with scale, security, and performance in mind. With extensive integrations, customizable modules, and intelligent automation, our platform empowers your team to stay ahead of the competition. Gain 360&deg; visibility, optimize revenue, and drive growth like never before.
          </p>
          <p className="text-md font-light max-w-4xl mx-auto mt-4">
            Empower every team — sales, marketing, HR, support, and finance — with purpose-built tools designed for synergy. Dive deep into lead journeys, set up task dependencies, visualize data with intuitive dashboards, or draft proposals collaboratively. Your CRM is no longer just a database; it&apos;s your competitive edge, built to adapt and grow with your vision.
          </p>
        </div>
      </div>
    </div>
  );
}

// You don't need to escape apostrophes here (inside JS objects)
const features = [
  {
    title: "Team Building",
    description:
      "Create, manage, and scale cross-functional teams with role-based access, collaboration tools, and dynamic team hierarchies for maximum productivity. Enable cross-department collaboration, define team KPIs, and align goals across all units seamlessly.",
  },
  {
    title: "Video Conferencing",
    description:
      "Seamlessly connect with clients and teammates via secure, built-in video conferencing tools that support screen sharing, recordings, and live chat. Schedule meetings, send invites, and integrate with your calendar for a unified experience.",
  },
  {
    title: "Contact Management",
    description:
      "Maintain a centralized database of all contacts with detailed activity logs, smart tagging, and quick filters for faster access and segmentation. Build strong relationships through insightful customer history and enriched contact views.",
  },
  {
    title: "Employee Management",
    description:
      "Onboard, manage, and monitor employees with attendance tracking, roles, project assignments, performance reviews, and custom HR workflows. Empower your HR team with tools for leave tracking, appraisal cycles, and compliance.",
  },
  {
    title: "Project Management",
    description:
      "Track progress, assign tasks, and collaborate across departments. Gantt charts, Kanban boards, and milestone tracking help keep projects on time. Collaborate in real-time and manage risks efficiently with resource planning tools.",
  },
  {
    title: "Builder",
    description:
      "Create custom tools, dashboards, and mini-apps with our no-code builder. Drag and drop components to visually configure your CRM experience. Extend platform capabilities with reusable components and logic-based actions.",
  },
  {
    title: "Workflows",
    description:
      "Automate repetitive tasks with smart workflows. Use triggers and conditions to move leads, send emails, or update records automatically. Build multi-step flows with delay nodes, conditionals, and webhooks for full flexibility.",
  },
  {
    title: "Billing & Invoicing",
    description:
      "Create and manage invoices, process payments, and generate financial reports. Integrates with Stripe, Razorpay, and other gateways. Track payments, issue refunds, and automate reminders to streamline your revenue collection.",
  },
  {
    title: "Company Accounts",
    description:
      "Handle multi-level company accounts, assign multiple users per company, and track activity logs, communications, and documents per account. Enable relationship mapping and custom roles for complex account structures.",
  },
  {
    title: "Notifications",
    description:
      "Real-time notifications for every team interaction. Customizable alerts ensure you never miss important updates, tasks, or deadlines. Enable web, email, and in-app channels for complete visibility across actions.",
  },
  {
    title: "Notes & Collaboration",
    description:
      "Take rich-text notes, add attachments, tag teammates, and collaborate directly within CRM records to streamline communication and context. Share meeting summaries, customer conversations, and action plans seamlessly.",
  },
  {
    title: "Lead Management",
    description:
      "Track, score, and prioritize leads from multiple sources like forms, LinkedIn, and email campaigns. Automate assignments and follow-ups for maximum conversion. Build intelligent lead pipelines with AI suggestions and ROI insights."
  }
];
