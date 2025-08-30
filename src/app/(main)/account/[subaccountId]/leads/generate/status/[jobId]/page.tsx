"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

import {
  Check,
  X,
  Loader2,
  Download,
  Building2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(10);

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

      router.back();
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

  const selectAllLeads = () => {
    if (selectedLeads.length === currentLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads([...currentLeads]);
    }
  };

  // Pagination logic
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads =
    jobStatus?.leads?.slice(indexOfFirstLead, indexOfLastLead) || [];
  const totalPages = Math.ceil((jobStatus?.leads?.length || 0) / leadsPerPage);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading job status...</p>
      </div>
    );
  }

  if (!jobStatus) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Unable to load job status
            </h2>
            <p className="text-muted-foreground mb-4">
              The requested job could not be found.
            </p>
            <Button onClick={() => router.push("/leads/generate")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Generator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="mb-8 border-border">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lead Generation Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 text-sm font-medium">
                  <span>Processing:</span>
                  <span>{jobStatus.progress}%</span>
                </div>
                <Progress value={jobStatus.progress} className="h-2" />
              </div>

              <div className="flex items-center">
                <span className="w-32 font-medium">Status:</span>
                <span
                  className={`inline-flex items-center font-medium px-2.5 py-0.5 rounded-full text-xs ${
                    jobStatus.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : jobStatus.status === "failed"
                        ? "bg-destructive/10 text-destructive dark:bg-destructive/20"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}>
                  {jobStatus.status === "active" && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  {jobStatus.status.charAt(0).toUpperCase() +
                    jobStatus.status.slice(1)}
                </span>
              </div>

              {jobStatus.error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
                  {jobStatus.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {jobStatus.leads.length > 0 && (
          <>
            <Card className="border-border">
              <CardHeader className="bg-muted/50 py-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <CardTitle className="flex items-center gap-2">
                    Generated Leads ({jobStatus.leads.length})
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedLeads.length} of {jobStatus.leads.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-3 text-left">
                          <button
                            onClick={selectAllLeads}
                            className={`p-1.5 rounded-md ${
                              selectedLeads.length === currentLeads.length &&
                              currentLeads.length > 0
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}>
                            <Check className="h-4 w-4" />
                          </button>
                        </th>
                        <th className="p-3 text-left font-medium text-sm">
                          Business Name
                        </th>
                        <th className="p-3 text-left font-medium text-sm">
                          Phone
                        </th>
                        <th className="p-3 text-left font-medium text-sm">
                          Category
                        </th>
                        <th className="p-3 text-left font-medium text-sm">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLeads.map((lead, index) => {
                        const isSelected = selectedLeads.some(
                          (l) => l.name === lead.name && l.phone === lead.phone
                        );
                        return (
                          <tr
                            key={index}
                            className={`border-b border-border hover:bg-muted/30 transition-colors ${
                              isSelected ? "bg-primary/5" : ""
                            }`}>
                            <td className="p-3">
                              <button
                                onClick={() => toggleLeadSelection(lead)}
                                className={`p-1.5 rounded-md ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border hover:bg-muted"
                                }`}>
                                {isSelected ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </button>
                            </td>
                            <td className="p-3 font-medium">{lead.name}</td>
                            <td className="p-3">
                              {lead.phone ? (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  {lead.phone}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                                {lead.Category}
                              </span>
                            </td>
                            <td className="p-3">
                              {lead.email ? (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  {lead.email}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Showing {indexOfFirstLead + 1}-
                      {Math.min(indexOfLastLead, jobStatus.leads.length)} of{" "}
                      {jobStatus.leads.length} leads
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setSelectedLeads([...jobStatus.leads])}
                disabled={selectedLeads.length === jobStatus.leads.length}>
                <Check className="h-4 w-4 mr-2" />
                Select All
              </Button>
              <Button
                onClick={handleSaveLeads}
                disabled={selectedLeads.length === 0 || isSaving}
                className="bg-primary hover:bg-primary/90">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Save Selected Leads ({selectedLeads.length})
                  </>
                )}
              </Button>
            </div>

            {saveError && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
                {saveError}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
