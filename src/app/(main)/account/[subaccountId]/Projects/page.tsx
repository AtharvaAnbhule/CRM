"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

// UI Components
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/common/FileUpload";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from "@/components/ui/progress";

// Charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

// Icons
import { Check, ExternalLink, Github, Plus, UserPlus, X, Edit, Trash2, Bug, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

// Types
interface Bug {
  id: string;
  title: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  liveLink: string;
  githubUrl: string;
  duration: string;
  startDate: string;
  priority: string;
  tasks: number;
  activeTasks: number;
  image: string;
  assignees: Employee[];
  progress?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Projects() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const subaccountId = pathParts[2];

  // State
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState({
    projects: false,
    bugs: false,
    employees: false,
    actions: false
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Modal states
  const [openBugModal, setOpenBugModal] = useState(false);
  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Form states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Form data
  const [newBug, setNewBug] = useState({
    title: "",
    description: ""
  });
  
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    liveLink: "",
    githubUrl: "",
    duration: "",
    startDate: "",
    priority: "medium",
    tasks: 0,
    activeTasks: 0,
    image: "",
    projectId: subaccountId,
    assignees: [],
  });

  // Fetch data functions
  const fetchBugs = useCallback(async () => {
    setLoading(prev => ({ ...prev, bugs: true }));
    try {
      const res = await fetch(`/api/bugs?projectId=${subaccountId}`);
      const data = await res.json();
      setBugs(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch bugs");
    } finally {
      setLoading(prev => ({ ...prev, bugs: false }));
    }
  }, [subaccountId]);

  const fetchEmployees = useCallback(async () => {
    setLoading(prev => ({ ...prev, employees: true }));
    try {
      const res = await fetch(`/api/employees?subaccountId=${subaccountId}`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  }, [subaccountId]);

  const fetchProjects = useCallback(async () => {
    setLoading(prev => ({ ...prev, projects: true }));
    try {
      const res = await fetch(`/api/projects?subAccountId=${subaccountId}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      // Calculate progress for each project
      const projectsWithProgress = data.map((project: Project) => ({
        ...project,
        progress: project.tasks > 0 ? Math.round((project.activeTasks / project.tasks) * 100) : 0
      }));
      setProjects(projectsWithProgress);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  }, [subaccountId]);

  // Load data on mount
  useEffect(() => {
    if (subaccountId) {
      fetchProjects();
      fetchEmployees();
      fetchBugs();
    }
  }, [subaccountId, fetchProjects, fetchEmployees, fetchBugs]);

  // Bug handlers
  const addBug = async () => {
    if (!newBug.title || !newBug.description) {
      toast.warning("Please fill all fields");
      return;
    }

    setLoading(prev => ({ ...prev, actions: true }));
    try {
      const res = await fetch(`/api/bugs`, {
        method: 'POST',
        body: JSON.stringify({
          title: newBug.title,
          description: newBug.description,
          projectId: subaccountId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to add bug');

      toast.success("Bug added successfully");
      setNewBug({ title: "", description: "" });
      setOpenBugModal(false);
      fetchBugs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add bug");
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const resolveBug = async (bugId: string) => {
    setLoading(prev => ({ ...prev, actions: true }));
    try {
      const res = await fetch(`/api/bugs/${bugId}`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error('Failed to resolve bug');

      toast.success("Bug resolved successfully");
      fetchBugs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to resolve bug");
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  // Project handlers
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, actions: true }));
    
    const method = editingProject ? "PUT" : "POST";
    const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });
      
      if (!res.ok) throw new Error(editingProject ? "Failed to update project" : "Failed to create project");

      toast.success(editingProject ? "Project updated successfully" : "Project created successfully");
      setOpenProjectModal(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(editingProject ? "Failed to update project" : "Failed to create project");
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    setLoading(prev => ({ ...prev, actions: true }));
    
    try {
      const res = await fetch(`/api/projects/${deleteProjectId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");

      toast.success("Project deleted successfully");
      setDeleteModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const onAssignEmployee = async () => {
    if (!selectedEmployee || !selectedProject) return;
    
    // Check if employee is already assigned
    if (selectedProject.assignees.some(emp => emp.id === selectedEmployee)) {
      toast.warning("Employee is already assigned to this project");
      return;
    }

    setLoading(prev => ({ ...prev, actions: true }));
    try {
      const res = await fetch('/api/assign-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: selectedProject.id, 
          employeeId: selectedEmployee 
        }),
      });

      if (!res.ok) throw new Error('Failed to assign employee');

      toast.success("Employee assigned successfully");
      setSelectedEmployee("");
      
      // Refresh project details
      const updatedProjectRes = await fetch(`/api/assign-employee/${selectedProject.id}`);
      if (updatedProjectRes.ok) {
        const updatedProject = await updatedProjectRes.json();
        setSelectedProject(updatedProject);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign employee");
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  // Helper functions
  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsOpen(true);
  };

  const openEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      liveLink: project.liveLink,
      githubUrl: project.githubUrl,
      duration: project.duration,
      startDate: project.startDate.split("T")[0],
      priority: project.priority,
      tasks: project.tasks,
      activeTasks: project.activeTasks,
      image: project.image,
      projectId: subaccountId,
      assignees: project.assignees,
    });
    setOpenProjectModal(true);
  };

  const openDeleteProjectModal = (id: string) => {
    setDeleteProjectId(id);
    setDeleteModalOpen(true);
  }; 
  useEffect(() => {
     //@ts-ignore
    if (selectedProject?.id) {
       //@ts-ignore
      fetch(`/api/assign-employee/${selectedProject.id}`)
        .then(response => response.json())
        .then(data => {
          setSelectedProject(prev => ({
             //@ts-ignore
            ...prev,
            assignees: data
          }));
        });
    }
     //@ts-ignore
  }, [selectedProject?.id]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Chart data
  const projectStatusData = [
    { name: 'Completed', value: projects.filter(p => p.progress === 100).length },
    { name: 'In Progress', value: projects.filter(p => p.progress > 0 && p.progress < 100).length },
    { name: 'Not Started', value: projects.filter(p => p.progress === 0).length },
  ];

  const priorityDistributionData = [
    { name: 'High', value: projects.filter(p => p.priority === 'high').length },
    { name: 'Medium', value: projects.filter(p => p.priority === 'medium').length },
    { name: 'Low', value: projects.filter(p => p.priority === 'low').length },
  ];

  const taskCompletionData = projects.map(project => ({
    name: project.title,
    completed: project.tasks - project.activeTasks,
    remaining: project.activeTasks,
  }));

  return (
    <div className="p-4 md:p-6 min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Project Management</h1>
        <p className="text-muted-foreground">
          Create, manage, and track all your projects in one place
        </p>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Project Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityDistributionData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <h3 className="text-2xl font-bold">{projects.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Plus className="text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Tasks</p>
              <h3 className="text-2xl font-bold">
                {projects.reduce((sum, project) => sum + project.activeTasks, 0)}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-500/10">
              <Check className="text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <h3 className="text-2xl font-bold">
                {projects.reduce((sum, project) => sum + project.tasks, 0)}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-500/10">
              <CalendarIcon className="text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Bugs</p>
              <h3 className="text-2xl font-bold">
                {bugs.filter(bug => !bug.isResolved).length}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-red-500/10">
              <Bug className="text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Dialog open={openProjectModal} onOpenChange={setOpenProjectModal}>
            <DialogTrigger asChild>
              <Button 
                className="gap-2" 
                onClick={() => {
                  setEditingProject(null);
                  setProjectForm({
                    title: "",
                    description: "",
                    liveLink: "",
                    githubUrl: "",
                    duration: "",
                    startDate: "",
                    priority: "medium",
                    tasks: 0,
                    activeTasks: 0,
                    image: "",
                    projectId: subaccountId,
                    assignees: [],
                  });
                }}
              >
                <Plus size={18} /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[75%] h-[75%] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? "Edit Project" : "Create New Project"}
                </DialogTitle>
                <DialogDescription>
                  {editingProject ? "Update your project details" : "Fill in the details to create a new project"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProjectSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div className="flex flex-col gap-2">
                      <Label>Project Image</Label>
                      <FileUpload
                        value={projectForm.image}
                        onChange={(uploadedUrl) => 
                          setProjectForm({ ...projectForm, image: uploadedUrl || "" })
                        }
                        endpoint="media"
                      />
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Project title"
                        value={projectForm.title}
                        onChange={(e) => 
                          setProjectForm({ ...projectForm, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Project description"
                        value={projectForm.description}
                        onChange={(e) => 
                          setProjectForm({ ...projectForm, description: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Links */}
                    <div className="grid gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="githubUrl">GitHub URL</Label>
                        <Input
                          id="githubUrl"
                          placeholder="https://github.com/..."
                          value={projectForm.githubUrl}
                          onChange={(e) => 
                            setProjectForm({ ...projectForm, githubUrl: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="liveLink">Live URL</Label>
                        <Input
                          id="liveLink"
                          placeholder="https://example.com"
                          value={projectForm.liveLink}
                          onChange={(e) => 
                            setProjectForm({ ...projectForm, liveLink: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Priority and Dates */}
                    <div className="grid gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="priority">Priority *</Label>
                        <Select
                          value={projectForm.priority}
                          onValueChange={(value) => 
                            setProjectForm({ ...projectForm, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={projectForm.startDate}
                          onChange={(e) => 
                            setProjectForm({ ...projectForm, startDate: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="grid gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="tasks">Total Tasks *</Label>
                        <Input
                          id="tasks"
                          type="number"
                          min="0"
                          value={projectForm.tasks}
                          onChange={(e) => 
                            setProjectForm({ ...projectForm, tasks: Number(e.target.value) })
                          }
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="activeTasks">Active Tasks *</Label>
                        <Input
                          id="activeTasks"
                          type="number"
                          min="0"
                          max={projectForm.tasks}
                          value={projectForm.activeTasks}
                          onChange={(e) => 
                            setProjectForm({ ...projectForm, activeTasks: Number(e.target.value) })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpenProjectModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading.actions}>
                    {loading.actions ? "Processing..." : editingProject ? "Update Project" : "Create Project"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Projects Grid */}
      {loading.projects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader 
                className="p-0 cursor-pointer" 
                onClick={() => openProjectDetails(project)}
              >
                {project.image ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-muted flex items-center justify-center rounded-t-lg">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {project.description}
                </p>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Tasks: {project.tasks}</span>
                  <span>Active: {project.activeTasks}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openEditProjectModal(project)}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => openDeleteProjectModal(project.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No projects yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by creating a new project
          </p>
          <Dialog open={openProjectModal} onOpenChange={setOpenProjectModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Project
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}

      {/* Project Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full sm:max-w-[700px] overflow-y-auto">
          {selectedProject && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <SheetTitle className="text-2xl">{selectedProject.title}</SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.description}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setDetailsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </SheetHeader>

              {/* Project Image */}
              {selectedProject.image && (
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <Image
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <p className="font-medium capitalize">{selectedProject.priority}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {new Date(selectedProject.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="font-medium">{selectedProject.tasks}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <p className="font-medium">{selectedProject.activeTasks}</p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium">Project Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.progress}%
                  </p>
                </div>
                <Progress value={selectedProject.progress} className="h-2" />
              </div>

              {/* Links */}
              {(selectedProject.liveLink || selectedProject.githubUrl) && (
                <div>
                  <p className="text-sm font-medium mb-2">Project Links</p>
                  <div className="flex gap-2">
                    {selectedProject.githubUrl && (
                      <Button asChild variant="outline">
                        <a
                          href={
                            selectedProject.githubUrl.startsWith("http")
                              ? selectedProject.githubUrl
                              : `https://${selectedProject.githubUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Github className="h-4 w-4" /> GitHub
                        </a>
                      </Button>
                    )}
                    {selectedProject.liveLink && (
                      <Button asChild variant="outline">
                        <a
                          href={
                            selectedProject.liveLink.startsWith("http")
                              ? selectedProject.liveLink
                              : `https://${selectedProject.liveLink}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" /> Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Assigned Employees */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium">Assigned Team</p>
                  <div className="flex gap-2">
                    <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={onAssignEmployee}
                      disabled={!selectedEmployee || loading.actions}
                    >
                      <UserPlus className="h-4 w-4 mr-2" /> Assign
                    </Button>
                  </div>
                </div>

                {selectedProject?.assignees?.length > 0 ? (
                  <div className="border rounded-lg divide-y">
                    {selectedProject.assignees.map((employee) => (
                      <div key={employee.id} className="p-3 flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee.image} />
                          <AvatarFallback>
                            {employee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 text-center text-muted-foreground">
                    No team members assigned yet
                  </div>
                )}
              </div>

              {/* Bugs Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium">Project Bugs</p>
                  <Dialog open={openBugModal} onOpenChange={setOpenBugModal}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Add Bug
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Report New Bug</DialogTitle>
                        <DialogDescription>
                          Provide details about the bug youve encountered
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="bug-title" className="text-right">
                            Title *
                          </Label>
                          <Input
                            id="bug-title"
                            placeholder="Bug title"
                            value={newBug.title}
                            onChange={(e) =>
                              setNewBug({ ...newBug, title: e.target.value })
                            }
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="bug-description" className="text-right">
                            Description *
                          </Label>
                          <Textarea
                            id="bug-description"
                            placeholder="Detailed description of the bug"
                            value={newBug.description}
                            onChange={(e) =>
                              setNewBug({ ...newBug, description: e.target.value })
                            }
                            className="col-span-3"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setOpenBugModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={addBug}
                          disabled={loading.actions}
                        >
                          {loading.actions ? "Submitting..." : "Report Bug"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {loading.bugs ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ) : bugs.length > 0 ? (
                  <div className="border rounded-lg divide-y">
                    {bugs.map((bug) => (
                      <div key={bug.id} className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium">{bug.title}</h4>
                          {!bug.isResolved && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => resolveBug(bug.id)}
                              disabled={loading.actions}
                            >
                              <Check className="h-4 w-4 mr-2" /> Resolve
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {bug.description}
                        </p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {new Date(bug.createdAt).toLocaleDateString()}
                          </span>
                          <span className={bug.isResolved ? "text-green-500" : "text-red-500"}>
                            {bug.isResolved ? "Resolved" : "Unresolved"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 text-center text-muted-foreground">
                    No bugs reported yet
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteProject}
                disabled={loading.actions}
              >
                {loading.actions ? "Deleting..." : "Delete Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}