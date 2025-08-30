import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Import Input field

const behaviorOptions = ["Rude", "Not Interested", "Interested", "Need Follow-up"];

const Notes = ({ leadId: initialLeadId }: { leadId: string }) => {
  const [notes, setNotes] = useState<{ id: string; leadId: string; behavior: string; message: string }[]>([]);
  const [leadId, setLeadId] = useState(initialLeadId);
  const [behavior, setBehavior] = useState("");
  const [message, setMessage] = useState("");

  // Fetch notes when the leadId changes
  useEffect(() => {
    if (!leadId) return;

    fetch(`/api/notes?leadId=${leadId}`)
      .then((res) => res.json())
      .then(setNotes)
      .catch(console.error);
  }, [leadId]);

  // Add a new note
  const addNote = async () => {
    if (!leadId || (!behavior && !message.trim())) return;

    const newNote = { leadId, behavior, message };
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote),
    });

    if (res.ok) {
      const addedNote = await res.json();
      setNotes((prev) => [addedNote, ...prev]);
      setBehavior("");
      setMessage("");
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Existing Notes */}
      <div className="space-y-3">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">{note.message}</p>
              <p className="text-xs text-gray-500">Lead ID: {note.leadId}</p>
              {note.behavior && <p className="text-xs text-gray-500">Behavior: {note.behavior}</p>}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No notes available.</p>
        )}
      </div>

      {/* Add New Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lead ID</label>
        <Input
          className="mt-1 w-full"
          placeholder="Enter Lead ID"
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Customer Behavior</label>
        <Select value={behavior} onValueChange={setBehavior}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select Behavior" />
          </SelectTrigger>
          <SelectContent>
            {behaviorOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Additional Message</label>
        <Textarea
          className="mt-1 w-full"
          rows={3}
          placeholder="Add details about the interaction..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button className="mt-3 w-full" onClick={addNote}>
          Add Note
        </Button>
      </div>
    </div>
  );
};

export default Notes;
