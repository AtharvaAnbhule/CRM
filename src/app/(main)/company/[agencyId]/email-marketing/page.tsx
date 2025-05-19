"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Lead {
  id: string;
  name: string;
  email: string;
  category: string;
  lastContacted?: string;
  status?: "new" | "contacted" | "converted" | "unresponsive";
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const categories = [
  "Real Estate", "Finance", "Technology", "Healthcare", "Marketing", "Software",
  "Education", "Automotive", "E-commerce", "Retail", "Manufacturing", "Logistics",
  "Construction", "Entertainment", "Hospitality", "Travel & Tourism", "Legal Services",
  "Insurance", "Telecommunications", "Agriculture", "Food & Beverage", "Renewable Energy",
  "Biotechnology", "Pharmaceuticals", "Cybersecurity", "Artificial Intelligence",
  "Blockchain", "Gaming", "Aerospace", "Fashion", "Media & Journalism", "Music & Arts",
  "Human Resources", "Sports & Fitness", "Event Management", "Non-Profit & NGOs",
  "Public Relations", "Government & Politics", "Military & Defense", "Mining & Metals",
  "Consulting", "Architecture & Design", "Consumer Electronics", "Cloud Computing",
  "Data Science", "Engineering", "Venture Capital", "Private Equity",
  "Supply Chain Management", "Waste Management", "AR & VR", "Robotics", "Home Improvement",
];

const emailTemplates = [
  {
    id: "intro",
    name: "Introduction Template",
    subject: "Let's connect - {company}",
    body: `Hi {name},\n\nI hope this message finds you well. I'm reaching out from {company} because we specialize in {value_proposition} for businesses in the {industry} sector.\n\nWould you be open to a quick call next week to explore potential synergies?\n\nBest regards,\n{your_name}`
  },
  {
    id: "followup",
    name: "Follow-up Template",
    subject: "Following up on our last conversation",
    body: `Hi {name},\n\nI wanted to follow up on our previous discussion about {topic}. I believe there's a great opportunity here for {benefit}.\n\nAre you available for a quick chat in the coming days?\n\nLooking forward to your thoughts.\n\nBest,\n{your_name}`
  },
  {
    id: "promo",
    name: "Promotional Offer",
    subject: "Exclusive offer for {industry} professionals",
    body: `Hello {name},\n\nWe're excited to offer {company}'s services at a special discount for a limited time. As a {industry} professional, you can benefit from:\n\n- Benefit 1\n- Benefit 2\n- Benefit 3\n\nThis offer expires on {date}. Let me know if you'd like to learn more!\n\nRegards,\n{your_name}`
  }
];

export default function LeadEmailMarketing() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [variables, setVariables] = useState({
    company: "Your Company",
    your_name: "Your Name",
    value_proposition: "solutions that drive growth",
    industry: "",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  });

  // Fetch leads when category changes
  useEffect(() => {
    if (selectedCategory) {
      setLoadingLeads(true);
      setVariables(prev => ({ ...prev, industry: selectedCategory }));
      fetch(`/api/leads?category=${encodeURIComponent(selectedCategory)}`)
        .then((res) => res.json())
        .then((data: Lead[]) => {
          setLeads(data);
        })
        .catch(() => toast.error("Failed to fetch leads"))
        .finally(() => setLoadingLeads(false));
    } else {
      setLeads([]);
    }
  }, [selectedCategory]);

  // Handle template selection
  useEffect(() => {
    if (selectedTemplate) {
      const template = emailTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setSubject(template.subject);
        setMessage(template.body);
      }
    }
  }, [selectedTemplate]);

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      const allIds = new Set(leads.map(lead => lead.id));
      setSelectedLeads(allIds);
    } else {
      setSelectedLeads(new Set());
    }
  }, [selectAll, leads]);

  // Apply template variables
  const applyVariables = (text: string) => {
    return text
      .replace(/{name}/g, "{{lead_name}}")
      .replace(/{company}/g, variables.company)
      .replace(/{your_name}/g, variables.your_name)
      .replace(/{value_proposition}/g, variables.value_proposition)
      .replace(/{industry}/g, variables.industry)
      .replace(/{date}/g, variables.date)
      .replace(/{topic}/g, "our potential collaboration");
  };

  const handleCheckbox = (id: string) => {
    setSelectedLeads((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  const handleSendEmail = async () => {
    const selectedLeadData = leads.filter((l) => selectedLeads.has(l.id));
    const emails = selectedLeadData.map((l) => l.email);
    
    if (!subject || !message || emails.length === 0) {
      toast.warning("Please fill in subject, message, and select at least one lead");
      return;
    }

    setLoading(true);
    try {
      // Personalize each email
      const personalizedEmails = selectedLeadData.map(lead => ({
        to: lead.email,
        subject: applyVariables(subject).replace("{{lead_name}}", lead.name),
        content: applyVariables(message).replace("{{lead_name}}", lead.name)
      }));

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: personalizedEmails }),
      });

      if (res.ok) {
        toast.success(`Emails sent successfully to ${emails.length} recipients`);
        setSelectedLeads(new Set());
        setSelectAll(false);
        
        // Update last contacted date
        setLeads(prev => prev.map(lead => 
          selectedLeads.has(lead.id) 
            ? { ...lead, lastContacted: new Date().toISOString(), status: "contacted" }
            : lead
        ));
      } else {
        toast.error("Failed to send emails");
      }
    } catch (error) {
      toast.error("Error sending email");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Analytics data
  const analyticsData = useMemo(() => {
    const categoryCounts = leads.reduce((acc, lead) => {
      acc[lead.category] = (acc[lead.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = leads.reduce((acc, lead) => {
      const status = lead.status || "new";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      categoryData: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
      statusData: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      totalLeads: leads.length,
      selectedLeads: selectedLeads.size,
    };
  }, [leads, selectedLeads]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-zinc-900">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Lead Engagement Platform
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Targeted email campaigns with analytics and automation
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Filters and Input */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Setup</CardTitle>
              <CardDescription>Configure your email campaign</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category Filter</Label>
                <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email Template</Label>
                <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject line"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your email content"
                  className="min-h-[180px]"
                />
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Available variables: {"{"}name{"}"}, {"{"}company{"}"}, {"{"}your_name{"}"}, etc.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lead Selection</CardTitle>
                  <CardDescription>
                    {selectedLeads.size} of {leads.length} selected
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={setSelectAll}
                  />
                  <Label htmlFor="select-all">Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border">
                {loadingLeads ? (
                  <div className="space-y-4 p-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : leads.length === 0 ? (
                  <div className="text-center p-8 text-zinc-500">
                    {selectedCategory
                      ? "No leads found for the selected category."
                      : "Please select a category to view leads."}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">Select</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedLeads.has(lead.id)}
                              onCheckedChange={() => handleCheckbox(lead.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {lead.name}
                          </TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{lead.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                lead.status === "converted"
                                  ? "default"
                                  : lead.status === "contacted"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {lead.status || "new"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Analytics and Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Campaign Analytics</CardTitle>
                <Switch
                  checked={showAnalytics}
                  onCheckedChange={setShowAnalytics}
                />
              </div>
            </CardHeader>
            <CardContent>
              {showAnalytics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Total Leads
                      </div>
                      <div className="text-2xl font-bold">
                        {analyticsData.totalLeads}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Selected
                      </div>
                      <div className="text-2xl font-bold">
                        {analyticsData.selectedLeads}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Status Distribution</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {analyticsData.statusData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Categories</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analyticsData.categoryData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-8">
                  Analytics hidden
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Variables</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Your Company"
                    value={variables.company}
                    onChange={(e) =>
                      setVariables({ ...variables, company: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Your Name"
                    value={variables.your_name}
                    onChange={(e) =>
                      setVariables({ ...variables, your_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSendEmail}
                disabled={loading || selectedLeads.size === 0}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Send to {selectedLeads.size} Leads
                  </>
                )}
              </Button>

              <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                {selectedLeads.size > 0 ? (
                  <span>
                    Ready to send to <strong>{selectedLeads.size}</strong>{" "}
                    selected leads
                  </span>
                ) : (
                  "Select at least one lead to enable sending"
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}