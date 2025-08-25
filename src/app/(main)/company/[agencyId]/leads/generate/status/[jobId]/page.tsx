"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

import { Check, X, Loader2 } from "lucide-react";

interface Lead {
  name: string;
  phone?: string;
  email?: string;
  Category: string;
  message: string;
}

interface JobStatus {
  status: string;
  progress: number;
  leads: Lead[];
  error?: string;
}

export default function JobStatusPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!jobId) return;

    const fetchJobStatus = async () => {
      try {
        const response = await fetch(`/api/leads/status/${jobId}`);
        if (!response.ok) throw new Error("Failed to fetch job status");

        const data: JobStatus = await response.json();
        setJobStatus(data);

        // If job is still in progress, poll every 3 seconds
        if (data.status === "active" || data.status === "waiting") {
          setTimeout(fetchJobStatus, 3000);
        }
      } catch (error) {
        console.error("Error fetching job status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobStatus();
  }, [jobId]);

  const handleSaveLeads = async () => {
    if (selectedLeads.length === 0) return;

    setIsSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: selectedLeads }),
      });

      if (!response.ok) throw new Error("Failed to save leads");

      router.push("/leads?success=true");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save leads"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLeadSelection = (lead: Lead) => {
    setSelectedLeads((prev) =>
      prev.some((l) => l.name === lead.name && l.phone === lead.phone)
        ? prev.filter((l) => !(l.name === lead.name && l.phone === lead.phone))
        : [...prev, lead]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!jobStatus) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>Unable to load job status</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 mt-6 ml-6">
        <Link
          href="/leads/generate"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Generator
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Lead Generation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Progress:</span>
                  <span>{jobStatus.progress}%</span>
                </div>
                <Progress value={jobStatus.progress} className="h-2" />
              </div>

              <div className="flex items-center">
                <span className="w-32">Status:</span>
                <span
                  className={`font-medium ${
                    jobStatus.status === "completed"
                      ? "text-green-500"
                      : jobStatus.status === "failed"
                        ? "text-red-500"
                        : "text-blue-500"
                  }`}>
                  {jobStatus.status}
                  {jobStatus.status === "active" && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
                  )}
                </span>
              </div>

              {jobStatus.error && (
                <div className="p-3 bg-red-100 text-red-700 rounded">
                  {jobStatus.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {jobStatus.leads.length > 0 && (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Generated Leads ({jobStatus.leads.length})
              </h2>
              <div className="text-sm text-muted-foreground">
                Selected: {selectedLeads.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="p-3 text-left">Select</th>
                    <th className="p-3 text-left">Business Name</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStatus.leads.map((lead, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-3">
                        <button
                          onClick={() => toggleLeadSelection(lead)}
                          className={`p-1 rounded-full ${
                            selectedLeads.some(
                              (l) =>
                                l.name === lead.name && l.phone === lead.phone
                            )
                              ? "bg-violet-100 text-violet-600"
                              : "bg-gray-100 text-gray-400"
                          }`}>
                          {selectedLeads.some(
                            (l) =>
                              l.name === lead.name && l.phone === lead.phone
                          ) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">{lead.name}</td>
                      <td className="p-3">{lead.phone || "N/A"}</td>
                      <td className="p-3">{lead.Category}</td>
                      {lead.email || "N/A"}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveLeads}
                disabled={selectedLeads.length === 0 || isSaving}
                className="bg-violet-600 hover:bg-violet-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save Selected Leads (${selectedLeads.length})`
                )}
              </Button>
            </div>

            {saveError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                {saveError}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
