"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  X,
  GripVertical,
  Calendar as CalendarIcon,
  Flag,
  ChevronDown,
  Clock,
  User,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/app/(main)/Meeting/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

// Types
type Priority = "Low" | "Medium" | "High" | "Critical";
type TaskStatus = "To Do" | "In Progress" | "Completed" | string;

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  start: string;
  end: string;
  completed: boolean;
  subaccountId: string;
  createdAt: string;
  assignee?: string;
  progress?: number;
  tags?: string[];
}

interface ColumnType {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

// Enhanced columns with professional colors
const DEFAULT_COLUMNS: ColumnType[] = [
  {
    id: "todo",
    title: "To Do",
    color:
      "border-blue-500/20 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10",
    tasks: [],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color:
      "border-amber-500/20 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10",
    tasks: [],
  },
  {
    id: "completed",
    title: "Completed",
    color:
      "border-emerald-500/20 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10",
    tasks: [],
  },
];

// Priority colors with professional contrast
const priorityColors = {
  Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  High: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const priorityIcons = {
  Low: <Flag className="h-3 w-3 text-green-500" />,
  Medium: <Flag className="h-3 w-3 text-amber-500" />,
  High: <Flag className="h-3 w-3 text-orange-500" />,
  Critical: <Flag className="h-3 w-3 text-red-500" />,
};

// Enhanced Task Card Component with more information
const TaskCard = ({ task, onClick }: { task: Task; onClick: () => void }) => {
  const daysLeft = Math.ceil(
    (new Date(task.end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      className={cn(
        "p-4 mb-3 cursor-pointer transition-all hover:shadow-md border rounded-lg group",
        task.completed ? "opacity-80" : "opacity-100"
      )}
      onClick={onClick}>
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-medium flex-1 text-sm line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center gap-1">
          {task.assignee && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 h-6">
              <User className="h-3 w-3 mr-1" />
              {task.assignee}
            </Badge>
          )}
          <Badge
            className={cn(
              "text-xs px-2 py-0.5 h-6 flex items-center gap-1",
              priorityColors[task.priority]
            )}>
            {priorityIcons[task.priority]}
            {task.priority}
          </Badge>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
          {task.description}
        </p>
      )}

      {task.progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium">{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="h-2" />
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{format(new Date(task.end), "MMM d, yyyy")}</span>
          </div>
          <span
            className={cn(
              "text-xs",
              daysLeft <= 1
                ? "text-red-500"
                : daysLeft <= 3
                  ? "text-amber-500"
                  : "text-muted-foreground"
            )}>
            {daysLeft <= 0 ? "Overdue" : `${Math.ceil(daysLeft)}d left`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.tags?.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs px-2 py-0.5 h-5">
              {tag}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className={cn(
              "text-xs h-6",
              task.completed
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : ""
            )}>
            {task.completed && <CheckCircle className="h-3 w-3 mr-1" />}
            {task.status}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

// Draggable Task Card with subtle handle
const DraggableTaskCard = ({
  task,
  index,
  onClick,
}: {
  task: Task;
  index: number;
  onClick: () => void;
}) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-3">
          <div className="flex items-start gap-1 group">
            <div
              {...provided.dragHandleProps}
              className="h-full py-4 px-1 -ml-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
              <GripVertical className="h-4 w-4" />
            </div>
            <TaskCard task={task} onClick={onClick} />
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Enhanced Column Component with stats and actions
const Column = ({
  column,
  tasks,
  onTaskClick,
  onAddTask,
}: {
  column: ColumnType;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
}) => {
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="w-96 shrink-0">
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-base flex items-center gap-2">
            {column.title}
            <Badge variant="outline" className="px-2 py-0.5 text-xs h-6">
              {tasks.length}
            </Badge>
          </h3>
          {tasks.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {progress}% complete
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8"
          onClick={() => onAddTask(column.id)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "min-h-[200px] rounded-lg p-3 border-2",
              column.color
            )}>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
                <Plus className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No tasks in this column
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs h-8"
                  onClick={() => onAddTask(column.id)}>
                  Add Task
                </Button>
              </div>
            ) : (
              <>
                {tasks.map((task, index) => (
                  <DraggableTaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onClick={() => onTaskClick(task)}
                  />
                ))}
                {provided.placeholder}
              </>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

// Enhanced Add Task Modal with more fields
const AddTaskModal = ({
  open,
  onOpenChange,
  columnId,
  columns,
  onAddTask,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnId: string;
  columns: ColumnType[];
  onAddTask: (task: Task) => void;
}) => {
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: columns.find((c) => c.id === columnId)?.title || "To Do",
    priority: "Medium",
    start: new Date().toISOString(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    progress: 0,
    assignee: "",
    tags: [],
  });

  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !newTask.tags?.includes(newTag.trim())) {
      setNewTask({
        ...newTask,
        tags: [...(newTask.tags || []), newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask({
      ...newTask,
      tags: newTask.tags?.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = () => {
    if (!newTask.title) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status || "To Do",
      priority: newTask.priority || "Medium",
      start: newTask.start || new Date().toISOString(),
      end: newTask.end || new Date().toISOString(),
      completed: newTask.completed || false,
      subaccountId: "",
      createdAt: new Date().toISOString(),
      progress: newTask.progress || 0,
      assignee: newTask.assignee,
      tags: newTask.tags,
    };

    onAddTask(task);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              placeholder="Task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              placeholder="Task description"
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={newTask.status}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, status: value })
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.title}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, priority: value as Priority })
                }>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    <SelectValue placeholder="Select priority" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low" className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Low
                  </SelectItem>
                  <SelectItem
                    value="Medium"
                    className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    Medium
                  </SelectItem>
                  <SelectItem value="High" className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    High
                  </SelectItem>
                  <SelectItem
                    value="Critical"
                    className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    Critical
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Input
                value={newTask.assignee}
                onChange={(e) =>
                  setNewTask({ ...newTask, assignee: e.target.value })
                }
                placeholder="Assign to..."
              />
            </div>

            <div className="space-y-2">
              <Label>Progress</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newTask.progress}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      progress: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-20"
                />
                <Progress
                  value={newTask.progress || 0}
                  className="h-2 flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newTask.start && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.start ? (
                      format(new Date(newTask.start), "MMM d, yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(newTask.start || new Date())}
                    onSelect={(date) =>
                      setNewTask({
                        ...newTask,
                        start: date?.toISOString() || new Date().toISOString(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newTask.end && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.end ? (
                      format(new Date(newTask.end), "MMM d, yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(newTask.end || new Date())}
                    onSelect={(date) =>
                      setNewTask({
                        ...newTask,
                        end: date?.toISOString() || new Date().toISOString(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {newTask.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="flex items-center gap-1 pl-2 pr-1 py-0.5">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => handleRemoveTag(tag)}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}>
                Add
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Task</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Task Detail Sidebar with more fields
const TaskDetailSidebar = ({
  task,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}) => {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !editedTask.tags?.includes(newTag.trim())) {
      setEditedTask({
        ...editedTask,
        tags: [...(editedTask.tags || []), newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTask({
      ...editedTask,
      tags: editedTask.tags?.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(editedTask);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const daysLeft = Math.ceil(
    (new Date(editedTask.end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-background shadow-lg border-l z-50 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Task Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={editedTask.title}
            onChange={(e) =>
              setEditedTask({ ...editedTask, title: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={editedTask.description || ""}
            onChange={(e) =>
              setEditedTask({ ...editedTask, description: e.target.value })
            }
            className="min-h-[150px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={editedTask.status}
              onValueChange={(value) =>
                setEditedTask({ ...editedTask, status: value })
              }>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_COLUMNS.map((column) => (
                  <SelectItem key={column.id} value={column.title}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={editedTask.priority}
              onValueChange={(value) =>
                setEditedTask({ ...editedTask, priority: value as Priority })
              }>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  <SelectValue placeholder="Select priority" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low" className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Low
                </SelectItem>
                <SelectItem value="Medium" className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  Medium
                </SelectItem>
                <SelectItem value="High" className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  High
                </SelectItem>
                <SelectItem
                  value="Critical"
                  className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Critical
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Input
              value={editedTask.assignee || ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask, assignee: e.target.value })
              }
              placeholder="Assign to..."
            />
          </div>

          <div className="space-y-2">
            <Label>Progress</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max="100"
                value={editedTask.progress || 0}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    progress: parseInt(e.target.value) || 0,
                  })
                }
                className="w-20"
              />
              <Progress
                value={editedTask.progress || 0}
                className="h-2 flex-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !editedTask.start && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editedTask.start ? (
                    format(new Date(editedTask.start), "MMM d, yyyy")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(editedTask.start)}
                  onSelect={(date) =>
                    setEditedTask({
                      ...editedTask,
                      start: date?.toISOString() || editedTask.start,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <div className="flex flex-col gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editedTask.end && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedTask.end ? (
                      format(new Date(editedTask.end), "MMM d, yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(editedTask.end)}
                    onSelect={(date) =>
                      setEditedTask({
                        ...editedTask,
                        end: date?.toISOString() || editedTask.end,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div
                className={cn(
                  "text-xs",
                  daysLeft <= 1
                    ? "text-red-500"
                    : daysLeft <= 3
                      ? "text-amber-500"
                      : "text-muted-foreground"
                )}>
                {daysLeft <= 0
                  ? "Overdue"
                  : `${Math.ceil(daysLeft)} days remaining`}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {editedTask.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="flex items-center gap-1 pl-2 pr-1 py-0.5">
                {tag}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => handleRemoveTag(tag)}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTag}
              disabled={!newTag.trim()}>
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Created</Label>
          <div className="text-sm text-muted-foreground">
            {format(new Date(editedTask.createdAt), "MMM d, yyyy 'at' h:mm a")}
            <span className="block text-xs mt-1">
              ({formatDistanceToNow(new Date(editedTask.createdAt))} ago)
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t flex gap-3">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1">
          {isDeleting ? "Deleting..." : "Delete Task"}
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

// Enhanced Main Kanban Board Component
export default function KanbanBoard() {
  const { toast } = useToast();
  const params = useParams();
  const subaccountId = params?.subaccountId as string;

  const [columns, setColumns] = useState<ColumnType[]>(DEFAULT_COLUMNS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [selectedColumnForAdd, setSelectedColumnForAdd] = useState("");

  // Fetch tasks from API
  useEffect(() => {
    if (!subaccountId) return;

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/agendas?subaccountId=${subaccountId}`
        );
        const data = await response.json();

        if (data.success && data.agendas) {
          const fetchedTasks: Task[] = data.agendas.map((agenda: any) => ({
            id: agenda.id,
            title: agenda.title,
            description: agenda.description,
            status: agenda.status || "To Do",
            priority: agenda.priority || "Medium",
            start: agenda.start,
            end: agenda.end,
            completed: agenda.completed || false,
            subaccountId: agenda.subaccountId,
            createdAt: agenda.createdAt,
            assignee: agenda.assignee,
            progress: agenda.progress,
            tags: agenda.tags || [],
          }));

          setTasks(fetchedTasks);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch tasks",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [subaccountId, toast]);

  // Group tasks by status
  useEffect(() => {
    if (tasks.length === 0) return;

    const newColumns = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.status === column.title),
    }));

    // Add any custom status columns
    const customStatuses = Array.from(
      new Set(tasks.map((t) => t.status))
    ).filter((status) => !columns.some((c) => c.title === status));

    if (customStatuses.length > 0) {
      customStatuses.forEach((status) => {
        newColumns.push({
          id: `column-${newColumns.length + 1}`,
          title: status,
          tasks: tasks.filter((t) => t.status === status),
          color:
            "border-gray-500/20 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/10",
        });
      });
    }

    setColumns(newColumns);
  }, [tasks]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    const newStatus = columns.find(
      (c) => c.id === destination.droppableId
    )?.title;
    if (!newStatus) return;

    const updatedTask = {
      ...task,
      status: newStatus,
      completed: newStatus === "Completed",
    };

    try {
      const response = await fetch(`/api/agendas/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));

      toast({
        title: "Task moved",
        description: `"${task.title}" moved to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move task",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const response = await fetch(`/api/agendas/${updatedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      setSelectedTask(updatedTask);

      toast({
        title: "Task updated",
        description: `"${updatedTask.title}" has been updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/agendas/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks(tasks.filter((t) => t.id !== taskId));
      setSelectedTask(null);

      toast({
        title: "Task deleted",
        description: "The task has been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
    toast({
      title: "Task created",
      description: `"${task.title}" has been added`,
    });
  };

  const handleAddTaskClick = (columnId: string) => {
    setSelectedColumnForAdd(columnId);
    setAddTaskModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-80 space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-background border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddTaskClick(columns[0].id)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full overflow-x-auto pb-4">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={column.tasks}
                onTaskClick={setSelectedTask}
                onAddTask={handleAddTaskClick}
              />
            ))}
          </div>
        </DragDropContext>
      </main>

      <AddTaskModal
        open={addTaskModalOpen}
        onOpenChange={setAddTaskModalOpen}
        columnId={selectedColumnForAdd}
        columns={columns}
        onAddTask={addTask}
      />

      {selectedTask && (
        <TaskDetailSidebar
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}
