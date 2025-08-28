"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, Filter, X, Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define the Lead interface
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "new" | "contacted" | "interested" | "qualified" | "unqualified";
  notes?: string;
  createdAt: Date;
  Notes: Note[];
}

interface Note {
  id: string;
  message: string;
  behavior?: string;
  createdAt: Date;
  leadId: string;
}

// Filter types
interface Filters {
  status: string;
  search: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]); // Store all leads for filtering
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newNote, setNewNote] = useState({ message: "", behavior: "" });
  const [addingNote, setAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editNoteData, setEditNoteData] = useState({
    message: "",
    behavior: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { userId } = useAuth();
  const pathname = usePathname();

  // Initialize filters
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    search: "",
    dateRange: {
      from: null,
      to: null,
    },
  });

  // Use a ref to track which leads have had their notes fetched
  const fetchedNotesLeads = useRef<Set<string>>(new Set());

  const pathParts = pathname.split("/");
  const agencyId = pathParts[2];

  // Function to generate WhatsApp link
  const getWhatsAppLink = (phone: string, message: string = "") => {
    // Clean phone number - remove non-digit characters
    const cleanedPhone = phone.replace(/\D/g, "");

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
  };

  // Function to handle WhatsApp contact
  const handleWhatsAppContact = (lead: Lead) => {
    // Create a default message
    const defaultMessage = `Hello ${lead.name}, I'm reaching out from our agency.`;

    // Open WhatsApp with the pre-filled message
    window.open(getWhatsAppLink(lead.phone, defaultMessage), "_blank");
  };

  // Filter leads based on filter criteria
  const filterLeads = useCallback(() => {
    let filtered = [...allLeads];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm) ||
          lead.email.toLowerCase().includes(searchTerm) ||
          lead.phone.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by date range
    if (filters.dateRange.from) {
      filtered = filtered.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= filters.dateRange.from!;
      });
    }

    if (filters.dateRange.to) {
      filtered = filtered.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        leadDate.setHours(23, 59, 59, 999); // End of day
        return leadDate <= filters.dateRange.to!;
      });
    }

    return filtered;
  }, [allLeads, filters]);

  // Apply filters whenever filters or allLeads change
  useEffect(() => {
    const filteredLeads = filterLeads();
    setLeads(filteredLeads);
  }, [filterLeads]);

  // Fetch all leads for the agency
  const fetchAllLeads = async () => {
    if (!agencyId) return;

    setFetching(true);
    try {
      const response = await fetch(`/api/agencies/${agencyId}/lead`);

      if (response.ok) {
        const data = await response.json();
        setAllLeads(data.leads || []);
        setLeads(data.leads || []);
      } else {
        throw new Error("Failed to fetch leads");
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      alert("Error fetching leads. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  // Fetch notes for a specific lead
  const fetchLeadNotes = async (leadId: string) => {
    if (!leadId) return;

    setFetchingNotes(true);
    try {
      const response = await fetch(
        `/api/agencies/${agencyId}/lead/${leadId}/notes`
      );

      if (response.ok) {
        const data = await response.json();
        return data.notes || [];
      } else {
        throw new Error("Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      return [];
    } finally {
      setFetchingNotes(false);
    }
  };

  // Fetch a single lead with notes
  const fetchLeadDetails = async (leadId: string) => {
    try {
      // First get the lead details
      const leadResponse = await fetch(
        `/api/agencies/${agencyId}/lead/${leadId}`
      );

      if (leadResponse.ok) {
        const leadData = await leadResponse.json();
        const lead = leadData.lead;

        // Check if we need to fetch notes for this lead
        let notes = lead.Notes || [];
        if (!fetchedNotesLeads.current.has(leadId)) {
          notes = await fetchLeadNotes(leadId);
          fetchedNotesLeads.current.add(leadId);
        }

        setSelectedLead({
          ...lead,
          Notes: notes,
        });
        setIsDrawerOpen(true);
      } else {
        throw new Error("Failed to fetch lead details");
      }
    } catch (error) {
      console.error("Error fetching lead details:", error);
      alert("Error fetching lead details. Please try again.");
    }
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("agencyId", agencyId);

    try {
      // In a real app, you would upload to your API endpoint
      // For demo purposes, we'll simulate parsing a CSV
      const text = await readFileAsText(file);
      const parsedLeads = parseCSV(text);

      // Add temporary IDs and status for demo
      const leadsWithIds = parsedLeads.map((lead, index) => ({
        ...lead,
        id: `temp-${index}`,
        status: "new" as const,
        createdAt: new Date(),
        Notes: [],
      }));

      setLeads(leadsWithIds);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please make sure it is a valid CSV file.");
    } finally {
      setUploading(false);
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(reader.error);
      reader.readAsText(file);
    });
  };

  // Parse CSV content (simplified for demo)
  const parseCSV = (text: string): Partial<Lead>[] => {
    const lines = text.split("\n");
    const headers = lines[0]
      .split(",")
      .map((header) => header.trim().toLowerCase());

    return lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        const values = line.split(",").map((value) => value.trim());
        const lead: Partial<Lead> = {};

        headers.forEach((header, index) => {
          if (header.includes("name")) lead.name = values[index];
          if (header.includes("email")) lead.email = values[index];
          if (header.includes("phone") || header.includes("mobile"))
            lead.phone = values[index];
        });

        return lead;
      });
  };

  // Save leads to the database
  const saveLeads = async () => {
    if (leads.length === 0) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/agencies/${agencyId}/lead/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leads, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Leads saved successfully!");
        setLeads([]);
        // Refresh the existing leads list
        fetchAllLeads();
        // Switch to the list tab
        setActiveTab("list");
      } else {
        throw new Error("Failed to save leads");
      }
    } catch (error) {
      console.error("Error saving leads:", error);
      alert("Error saving leads. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Update lead status
  const updateLeadStatus = async (id: string, status: Lead["status"]) => {
    try {
      const response = await fetch(`/api/agencies/${agencyId}/lead/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update in all leads
        setAllLeads((prev) =>
          prev.map((lead) =>
            lead.id === id ? { ...lead, status: data.lead.status } : lead
          )
        );

        // Update in selected lead if it's the one being edited
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead({ ...selectedLead, status: data.lead.status });
        }

        alert("Status updated successfully!");
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    }
  };

  // Add a note to a lead
  const addNoteToLead = async () => {
    if (!selectedLead || !newNote.message.trim()) return;

    setAddingNote(true);
    try {
      const response = await fetch(
        `/api/agencies/${agencyId}/lead/${selectedLead.id}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: newNote.message,
            behavior: newNote.behavior || null,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Update the selected lead with the new note
        setSelectedLead({
          ...selectedLead,
          Notes: [data.note, ...selectedLead.Notes],
        });

        // Clear the form
        setNewNote({ message: "", behavior: "" });
        alert("Note added successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Error adding note. Please try again.");
    } finally {
      setAddingNote(false);
    }
  };

  // Open edit note dialog
  const openEditNoteDialog = (note: Note) => {
    setEditingNote(note);
    setEditNoteData({
      message: note.message,
      behavior: note.behavior || "",
    });
    setIsEditDialogOpen(true);
  };

  // Update a note
  const updateNote = async () => {
    if (!editingNote || !selectedLead) return;

    try {
      const response = await fetch(
        `/api/agencies/${agencyId}/lead/${selectedLead.id}/notes/${editingNote.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: editNoteData.message,
            behavior: editNoteData.behavior || null,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Update in selected lead
        setSelectedLead({
          ...selectedLead,
          Notes: selectedLead.Notes.map((note) =>
            note.id === editingNote.id ? data.note : note
          ),
        });

        alert("Note updated successfully!");
        setIsEditDialogOpen(false);
        setEditingNote(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update note");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Error updating note. Please try again.");
    }
  };

  // Delete a note
  const deleteNote = async (noteId: string) => {
    try {
      if (!selectedLead) return;

      const response = await fetch(
        `/api/agencies/${agencyId}/lead/${selectedLead.id}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Update in selected lead
        setSelectedLead({
          ...selectedLead,
          Notes: selectedLead.Notes.filter((note) => note.id !== noteId),
        });

        alert("Note deleted successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Error deleting note. Please try again.");
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (
    key: keyof Filters["dateRange"],
    value: Date | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value,
      },
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "all",
      search: "",
      dateRange: {
        from: null,
        to: null,
      },
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.status !== "all" ||
      filters.search !== "" ||
      filters.dateRange.from !== null ||
      filters.dateRange.to !== null
    );
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: Lead["status"]) => {
    const statusConfig = {
      new: { label: "New", variant: "secondary" as const },
      contacted: { label: "Contacted", variant: "outline" as const },
      interested: { label: "Interested", variant: "default" as const },
      qualified: { label: "Qualified", variant: "success" as const },
      unqualified: { label: "Unqualified", variant: "destructive" as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format datetime for display
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Reset selected lead when drawer closes
  useEffect(() => {
    if (!isDrawerOpen) {
      setSelectedLead(null);
    }
  }, [isDrawerOpen]);

  // Fetch leads when tab changes to list
  useEffect(() => {
    if (activeTab === "list") {
      fetchAllLeads();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">
            Private Lead Management
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Leads</TabsTrigger>
            <TabsTrigger value="list">List Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Leads</CardTitle>
                <CardDescription>
                  Upload a CSV file with your leads. The file should include
                  name, email, and phone columns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="leads-file">Leads File</Label>
                  <Input
                    id="leads-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <p className="text-sm text-muted-foreground">
                      Uploading...
                    </p>
                  )}
                </div>

                {leads.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Leads Preview</h3>
                      <Button
                        onClick={saveLeads}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700">
                        {saving ? "Saving..." : "Save Leads"}
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">
                              {lead.name}
                            </TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>{lead.phone}</TableCell>
                            <TableCell>
                              <Select
                                value={lead.status}
                                onValueChange={(value: Lead["status"]) =>
                                  updateLeadStatus(lead.id, value)
                                }>
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">
                                    Contacted
                                  </SelectItem>
                                  <SelectItem value="interested">
                                    Interested
                                  </SelectItem>
                                  <SelectItem value="qualified">
                                    Qualified
                                  </SelectItem>
                                  <SelectItem value="unqualified">
                                    Unqualified
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {leads.length === 0 && !uploading && (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg mt-6">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No leads to preview
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by uploading a CSV file with your leads.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>All Leads</CardTitle>
                    <CardDescription>
                      View and manage all leads for your agency.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      variant="outline"
                      className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                      {hasActiveFilters() && (
                        <Badge variant="secondary" className="ml-1">
                          Active
                        </Badge>
                      )}
                    </Button>
                    <Button
                      onClick={fetchAllLeads}
                      disabled={fetching}
                      variant="outline">
                      {fetching ? "Refreshing..." : "Refresh Leads"}
                    </Button>
                  </div>
                </div>

                {/* Filters Section */}
                {showFilters && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-900">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Filter Leads</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        disabled={!hasActiveFilters()}>
                        Clear All
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Status Filter */}
                      <div className="space-y-2">
                        <Label htmlFor="status-filter">Status</Label>
                        <Select
                          value={filters.status}
                          onValueChange={(value) =>
                            handleFilterChange("status", value)
                          }>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="interested">
                              Interested
                            </SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="unqualified">
                              Unqualified
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Search Filter */}
                      <div className="space-y-2">
                        <Label htmlFor="search-filter">Search</Label>
                        <Input
                          id="search-filter"
                          placeholder="Search by name, email, or phone"
                          value={filters.search}
                          onChange={(e) =>
                            handleFilterChange("search", e.target.value)
                          }
                        />
                      </div>

                      {/* Date Range Filter */}
                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !filters.dateRange.from &&
                                    "text-muted-foreground"
                                )}>
                                <Calendar className="mr-2 h-4 w-4" />
                                {filters.dateRange.from ? (
                                  format(filters.dateRange.from, "PPP")
                                ) : (
                                  <span>From</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={filters.dateRange.from || undefined}
                                onSelect={(date) =>
                                  handleDateRangeChange("from", date)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !filters.dateRange.to &&
                                    "text-muted-foreground"
                                )}>
                                <Calendar className="mr-2 h-4 w-4" />
                                {filters.dateRange.to ? (
                                  format(filters.dateRange.to, "PPP")
                                ) : (
                                  <span>To</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={filters.dateRange.to || undefined}
                                onSelect={(date) =>
                                  handleDateRangeChange("to", date)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {leads.length} of {allLeads.length} leads
                  </p>
                  {hasActiveFilters() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Clear filters
                    </Button>
                  )}
                </div>

                {leads.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow
                          key={lead.id}
                          className="cursor-pointer hover:bg-gray-700"
                          onClick={() => fetchLeadDetails(lead.id)}>
                          <TableCell className="font-medium">
                            {lead.name}
                          </TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell>{lead.phone}</TableCell>
                          <TableCell>
                            {renderStatusBadge(lead.status)}
                          </TableCell>
                          <TableCell>{formatDate(lead.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`mailto:${lead.email}`, "_blank");
                                }}>
                                Email
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`tel:${lead.phone}`, "_blank");
                                }}>
                                Call
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsAppContact(lead);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                WhatsApp
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No leads found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {hasActiveFilters()
                        ? "Try adjusting your filters or clear them to see all leads."
                        : "Get started by uploading leads or click refresh to check for existing leads."}
                    </p>
                    {hasActiveFilters() ? (
                      <Button onClick={clearFilters} className="mt-4">
                        Clear Filters
                      </Button>
                    ) : (
                      <Button
                        onClick={fetchAllLeads}
                        disabled={fetching}
                        className="mt-4">
                        {fetching ? "Checking..." : "Refresh Leads"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Lead Details Drawer */}
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            {selectedLead ? (
              <>
                <SheetHeader className="mb-6">
                  <SheetTitle>Lead Details</SheetTitle>
                  <SheetDescription>
                    View and manage details for {selectedLead.name}
                  </SheetDescription>
                </SheetHeader>

                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Name</h3>
                      <p>{selectedLead.name}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Email</h3>
                      <p>{selectedLead.email}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Phone</h3>
                      <p>{selectedLead.phone}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Status</h3>
                      <Select
                        value={selectedLead.status}
                        onValueChange={(value: Lead["status"]) =>
                          updateLeadStatus(selectedLead.id, value)
                        }>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="unqualified">
                            Unqualified
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Created</h3>
                      <p>{formatDate(selectedLead.createdAt)}</p>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="flex space-x-4">
                    <Button
                      onClick={() =>
                        window.open(`mailto:${selectedLead.email}`, "_blank")
                      }
                      variant="outline">
                      Email
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(`tel:${selectedLead.phone}`, "_blank")
                      }
                      variant="outline">
                      Call
                    </Button>
                    <Button
                      onClick={() => handleWhatsAppContact(selectedLead)}
                      className="bg-green-600 hover:bg-green-700 text-white">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Notes</h3>
                    {fetchingNotes ? (
                      <div className="flex justify-center items-center p-4">
                        <p>Loading notes...</p>
                      </div>
                    ) : selectedLead.Notes && selectedLead.Notes.length > 0 ? (
                      <div className="space-y-4">
                        {selectedLead.Notes.map((note) => (
                          <div
                            key={note.id}
                            className="border rounded-lg p-4 relative">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium">
                                {note.behavior || "General Note"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(note.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{note.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No notes yet.</p>
                    )}

                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Add New Note</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="behavior">Behavior (Optional)</Label>
                          <Input
                            id="behavior"
                            value={newNote.behavior}
                            onChange={(e) =>
                              setNewNote({
                                ...newNote,
                                behavior: e.target.value,
                              })
                            }
                            placeholder="e.g., Call, Email, Meeting"
                          />
                        </div>
                        <div>
                          <Label htmlFor="message">Message *</Label>
                          <Textarea
                            id="message"
                            value={newNote.message}
                            onChange={(e) =>
                              setNewNote({
                                ...newNote,
                                message: e.target.value,
                              })
                            }
                            placeholder="Enter your note here..."
                            rows={4}
                          />
                        </div>
                        <Button
                          onClick={addNoteToLead}
                          disabled={addingNote || !newNote.message.trim()}
                          className="w-full">
                          {addingNote ? "Adding..." : "Add Note"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Loading lead details...</p>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Edit Note Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>
                Make changes to your note here.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-behavior">Behavior (Optional)</Label>
                <Input
                  id="edit-behavior"
                  value={editNoteData.behavior}
                  onChange={(e) =>
                    setEditNoteData({
                      ...editNoteData,
                      behavior: e.target.value,
                    })
                  }
                  placeholder="e.g., Call, Email, Meeting"
                />
              </div>
              <div>
                <Label htmlFor="edit-message">Message *</Label>
                <Textarea
                  id="edit-message"
                  value={editNoteData.message}
                  onChange={(e) =>
                    setEditNoteData({
                      ...editNoteData,
                      message: e.target.value,
                    })
                  }
                  placeholder="Enter your note here..."
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateNote}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
