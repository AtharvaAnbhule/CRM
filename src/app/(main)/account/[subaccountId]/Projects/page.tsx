"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader , DialogDescription , DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/common/FileUpload";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Check, ExternalLink, Github , Plus, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useParams, usePathname } from "next/navigation";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from "sonner";



interface Bug {
  id: string;
  title: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
}





export default function Projects() {

const pathname = usePathname();
const pathParts = pathname.split("/");
const subaccountId = pathParts[2]; // assuming the URL is /company/<agencyId>/billing/checkout
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugDescription, setNewBugDescription] = useState('');

  const [openModal, setOpenModal] = useState(false);


  // Add Bug function

const addBug = async () => {
  if (!newBugTitle || !newBugDescription) {
    toast.success("Success");
    return;
  }

  try {
    const res = await fetch(`/api/bugs`, {
      method: 'POST',
      body: JSON.stringify({
        title: newBugTitle,
        description: newBugDescription,
        projectId: subaccountId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to add bug');
    }

    toast.success("Bug Added Successfully.");

    setNewBugTitle('');
    setNewBugDescription('');
    setOpenModal(false);
    fetchBugs();
  } catch (error) {
    console.error(error);
    toast.error("Error");
  }
};


  const fetchBugs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bugs?projectId=${subaccountId}`);
      const data = await res.json();
      setBugs(data);
    } catch (error) {
      console.error(error);
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subaccountId) {
      fetchBugs();
    }
  }, [subaccountId]);

  const resolveBug = async (bugId: string) => {
    try {
      const res = await fetch(`/api/bugs/${bugId}`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        throw new Error('Failed to resolve bug');
      }

      toast.success("Success");

      fetchBugs();
    } catch (error) {
      console.error(error);
      toast.error("Error");
    }
  };
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false); // 🔥 Sidebar State
  const [selectedProject, setSelectedProject] = useState(null); // 🔥 Store Selected Project

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    liveLink: "",
    githubUrl: "",
    duration: "",
    startDate: "",
    priority: "",
    tasks: 0,
    activeTasks: 0,
    image: "",
    projectId:subaccountId,
    assignees: [],
  });
  const [editingProject, setEditingProject] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);


  const fetchEmployees = async () => {
    try {
      const res = await fetch(`/api/employees?subaccountId=${subaccountId}`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();


      setEmployees(data);
       

     
    } catch (err) {
      console.error("Error fetching employees:", err);
    } 
  };

  useEffect(() => {
    fetchProjects();
fetchEmployees() ; 
  }, []);
 //@ts-ignore
  function openProjectDetails(project) {
    setSelectedProject(project);
    setDetailsOpen(true);
  }

  async function fetchProjects() {
    try {
      const res = await fetch(`/api/projects?subAccountId=${subaccountId}`, {
        method: 'GET', // Ensure it's using GET method
      });
  
      if (!res.ok) throw new Error("Failed to fetch");
  
      const data = await res.json();
      setProjects(data); // Assuming you have a state to hold your projects
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    const method = editingProject ? "PUT" : "POST";
     //@ts-ignore
    const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save project");
      setModalOpen(false);
       //@ts-ignore
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  }

  async function handleDelete() {
    if (!deleteProjectId) return;
    try {
      const res = await fetch(`/api/projects/${deleteProjectId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }


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
  
  


  const onAssignEmployees = () => {
     //@ts-ignore
    if (!selectedEmployee || selectedProject.assignees.some(emp => emp.id === selectedEmployee)) {
      return toast.error('Employee is already assigned to this project.');
    }
    try{
    fetch('/api/assign-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
       //@ts-ignore
      body: JSON.stringify({ projectId: selectedProject.id, employeeId: selectedEmployee }),
    })
      .then(response => response.json())
      .then(() => {
        setSelectedEmployee(null);
        toast.success("Employee assigned succesfully.") ; 
      });
    } catch { 
      toast.error("Something went wrong!") ; 
    }
  };

  function openEditModal(project: any) {
    setEditingProject(project);
    setFormData({
      ...project,
      startDate: project.startDate.split("T")[0],
    });
    setModalOpen(true);
  }

  function openDeleteModal(id: any) {
    setDeleteProjectId(id);
    setDeleteModalOpen(true);
  }
 
  return (
    <div className="p-8 dark:bg-gray-900 min-h-screen dark:text-white">
    <h1 className="text-3xl font-bold mb-2">Manage Your Projects</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Create, edit, and manage all your projects efficiently.
    </p>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button className="bg-violet-500 hover:bg-violet-700 text-white px-3 py-3 mb-4 flex gap-2 rounded-lg" onClick={()=>setEditingProject(false)}><Plus />Create Project</Button>
        </DialogTrigger>
        <DialogContent className="dark:bg-gray-800 p-6 w-[600px] dark:text-white">
          <DialogTitle className="text-lg font-bold">{editingProject ? "Edit Project" : "Create Project"}</DialogTitle>
          <form onSubmit={handleSubmit}>
            {/* Image Upload */}
            <FileUpload
              value={formData.image}
              onChange={(uploadedUrl) => setFormData({ ...formData, image: uploadedUrl || "" })}
              endpoint="media"
            /> 
            
 
            <Input className="mb-2 dark:bg-gray-700 dark:text-white" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          
            <Input className="mb-2 dark:bg-gray-700 dark:text-white" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
       
            <Input className="mb-2 dark:bg-gray-700 dark:text-white" placeholder="Github Url" value={formData.githubUrl} onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })} required />
             
            <Input className="mb-2 dark:bg-gray-700 dark:text-white" placeholder="Live Link" value={formData.liveLink} onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })} required />
        
            <Input className="mb-2 dark:bg-gray-700 dark:text-white" placeholder="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} required />
            <h1> Tasks</h1>
            <Input className="mb-2 dark:bg-gray-700 dark:text-white" placeholder="Tasks" type="number" value={formData.tasks} onChange={(e) => setFormData({ ...formData, tasks: Number(e.target.value) })} required />
            <h1> Active Tasks</h1>
            <Input className="mb-2 dark:bg-gray-700 dark:text-white" placeholder="Active Tasks" type="number" value={formData.activeTasks} onChange={(e) => setFormData({ ...formData, activeTasks: Number(e.target.value) })} required />
            <h1> Date of establishment</h1>
            <Input className="mb-2 dark:bg-gray-700 dark:text-white" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />

            <div className="flex justify-end">
              <Button type="button" className="bg-gray-600 text-white px-4 py-2 rounded mr-2" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-violet-500 text-white px-4 py-2 rounded" >{editingProject ? "Update" : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="dark:bg-gray-800 p-6 w-[400px] dark:text-white">
          <DialogTitle className="text-lg font-bold">Delete Project</DialogTitle>
          <p className="text-gray-400 mb-4">Are you sure you want to delete this project? This action cannot be undone.</p>
          <div className="flex justify-end">
            <Button className="dark:bg-gray-600 dark:text-white px-4 py-2 rounded mr-2" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="dark:bg-gray-800 dark:text-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="p-0 " onClick={() => openProjectDetails(project)}>
              {project.image ? (
                <Image src={project.image} alt={project.title} width={400} height={200} className="w-full h-48 object-cover" />
              ) : (
                <div className="h-48 dark:bg-gray-700 dark:text-white flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <h2 className="font-bold text-lg text-gray-400">{project.title}</h2>
              <p className="dark:text-white-900">{project.description}</p>
              <p className="dark:text-white-900">Priority: {project.priority}</p>
              <p className="dark:text-white-900">Tasks: {project.tasks} | Active: {project.activeTasks}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button className="bg-violet-500 text-white px-3 py-1 rounded mr-2" onClick={() => openEditModal(project) }>Edit</Button>
              <Button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => openDeleteModal(project.id)}>Delete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
      <SheetContent
        side="right"
        className="dark:bg-gray-900 bg-white overflow-y-auto dark:text-white p-6 w-full sm:max-w-[700px] h-[100vh] rounded-l-xl shadow-2xl"
      >
        <div className="flex flex-col gap-4">
          {/* Image */}
          {selectedProject?.image && (
            <img
              src={selectedProject.image}
              alt={selectedProject.title}
              className="w-full h-48 object-cover rounded-xl shadow-md"
            />
          )}
    
          {/* Title & Description */}
          <div>
            <h2 className="text-2xl font-bold">{selectedProject?.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedProject?.description}
            </p>
          </div>
    
          {/* Stats Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-600 text-white">Tasks: {selectedProject?.tasks}</Badge>
            <Badge className="bg-red-600 text-white">Active: {selectedProject?.activeTasks}</Badge>
            <Badge className="bg-gray-700 text-white">
              Date: {new Date().toLocaleDateString()}
            </Badge>
          </div>
    
          {/* Assigned Employees Table */}
          {selectedProject?.assignees?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Assigned Employees:
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProject.assignees.map((employee, index) => (
                      <TableRow key={index}>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={employee.image || "https://via.placeholder.com/40"}
                              alt={employee.name}
                            />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
    
          {/* Assign Employee Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Assign Employee:
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                list="employee-list"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                placeholder="Enter Employee ID"
                className="w-full sm:max-w-xs"
              />
              <datalist id="employee-list">
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </datalist>
              <Button
                onClick={onAssignEmployees}
                disabled={!selectedEmployee}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <UserPlus size={18} /> Assign
              </Button>
            </div>
          </div>
    
          {/* Links */} 
     
          {(selectedProject?.liveLink || selectedProject?.githubUrl) && (
            <div className="flex flex-wrap gap-3 mt-4">
  
              {selectedProject?.liveLink && (
                <Button
                  asChild
                  className="bg-violet-700 hover:bg-violet-800 text-white flex flex-col items-center gap-2"
                >
                  <a
                    href={
                      selectedProject.liveLink.startsWith("http")
                        ? selectedProject.liveLink
                        : `https://${selectedProject.liveLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={18} /> 
                  </a>
                </Button>
              )}
              {selectedProject?.githubUrl && (
                <Button
                  asChild
                  className="bg-violet-700 hover:bg-violet-800 text-white flex items-center gap-2"
                >
                  <a
                    href={
                      selectedProject.githubUrl.startsWith("http")
                        ? selectedProject.githubUrl
                        : `https://${selectedProject.githubUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={18} /> 
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Project Bugs</h1>

      {/* Add Bug Button */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Bug
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bug</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Bug Title"
              value={newBugTitle}
              onChange={(e) => setNewBugTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            
            <textarea
              placeholder="Bug Description"
              value={newBugDescription}
              onChange={(e) => setNewBugDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button onClick={addBug}>Add Bug</Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bugs.map((bug) => (
              <TableRow key={bug.id} className="hover:bg-gray-100 cursor-pointer">
                <TableCell>{bug.title}</TableCell>
                <TableCell>{bug.description}</TableCell>
                <TableCell>
                  <span className={bug.isResolved ? 'text-green-500' : 'text-red-500'}>
                    {bug.isResolved ? 'Resolved' : 'Unresolved'}
                  </span>
                </TableCell>
                <TableCell>{new Date(bug.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {!bug.isResolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                      onClick={() => resolveBug(bug.id)}
                    >
                      <Check className="mr-2" />
                      Resolve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
      </SheetContent>
    </Sheet>
    
    </div>
  );
}
