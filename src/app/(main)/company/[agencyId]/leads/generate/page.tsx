"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const categories = [
  "Real Estate",
  "Finance",
  "Technology",
  "Healthcare",
  "Marketing",
  "Software",
  "Education",
  "Automotive",
  "E-commerce",
  "Retail",
  "Manufacturing",
  "Logistics",
  "Construction",
  "Entertainment",
  "Hospitality",
  "Travel & Tourism",
  "Legal Services",
  "Insurance",
  "Telecommunications",
  "Agriculture",
  "Food & Beverage",
  "Renewable Energy",
  "Biotechnology",
  "Pharmaceuticals",
  "Cybersecurity",
  "Artificial Intelligence",
  "Blockchain",
  "Gaming",
  "Aerospace",
  "Fashion",
  "Media & Journalism",
  "Music & Arts",
  "Human Resources",
  "Sports & Fitness",
  "Event Management",
  "Non-Profit & NGOs",
  "Public Relations",
  "Government & Politics",
  "Military & Defense",
  "Mining & Metals",
  "Consulting",
  "Architecture & Design",
  "Consumer Electronics",
  "Cloud Computing",
  "Data Science",
  "Engineering",
  "Venture Capital",
  "Private Equity",
  "Supply Chain Management",
  "Waste Management",
  "AR & VR",
  "Robotics",
  "Home Improvement",
];

export default function LeadGenerationPage() {
  const [formData, setFormData] = useState({
    category: "",
    location: "",
    requestedLeads: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/leads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const { jobId } = await response.json();
      router.push(`generate/status/${jobId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start generation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6 mt-6 ml-6">
        <Link
          href="/leads"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
      </div>
      <div className="flex justify-center items-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-xl border border-gray-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Generate New Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Category Dropdown */}
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                required>
                <SelectTrigger className="p-3 border rounded-lg focus:ring-2 focus:ring-violet-500">
                  <SelectValue placeholder="Select Business Category" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                name="location"
                placeholder="Location (City, State)"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
                className="p-3 border rounded-lg focus:ring-2 focus:ring-violet-500"
              />

              <Input
                name="requestedLeads"
                type="number"
                min="1"
                max="100"
                placeholder="Number of Leads"
                value={formData.requestedLeads}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requestedLeads: parseInt(e.target.value) || 10,
                  })
                }
                required
                className="p-3 border rounded-lg focus:ring-2 focus:ring-violet-500"
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition duration-300">
                {isSubmitting ? "Starting Generation..." : "Generate Leads"}
              </Button>
            </form>

            {error && <p className="mt-3 text-red-500 text-center">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
