"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LeadDrawer from "./LeadDrawer";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  owner: string;
  company: string;
  website?: string;
  status: string;
  Category: string;
  source: string;
  createdAt: string;
  message: string;
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
  "Interior Design", "Pet Care", "Environmental Science", "Telecommunications Infrastructure",
  "Electric Vehicles", "Transportation & Mobility", "Social Media", "SaaS", "Podcasting",
  "Content Creation", "Freelancing", "UX/UI Design", "Digital Marketing", "Influencer Marketing",
  "Market Research", "Crowdfunding", "Subscription Services", "Spiritual & Wellness",
  "Mental Health", "Childcare & Parenting", "Seniors & Geriatric Care", "Science & Research",
  "Astronomy & Space Exploration", "Food Delivery & Meal Kits", "LegalTech", "EdTech",
  "PropTech", "AdTech", "FinTech", "HealthTech", "InsurTech", "AgriTech", "Green Energy",
  "3D Printing", "Autonomous Vehicles", "Smart Homes", "Drones", "Quantum Computing",
  "Ethical Hacking", "Cryptocurrency", "Online Learning", "Job Portals", "Stock Market",
  "Luxury Goods", "Tattoo & Body Art", "Handmade & Crafts", "Fishing & Hunting",
  "Self-Improvement", "Virtual Events"
];

const LeadTable: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const fetchLeads = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/leads?category=${selectedCategory}`);
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (leads.length === 0) return;

    const doc = new jsPDF();
    doc.text("Leads Report", 14, 10);

    autoTable(doc, {
      head: [["Name", "Email", "Phone", "Category", "Source", "Date", "Message"]],
      body: leads.map((lead) => [
        lead.name,
        lead.email || "N/A",
        lead.phone || "N/A",
        lead.Category,
        lead.source,
        new Date(lead.createdAt).toLocaleDateString(),
        lead.message,
      ]),
      startY: 20,
    });

    doc.save("Leads_Report.pdf");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-900">
      <h2 className="text-xl font-semibold mb-4">Generate Leads</h2>

      <div className="flex gap-4 items-center mb-6">
        <Select onValueChange={(value) => setSelectedCategory(value)}>
          <SelectTrigger className="w-[200px] border">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={fetchLeads} disabled={!selectedCategory || loading}>
          {loading ? <Loader className="animate-spin w-5 h-5" /> : "Generate Leads"}
        </Button>

        <Button onClick={downloadPDF} disabled={leads.length === 0}>
          Download PDF
        </Button>
      </div>

      <Table className="border rounded-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length > 0 ? (
            leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedLead(lead);
                  setDrawerOpen(true);
                }}
              >
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.email || "N/A"}</TableCell>
                <TableCell>{lead.phone || "N/A"}</TableCell>
                <TableCell>{lead.Category}</TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>{lead.message}</TableCell>
                <TableCell>
                  {new Date(lead.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex gap-2">
                  <a
                    href={`mailto:${lead.email}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="outline" size="sm">Email</Button>
                  </a>
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="outline" size="sm">Call</Button>
                  </a>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No leads found for this category.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table> 


      {/* Deal Done Leads */}
{leads.filter((lead) => lead.status === "Deal Done").length > 0 && (
  <div className="mb-10">
    <h3 className="text-lg font-semibold mb-2">Deal Done Leads</h3>
    <Table className="border rounded-lg">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads
          .filter((lead) => lead.status === "Deal Done")
          .map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer"
              onClick={() => {
                setSelectedLead(lead);
                setDrawerOpen(true);
              }}
            >
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.email || "N/A"}</TableCell>
              <TableCell>{lead.phone || "N/A"}</TableCell>
              <TableCell>{lead.Category}</TableCell>
              <TableCell>{lead.source}</TableCell>
              <TableCell>{lead.message}</TableCell>
              <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="flex gap-2">
                <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm">Email</Button>
                </a>
                <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm">Call</Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </div>
)}

{/* On Hold Leads */}
{leads.filter((lead) => lead.status === "On Hold").length > 0 && (
  <div>
    <h3 className="text-lg font-semibold mb-2">On Hold Leads</h3>
    <Table className="border rounded-lg">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads
          .filter((lead) => lead.status === "On Hold")
          .map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer"
              onClick={() => {
                setSelectedLead(lead);
                setDrawerOpen(true);
              }}
            >
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.email || "N/A"}</TableCell>
              <TableCell>{lead.phone || "N/A"}</TableCell>
              <TableCell>{lead.Category}</TableCell>
              <TableCell>{lead.source}</TableCell>
              <TableCell>{lead.message}</TableCell>
              <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="flex gap-2">
                <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm">Email</Button>
                </a>
                <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm">Call</Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </div>
)}


      {/* Lead Drawer */}
      <LeadDrawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        lead={selectedLead}
      />
    </div>
  );
};

export default LeadTable;
