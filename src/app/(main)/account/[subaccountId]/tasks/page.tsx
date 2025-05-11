"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
//@ts-ignore
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
   //@ts-ignore
  format: (date, formatStr) => format(date, formatStr, { locale: enUS }),
   //@ts-ignore
  parse: (value, formatStr) => parse(value, formatStr, new Date(), { locale: enUS }),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Task {
  id: string;
  subAccountId: string;
  title: string;
  description: string;
  priority: string;
  start: Date;
  end: Date;
}

export default function CalendarPage() {
    const pathname = usePathname();
  const pathParts = pathname.split("/");
  const subAccountId = pathParts[2]; // assuming the URL is /company/<agencyId>/billing/checkout
  const [events, setEvents] = useState<Task[]>([]);
  const [view, setView] = useState<View>("agenda");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    start: "",
    end: "",
  });

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/agendas?subaccountId=${subAccountId}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.agendas.map((task: any) => ({
          ...task,
          start: new Date(task.start),
          end: new Date(task.end),
        })));
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [subAccountId]);

  const addTask = async () => {
    try {
      const res = await fetch("/api/agendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subAccountId,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          start: new Date(newTask.start).toISOString(),
          end: new Date(newTask.end).toISOString(),
        }),
      });
      if (res.ok) {
        setShowAddTask(false);
        setNewTask({ title: "", description: "", priority: "Medium", start: "", end: "" });
        fetchTasks();
      }
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 "> 
    <h1 className="text-3xl font-bold mb-2">Manage Your Tasks</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Create, edit, and manage all your Tasks for your account efficiently.
    </p>
      <Card className="max-w-5xl mx-auto  dark:bg-white dark:text-black">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-blue-600 dark:text-blue-400">📅 Task Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            views={["month", "week", "day", "agenda"]}
            view={view}
            onView={setView}
            style={{ height: 500 }}
            onSelectEvent={(event) => {
              setSelectedTask(event);
            }}
            onSelectSlot={(slotInfo) => {
              setNewTask({
                title: "",
                description: "",
                priority: "Medium",
                start: slotInfo.start.toISOString(),
                end: slotInfo.end.toISOString(),
              });
              setShowAddTask(true);
            }}
          />
        </CardContent>
      </Card>

      {/* View Task Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-2">
              <p><strong>Title:</strong> {selectedTask.title}</p>
              <p><strong>Description:</strong> {selectedTask.description}</p>
              <p><strong>Priority:</strong> {selectedTask.priority}</p>
              <p><strong>Start:</strong> {format(selectedTask.start, "PPpp")}</p>
              <p><strong>End:</strong> {format(selectedTask.end, "PPpp")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Task Modal */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Start</Label>
                <Input type="datetime-local" value={newTask.start} onChange={(e) => setNewTask({ ...newTask, start: e.target.value })} />
              </div>
              <div className="flex-1">
                <Label>End</Label>
                <Input type="datetime-local" value={newTask.end} onChange={(e) => setNewTask({ ...newTask, end: e.target.value })} />
              </div>
            </div>
            <Button className="w-full" onClick={addTask}>Save Task</Button>
          </div>
        </DialogContent>
      </Dialog>

      {view === "agenda" && (
        <div className="mt-6 dark:text-white">
          <h2 className="text-xl font-semibold mb-2">Agenda (Unique Tasks)</h2>
          <div className="border rounded-md p-4 max-h-[300px] overflow-auto">
            {events.length > 0 ? (
              //@ts-ignore
              [...new Set(events.map((e) => e.id))].map((id) => {
                const task = events.find((e) => e.id === id);
                return (
                  <div key={task?.id} className="border-b pb-2 mb-2">
                    <h3 className="text-lg font-bold">{task?.title}</h3>
                    <p className="text-sm text-gray-600">{format(task!.start, "PPpp")} → {format(task!.end, "PPpp")}</p>
                    <p className="text-sm text-gray-800">{task?.description}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No tasks to show.</p>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}
