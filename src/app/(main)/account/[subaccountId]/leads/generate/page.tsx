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
    <div className="min-h-screen bg-gradient-to-br  dark:bg-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 mt-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        <Card className="w-full shadow-lg border-slate-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6">
            <CardTitle className="text-2xl font-bold flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate New Leads
            </CardTitle>
            <p className="text-blue-100 text-sm font-normal mt-1">
              Fill in the details below to start generating high-quality leads
              for your business
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business Category
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required>
                  <SelectTrigger className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200">
                    <SelectValue placeholder="Select a business category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 shadow-md">
                    {categories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="px-4 py-2 hover:bg-slate-100 cursor-pointer transition-colors duration-150">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  name="location"
                  placeholder="e.g., New York, NY or San Francisco, CA"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Number of Leads
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  name="requestedLeads"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Enter number between 1-100"
                  value={formData.requestedLeads}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requestedLeads: parseInt(e.target.value) || 10,
                    })
                  }
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Maximum of 100 leads per generation
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Generation...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Generate Leads
                  </div>
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Need help? Contact our support team at support@leadgenpro.com</p>
        </div>
      </div>
    </div>
  );
}
