"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Role } from "@prisma/client";

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: any) => void;
  agencyId: string;
}

export const ManualAddModal = ({ isOpen, onClose, onAdd, agencyId }: ManualAddModalProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("SUBACCOUNT_USER");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/add", {
        method: "POST",
        body: JSON.stringify({ email, role, agencyId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      toast.success("User added");
      onAdd(data.user);
      setEmail("");
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member Manually</DialogTitle>
        </DialogHeader>
        <Input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="border p-2 rounded mt-2"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value="AGENCY_ADMIN">Admin</option>
          <option value="SUBACCOUNT_USER">User</option>
          <option value="SUBACCOUNT_GUEST">Guest</option>
        </select>
        <Button disabled={loading} onClick={handleAdd} className="mt-4">
          {loading ? "Adding..." : "Add Member"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
