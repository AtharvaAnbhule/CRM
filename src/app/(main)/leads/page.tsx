"use client";

import { useState } from "react";
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

export default function LeadForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    Category: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Lead submitted successfully!");
      setFormData({ name: "", email: "", phone: "", message: "", Category: "" });
    } else {
      setMessage(data.error || "Failed to submit lead.");
    }
  };

  return (<>
    <div className="mb-6 mt-6 ml-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
        </div>
    <div className="flex justify-center items-center min-h-screen dark:bg-black-100 p-4">
    
      <Card className="w-full max-w-md shadow-xl border border-gray-300 rounded-2xl dark:bg-black">
        <CardHeader>
          <CardTitle className="text-xl font-semibold dark:text-white-800">
            Request Service from Companies by becoming leads.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg focus:ring-2 focus:ring-violet-500"
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg focus:ring-2 focus:ring-violet-500"
            />
            <Input
              name="phone"
              type="tel"
              placeholder="Phone (Optional)"
              value={formData.phone}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-violet-500"
            />

            {/* Category Dropdown */}
            <Select
              value={formData.Category}
              onValueChange={(value) =>
                setFormData({ ...formData, Category: value })
              }
            >
              <SelectTrigger className="p-3 border rounded-lg focus:ring-2 focus:ring-violet-500">
                <SelectValue placeholder="Select Category" />
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
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-violet-500"
            />

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition duration-300"
            >
              Submit
            </Button>
          </form>

          {message && <p className="mt-3 text-green-600 text-center">{message}</p>}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
