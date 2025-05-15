"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isWithinInterval } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit, Trash2, Calendar as CalendarIcon, Clock, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) => format(date, formatStr, { locale: enUS }),
  parse: (value: string, formatStr: string) => parse(value, formatStr, new Date(), { locale: enUS }),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Task {
  id: string;
  subAccountId: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  start: Date;
  end: Date;
  completed?: boolean;
}

const priorityColors = {
  Low: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
  High: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
};

export default function CalendarPage() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const subAccountId = pathParts[2];
  const [events, setEvents] = useState<Task[]>([]);
  const [view, setView] = useState<View>(Views.MONTH);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "Low" | "Medium" | "High">("all");

  const [newTask, setNewTask] = useState<Omit<Task, "id" | "subAccountId">>({
    title: "",
    description: "",
    priority: "Medium",
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    completed: false,
  });

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/agendas?subaccountId=${subAccountId}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.agendas.map((task: any) => ({
          ...task,
          start: new Date(task.start),
          end: new Date(task.end),
          completed: task.completed || false,
        })));
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      toast.error("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, [subAccountId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    try {
      const res = await fetch("/api/agendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subAccountId,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          start: newTask.start.toISOString(),
          end: newTask.end.toISOString(),
          completed: newTask.completed,
        }),
      });
      
      if (res.ok) {
        setShowAddTask(false);
        setNewTask({
          title: "",
          description: "",
          priority: "Medium",
          start: new Date(),
          end: new Date(Date.now() + 60 * 60 * 1000),
          completed: false,
        });
        await fetchTasks();
        toast.success("Task added successfully");
      } else {
        throw new Error("Failed to add task");
      }
    } catch (err) {
      console.error("Error adding task:", err);
      toast.error("Error adding task");
    }
  };

  const updateTask = async (task: Task) => {
    if (!newTask.title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    try {
      const res = await fetch(`/api/agendas/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          start: newTask.start.toISOString(),
          end: newTask.end.toISOString(),
          completed: newTask.completed,
        }),
      });
      
      if (res.ok) {
        setSelectedTask(null);
        setShowAddTask(false);
        await fetchTasks();
        toast.success("Task updated successfully");
      } else {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error("Error updating task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/agendas/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setSelectedTask(null);
        await fetchTasks();
        toast.success("Task deleted successfully");
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("Error deleting task");
    }
  };

  const toggleTaskCompletion = async (task: Task) => {
    const updatedTask = { ...task, completed: !task.completed };
    try {
      const res = await fetch(`/api/agendas/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedTask,
          start: updatedTask.start.toISOString(),
          end: updatedTask.end.toISOString(),
        }),
      });
      
      if (res.ok) {
        setSelectedTask(updatedTask);
        await fetchTasks();
        toast.success(`Task marked as ${updatedTask.completed ? "completed" : "incomplete"}`);
      } else {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error("Error updating task");
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Apply status filter
      if (filter === "upcoming" && event.completed) return false;
      if (filter === "completed" && !event.completed) return false;
      
      // Apply priority filter
      if (priorityFilter !== "all" && event.priority !== priorityFilter) return false;
      
      return true;
    });
  }, [events, filter, priorityFilter]);

  const todayEvents = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    return filteredEvents.filter(event => 
      isWithinInterval(event.start, { start: startOfDay, end: endOfDay }) ||
      isWithinInterval(event.end, { start: startOfDay, end: endOfDay })
    );
  }, [filteredEvents]);

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      start: slotInfo.start,
      end: slotInfo.end,
      completed: false,
    });
    setShowAddTask(true);
  }, []);

  const eventStyleGetter = useCallback((event: Task) => {
    const backgroundColor = event.completed 
      ? "#e5e7eb" 
      : event.priority === "High" 
        ? "#fee2e2" 
        : event.priority === "Medium" 
          ? "#fef3c7" 
          : "#dcfce7";
    
    const borderColor = event.completed 
      ? "#9ca3af" 
      : event.priority === "High" 
        ? "#f87171" 
        : event.priority === "Medium" 
          ? "#fbbf24" 
          : "#4ade80";
    
    const style = {
      backgroundColor,
      borderRadius: '4px',
      border: `1px solid ${borderColor}`,
      color: event.completed ? "#6b7280" : "#1f2937",
      textDecoration: event.completed ? "line-through" : "none",
    };
    
    return { style };
  }, []);

  // Improved date/time handlers
  const handleStartDateChange = (date: Date) => {
    setNewTask(prev => ({
      ...prev,
      start: date,
      // Auto-adjust end date if it would be before start date
      end: prev.end < date ? new Date(date.getTime() + 60 * 60 * 1000) : prev.end
    }));
  };

  const handleEndDateChange = (date: Date) => {
    setNewTask(prev => ({
      ...prev,
      end: date,
      // Auto-adjust start date if it would be after end date
      start: prev.start > date ? new Date(date.getTime() - 60 * 60 * 1000) : prev.start
    }));
  };

  const handleTimeChange = (date: Date, type: 'start' | 'end') => {
    setNewTask(prev => {
      const newDate = new Date(prev[type]);
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
      
      return {
        ...prev,
        [type]: newDate,
        // Auto-adjust the other time if needed
        ...(type === 'start' && newDate > prev.end ? { end: new Date(newDate.getTime() + 60 * 60 * 1000) } : {}),
        ...(type === 'end' && newDate < prev.start ? { start: new Date(newDate.getTime() - 60 * 60 * 1000) } : {})
      };
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Task Calendar</h1>
            <p className="text-muted-foreground">
              Manage and organize your tasks efficiently
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button 
              onClick={() => {
                const now = new Date();
                setNewTask({
                  title: "",
                  description: "",
                  priority: "Medium",
                  start: now,
                  end: new Date(now.getTime() + 60 * 60 * 1000),
                  completed: false,
                });
                setShowAddTask(true);
              }}
              className="gap-2"
              size="sm"
            >
              <Plus size={16} />
              Add Task
            </Button>
            <Select 
              value={view} 
              onValueChange={(value) => setView(value as View)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Views.MONTH}>Month</SelectItem>
                <SelectItem value={Views.WEEK}>Week</SelectItem>
                <SelectItem value={Views.DAY}>Day</SelectItem>
                <SelectItem value={Views.AGENDA}>Agenda</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filter} 
              onValueChange={(value) => setFilter(value as any)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={priorityFilter} 
              onValueChange={(value) => setPriorityFilter(value as any)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="text-primary" />
                  <span>Calendar View</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[500px] w-full" />
                ) : (
                  <div className="dark:[&_.rbc-calendar]:bg-card dark:[&_.rbc-calendar]:text-foreground">
                    <Calendar
                      localizer={localizer}
                      events={filteredEvents}
                      startAccessor="start"
                      endAccessor="end"
                      selectable
                      views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                      view={view}
                      onView={setView}
                      date={currentDate}
                      onNavigate={setCurrentDate}
                      style={{ height: 500 }}
                      onSelectEvent={setSelectedTask}
                      onSelectSlot={handleSelectSlot}
                      eventPropGetter={eventStyleGetter}
                      components={{
                        event: ({ event }) => (
                          <div className="p-1 truncate">
                            <div className="flex items-center gap-1">
                              {event.completed && (
                                <span className="line-through">{event.title}</span>
                              )}
                              {!event.completed && event.title}
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "ml-1 text-xs",
                                  priorityColors[event.priority],
                                  event.completed && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                )}
                              >
                                {event.priority}
                              </Badge>
                            </div>
                          </div>
                        ),
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {todayEvents.map((task) => (
                      <div 
                        key={task.id} 
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors",
                          task.completed && "bg-muted"
                        )}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={cn(
                              "font-medium flex items-center gap-2",
                              task.completed && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                              {task.completed && <CheckCheck className="h-4 w-4 text-green-500" />}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(task.start, "h:mm a")} - {format(task.end, "h:mm a")}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              priorityColors[task.priority],
                              task.completed && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            )}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No tasks scheduled for today
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex flex-col items-center gap-1 h-auto py-2"
                    onClick={() => {
                      const now = new Date();
                      setNewTask({
                        title: "",
                        description: "",
                        priority: "Medium",
                        start: now,
                        end: new Date(now.getTime() + 60 * 60 * 1000),
                        completed: false,
                      });
                      setShowAddTask(true);
                    }}
                  >
                    <Clock className="h-4 w-4" />
                    <span>1-hour Task</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex flex-col items-center gap-1 h-auto py-2"
                    onClick={() => {
                      const now = new Date();
                      const tomorrow = new Date(now);
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(9, 0, 0, 0);
                      
                      setNewTask({
                        title: "",
                        description: "",
                        priority: "Medium",
                        start: tomorrow,
                        end: new Date(tomorrow.getTime() + 60 * 60 * 1000),
                        completed: false,
                      });
                      setShowAddTask(true);
                    }}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span>Tomorrow</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Task Details</span>
              <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={selectedTask?.completed ? "default" : "outline"} 
                      size="icon" 
                      onClick={() => toggleTaskCompletion(selectedTask!)}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectedTask?.completed ? "Mark as incomplete" : "Mark as complete"}
                  </TooltipContent>
                </Tooltip>
                </TooltipProvider>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => {
                    setNewTask({
                      title: selectedTask?.title || "",
                      description: selectedTask?.description || "",
                      priority: selectedTask?.priority || "Medium",
                      start: selectedTask?.start || new Date(),
                      end: selectedTask?.end || new Date(),
                      completed: selectedTask?.completed || false,
                    });
                    setSelectedTask(null);
                    setShowAddTask(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => selectedTask && deleteTask(selectedTask.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className={cn(
                  "text-lg font-semibold flex items-center gap-2",
                  selectedTask.completed && "line-through text-muted-foreground"
                )}>
                  {selectedTask.title}
                  {selectedTask.completed && <CheckCheck className="h-4 w-4 text-green-500" />}
                </h3>
                <div className="flex gap-2 mt-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      priorityColors[selectedTask.priority],
                      selectedTask.completed && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    )}
                  >
                    {selectedTask.priority} Priority
                  </Badge>
                  <Badge variant="outline">
                    {Math.round((selectedTask.end.getTime() - selectedTask.start.getTime()) / (60 * 60 * 1000))} hours
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-muted-foreground mt-1 whitespace-pre-line">
                  {selectedTask.description || "No description provided"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <p className="text-muted-foreground mt-1">
                    {format(selectedTask.start, "MMM d, yyyy")}
                  </p>
                  <p className="text-muted-foreground">
                    {format(selectedTask.start, "h:mm a")}
                  </p>
                </div>
                <div>
                  <Label>End Time</Label>
                  <p className="text-muted-foreground mt-1">
                    {format(selectedTask.end, "MMM d, yyyy")}
                  </p>
                  <p className="text-muted-foreground">
                    {format(selectedTask.end, "h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Task Modal */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedTask ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTask.start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newTask.start, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.start}
                      onSelect={(date) => date && handleStartDateChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Start Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {format(newTask.start, "h:mm a")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-2">
                      <div className="grid gap-1">
                        {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((hour) => (
                          <Button
                            key={hour}
                            variant="ghost"
                            className="justify-start"
                            onClick={() => {
                              const newDate = new Date(newTask.start);
                              newDate.setHours(hour);
                              newDate.setMinutes(0);
                              handleTimeChange(newDate, 'start');
                            }}
                          >
                            {format(new Date(0, 0, 0, hour), "h:mm a")}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTask.end && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newTask.end, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.end}
                      onSelect={(date) => date && handleEndDateChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>End Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {format(newTask.end, "h:mm a")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-2">
                      <div className="grid gap-1">
                        {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => (
                          <Button
                            key={hour}
                            variant="ghost"
                            className="justify-start"
                            onClick={() => {
                              const newDate = new Date(newTask.end);
                              newDate.setHours(hour);
                              newDate.setMinutes(0);
                              handleTimeChange(newDate, 'end');
                            }}
                          >
                            {format(new Date(0, 0, 0, hour), "h:mm a")}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddTask(false);
                if (selectedTask) {
                  setSelectedTask(null);
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={selectedTask ? () => updateTask({ ...selectedTask, ...newTask } as Task) : addTask}
              disabled={!newTask.title.trim()}
            >
              {selectedTask ? "Update Task" : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}