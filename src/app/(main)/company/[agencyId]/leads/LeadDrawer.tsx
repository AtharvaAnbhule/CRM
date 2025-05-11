"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Notes from "./Notes";
import { useToast } from "@/app/(main)/CodeBuilder/components/ui/use-toast";

interface Lead {
  id: string;
  name: string;
  owner: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  message: string;
  status: string;
  activities: string[];
  notes: { message: string; behavior?: string }[];
}

const statusOptions = ["New", "Contacted", "On Hold", "Deal Done", "Lost"];

interface LeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const LeadDrawer: React.FC<LeadDrawerProps> = ({ isOpen, onClose, lead }) => {
  const [activeTab, setActiveTab] = useState<"details" | "notes">("details");
  const [status, setStatus] = useState(lead?.status || "");
  const { toast } = useToast();
  const pathname = usePathname();
const pathParts = pathname.split("/");
const agencyId = pathParts[2]; // assuming the URL is /company/<agencyId>/billing/checkout

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
    }
  }, [lead]);

  if (!lead) return null;

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      const res = await fetch(
        `/api/leads/${lead.id}/status?id=${agencyId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus , agencyId:agencyId }),
        }
      );
      if (res.ok) {
        toast({ title: "Status updated." });
      } else {
        throw new Error();
      }
    } catch {
      toast({ variant: "destructive", title: "Failed to update status." });
      setStatus(lead.status);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="w-full h-[80vh] max-h-[80vh] overflow-y-auto p-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 rounded-t-2xl"
      >
        <div>
          {/* Profile Section */}
          <div className="flex items-center gap-4 p-6 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-300 dark:bg-gray-700 rounded-full">
              <User className="text-gray-600 dark:text-gray-400" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {lead.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {lead.company}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                👤 {lead.owner}
              </p>
            </div>
          </div>

          {/* Current Status */}
          <div className="p-4 text-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Status:{" "}
            </span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm">
              {status}
            </span>
          </div>

          {/* Status Dropdown */}
          <div className="p-4 flex justify-center">
            <Select
              value={status}
              onValueChange={(value) => updateStatus(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900">
            {["details", "notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "details" | "notes")}
                className={cn(
                  "flex-1 p-3 text-center hover:bg-gray-100 dark:hover:bg-gray-800",
                  activeTab === tab
                    ? "border-b-2 border-blue-500 font-semibold text-blue-600 dark:text-blue-400"
                    : ""
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "details" && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Basic Information
                </h3>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <p>
                    <span className="font-medium">Lead Name:</span> {lead.name}
                  </p>
                  <p>
                    <span className="font-medium">Lead Owner:</span>{" "}
                    {lead.owner}
                  </p>
                  <p>
                    <span className="font-medium">Company Name:</span>{" "}
                    {lead.company}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    <Button
                      variant="link"
                      className="p-0 text-blue-600 dark:text-blue-400 ml-1"
                      onClick={() =>
                        (window.location.href = `mailto:${lead.email}`)
                      }
                    >
                      {lead.email}
                    </Button>
                  </p>
                  <p>
                    <span className="font-medium">Mobile:</span>{" "}
                    <Button
                      variant="link"
                      className="p-0 text-blue-600 dark:text-blue-400 ml-1"
                      onClick={() =>
                        (window.location.href = `tel:${lead.phone}`)
                      }
                    >
                      {lead.phone}
                    </Button>
                  </p>
                  <p>
                    <span className="font-medium">Website:</span>{" "}
                    {lead.website ? (
                      <a
                        className="text-blue-600 dark:text-blue-400 ml-1"
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Website
                      </a>
                    ) : (
                      <span className="text-blue-600 dark:text-blue-400 ml-1">
                        ADD WEBSITE
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}

            {activeTab === "notes" && <Notes leadId={lead.id} />}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeadDrawer;
