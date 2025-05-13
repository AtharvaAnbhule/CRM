"use client";

import { useEffect, useState } from "react";
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

interface Lead {
  id: string;
  name: string;
  email: string;
  category: string;
}

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

export default function LeadEmailMarketing() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      setLoadingLeads(true);
      fetch(`/api/leads?category=${encodeURIComponent(selectedCategory)}`)
        .then((res) => res.json())
        .then((data: Lead[]) => {
          setLeads(data);
        })
        .catch(() => toast.error("Failed to fetch leads"))
        .finally(() => setLoadingLeads(false));
    }
  }, [selectedCategory]);

  const handleCheckbox = (id: string) => {
    setSelectedLeads((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  const handleSendEmail = async () => {
    const emails = leads.filter((l) => selectedLeads.has(l.id)).map((l) => l.email);
    if (!subject || !message || emails.length === 0) {
      toast.warning("Fill subject, message, and select at least one lead");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content: message, to: emails }),
      });

      if (res.ok) {
        toast.success("Emails sent successfully");
        setSelectedLeads(new Set());
        setSubject("");
        setMessage("");
      } else {
        toast.error("Failed to send emails");
      }
    } catch {
      toast.error("Error sending email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-8 bg-white dark:bg-zinc-900 rounded-xl shadow-md">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          🎯 Lead Email Marketing
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Filter leads by category, select recipients, and send targeted emails.
        </p>
      </header>

      {/* Filters & Input */}
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Category
          </label>
          <Select onValueChange={setSelectedCategory} value={selectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose category" />
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

        <div>
          <label className="block mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Subject
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Message
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter email message"
            className="h-[120px]"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-md border border-zinc-200 dark:border-zinc-700 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left">Select</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Category</th>
            </tr>
          </thead>
          <tbody>
            {loadingLeads ? (
              <tr>
                <td colSpan={4} className="text-center px-6 py-4 text-zinc-500">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center px-6 py-4 text-zinc-500">
                  No leads found for the selected category.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-t border-zinc-200 dark:border-zinc-700">
                  <td className="px-6 py-3">
                    <Checkbox
                      checked={selectedLeads.has(lead.id)}
                      onCheckedChange={() => handleCheckbox(lead.id)}
                    />
                  </td>
                  <td className="px-6 py-3 font-medium text-zinc-900 dark:text-white">{lead.name}</td>
                  <td className="px-6 py-3">{lead.email}</td>
                  <td className="px-6 py-3">
                    <span className="inline-block bg-zinc-100 dark:bg-zinc-800 text-xs px-2 py-0.5 rounded-full">
                      {lead.category}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Send Email Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSendEmail}
          disabled={loading || selectedLeads.size === 0}
          className="px-6"
        >
          {loading ? "Sending..." : "📤 Send Email"}
        </Button>
      </div>
    </div>
  );
}
