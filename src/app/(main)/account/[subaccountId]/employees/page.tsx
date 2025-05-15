"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/common/FileUpload";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Trash, Edit, Calendar, Clock, User, Mail, Phone, MapPin, Cake, Briefcase, Star, GitFork } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function EmployeeApp() {
  const pathname = usePathname();
  const subaccountId = pathname.split("/")[2];
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [markedToday, setMarkedToday] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    presentToday: 0,
    junior: 0,
    middle: 0,
    senior: 0
  });

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    gender: "Male",
    birthday: "",
    position: "",
    level: "Junior",
    location: "",
    projects: "",
    photo: "",
    phone: "",
    id1: "",
    subaccountId,
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (query.length < 2) {
      fetchEmployees();
      return;
    }

    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/employees/search?query=${query}`);
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayFetch = setTimeout(fetchEmployee, 300);
    return () => clearTimeout(delayFetch);
  }, [query]);

  const handleSelect = (employee) => {
    setSelectedEmployee(employee);
    setQuery(employee.name);
    setEmployees([]);
  };

  const calculateStats = (employees) => {
    const today = new Date().toDateString();
    let presentToday = 0;
    let junior = 0, middle = 0, senior = 0;

    employees.forEach(emp => {
      if (markedToday[emp.id]) presentToday++;
      if (emp.level === "Junior") junior++;
      else if (emp.level === "Middle") middle++;
      else if (emp.level === "Senior") senior++;
    });

    setStats({
      total: employees.length,
      presentToday,
      junior,
      middle,
      senior
    });
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`/api/employees?subaccountId=${subaccountId}`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setEmployees(data);

      const attendancePromises = data.map((emp) =>
        fetch(`/api/attendance?employeeId=${emp.id}`).then((res) => res.json())
      );

      const attendanceResults = await Promise.all(attendancePromises);
      const attendanceMap = {};

      data.forEach((emp, index) => {
        attendanceMap[emp.id] = attendanceResults[index] || [];
      });

      setAttendance(attendanceMap);
      calculateStats(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!subaccountId) {
      console.error("subaccountId is undefined!");
      return;
    }
    fetchEmployees();
  }, [subaccountId]);

  const handleDeleteEmployee = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
  
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
  
      if (!res.ok) throw new Error("Failed to delete employee");
  
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      calculateStats(employees.filter(emp => emp.id !== id));
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  const handleAddEmployee = async () => {
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEmployee, subaccountId }),
      });

      if (!res.ok) throw new Error("Failed to add employee");
      await fetchEmployees();
      setModalOpen(false);
      setNewEmployee({
        name: "",
        email: "",
        gender: "Male",
        birthday: "",
        position: "",
        level: "Junior",
        location: "",
        projects: "",
        photo: "",
        phone: "",
        id1: "",
        subaccountId,
      });
    } catch (err) {
      console.error("Error adding employee:", err);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      const res = await fetch(`/api/employees/${editEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEmployee),
      });

      if (!res.ok) throw new Error("Failed to update employee");

      setEmployees((prev) =>
        prev.map((emp) => (emp.id === editEmployee.id ? editEmployee : emp))
      );
      calculateStats(employees.map(emp => emp.id === editEmployee.id ? editEmployee : emp));
      setEditModalOpen(false);
    } catch (err) {
      console.error("Error updating employee:", err);
    }
  };

  const handleMarkAttendance = async (employeeId) => {
    if (markedToday[employeeId]) return;

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, subaccountId }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error(data?.error || "Failed to mark attendance");

      const attendanceRes = await fetch(`/api/attendance?employeeId=${employeeId}`);
      const updatedAttendance = await attendanceRes.json();

      setAttendance((prev) => ({ ...prev, [employeeId]: updatedAttendance }));
      setMarkedToday((prev) => ({ ...prev, [employeeId]: true }));
      localStorage.setItem(`attendance_${employeeId}_${new Date().toDateString()}`, "true");
      
      // Update stats
      calculateStats(employees);
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  };

  useEffect(() => {
    const today = new Date().toDateString();
    const initialMarked = {};

    employees.forEach((emp) => {
      if (localStorage.getItem(`attendance_${emp.id}_${today}`)) {
        initialMarked[emp.id] = true;
      }
    });

    setMarkedToday(initialMarked);
  }, [employees]);

  const calculateAttendancePercentage = (employeeId) => {
    const records = attendance[employeeId] || [];
    const today = new Date();
    const totalDaysPassed = today.getDate();

    const attendedDays = new Set(
      records?.map((record) => new Date(record.date).getDate())
    );

    const percentage =
      totalDaysPassed === 0
        ? 0
        : (attendedDays.size / totalDaysPassed) * 100;

    return percentage.toFixed(2);
  };

  const levelData = [
    { name: 'Junior', value: stats.junior },
    { name: 'Middle', value: stats.middle },
    { name: 'Senior', value: stats.senior },
  ];

  const attendanceData = employees.map(emp => ({
    name: emp.name,
    attendance: parseFloat(calculateAttendancePercentage(emp.id))
  }));

  const filteredEmployees = employees.filter(emp => {
    if (activeTab === "all") return true;
    if (activeTab === "present") return markedToday[emp.id];
    if (activeTab === "junior") return emp.level === "Junior";
    if (activeTab === "middle") return emp.level === "Middle";
    if (activeTab === "senior") return emp.level === "Senior";
    return true;
  });

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <div className="flex space-x-3">
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white"
            onClick={() => setModalOpen(true)}
          >
            + Add Employee
          </Button>
          <Button
            onClick={() => {
              const doc = new jsPDF();
              doc.setFontSize(18);
              doc.text("Employee Report", 14, 22);
              const tableColumn = ["Name", "Email", "Position", "Level", "Location", "Attendance %"];
              const tableRows = employees.map((emp) => [
                emp.name,
                emp.email,
                emp.position,
                emp.level,
                emp.location,
                calculateAttendancePercentage(emp.id),
              ]);
              autoTable(doc, { startY: 30, head: [tableColumn], body: tableRows });
              doc.save("employee_report.pdf");
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
              <User className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Present Today</p>
                <h3 className="text-2xl font-bold">{stats.presentToday}</h3>
              </div>
              <Clock className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Junior Level</p>
                <h3 className="text-2xl font-bold">{stats.junior}</h3>
              </div>
              <Star className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Senior Level</p>
                <h3 className="text-2xl font-bold">{stats.senior}</h3>
              </div>
              <Briefcase className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Attendance Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Employee Levels</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {levelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Input
              type="text"
              placeholder="Search employees..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Tabs defaultValue="all" className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setActiveTab("all")}>All</TabsTrigger>
              <TabsTrigger value="present" onClick={() => setActiveTab("present")}>Present</TabsTrigger>
              <TabsTrigger value="junior" onClick={() => setActiveTab("junior")}>Junior</TabsTrigger>
              <TabsTrigger value="middle" onClick={() => setActiveTab("middle")}>Middle</TabsTrigger>
              <TabsTrigger value="senior" onClick={() => setActiveTab("senior")}>Senior</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Employee List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <Card key={emp.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={emp.photo} />
                      <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{emp.name}</h3>
                          <p className="text-sm text-gray-500">{emp.position}</p>
                        </div>
                        <Badge variant={emp.level === "Senior" ? "default" : "outline"}>
                          {emp.level}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-1" />
                          <span className="truncate">{emp.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{emp.location}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Attendance</span>
                          <span>{calculateAttendancePercentage(emp.id)}%</span>
                        </div>
                        <Progress value={parseFloat(calculateAttendancePercentage(emp.id))} className="h-2" />
                      </div>
                      <div className="flex justify-end space-x-2 mt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditEmployee(emp);
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEmployee(emp.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button
                          size="sm"
                          className={`${markedToday[emp.id] ? "bg-gray-200 text-gray-600" : "bg-blue-500 hover:bg-blue-600"}`}
                          onClick={() => handleMarkAttendance(emp.id)}
                          disabled={markedToday[emp.id]}
                        >
                          {markedToday[emp.id] ? "Marked" : "Check In"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Employee Detail Sheet */}
      <Sheet open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <SheetContent side="right" className="w-full sm:w-[600px]">
          {selectedEmployee && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedEmployee.photo} />
                    <AvatarFallback>{selectedEmployee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle>{selectedEmployee.name}</SheetTitle>
                    <p className="text-sm text-gray-500">{selectedEmployee.position}</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedEmployee.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedEmployee.phone || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedEmployee.gender}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Birthday</p>
                  <p className="flex items-center">
                    <Cake className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedEmployee.birthday || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Level</p>
                  <p className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedEmployee.level}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedEmployee.location}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Projects</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.projects?.split(',').map((project, i) => (
                    <Badge key={i} variant="outline" className="flex items-center">
                      <GitFork className="h-3 w-3 mr-1" />
                      {project.trim()}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Attendance</h4>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'This Month', value: parseFloat(calculateAttendancePercentage(selectedEmployee.id)) },
                      { name: 'Avg', value: 85 }
                    ]}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Employee Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add New Employee</h2>
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <FileUpload
                    value={newEmployee.photo}
                    onChange={(uploadedUrl) => setNewEmployee({ ...newEmployee, photo: uploadedUrl })}
                    endpoint="media"
                  />
                  <p className="text-sm text-gray-500 mt-2">Upload employee photo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                      placeholder="John Doe"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      placeholder="+1234567890"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newEmployee.gender}
                      onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Birthday</label>
                    <Input
                      type="date"
                      value={newEmployee.birthday}
                      onChange={(e) => setNewEmployee({ ...newEmployee, birthday: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Position</label>
                    <Input
                      placeholder="Software Engineer"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Employee ID</label>
                    <Input
                      placeholder="EMP-001"
                      value={newEmployee.id1}
                      onChange={(e) => setNewEmployee({ ...newEmployee, id1: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Level</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newEmployee.level}
                      onChange={(e) => setNewEmployee({ ...newEmployee, level: e.target.value })}
                    >
                      <option>Junior</option>
                      <option>Middle</option>
                      <option>Senior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      placeholder="New York, USA"
                      value={newEmployee.location}
                      onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Projects (comma separated)</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Project A, Project B, Project C"
                    value={newEmployee.projects}
                    onChange={(e) => setNewEmployee({ ...newEmployee, projects: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-violet-600 hover:bg-violet-700"
                    onClick={handleAddEmployee}
                  >
                    Add Employee
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editModalOpen && editEmployee && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Employee</h2>
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <FileUpload
                    value={editEmployee.photo}
                    onChange={(uploadedUrl) => setEditEmployee({ ...editEmployee, photo: uploadedUrl })}
                    endpoint="media"
                  />
                  <p className="text-sm text-gray-500 mt-2">Update employee photo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                      placeholder="John Doe"
                      value={editEmployee.name}
                      onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={editEmployee.email}
                      onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      placeholder="+1234567890"
                      value={editEmployee.phone}
                      onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={editEmployee.gender}
                      onChange={(e) => setEditEmployee({ ...editEmployee, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Birthday</label>
                    <Input
                      type="date"
                      value={editEmployee.birthday}
                      onChange={(e) => setEditEmployee({ ...editEmployee, birthday: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Position</label>
                    <Input
                      placeholder="Software Engineer"
                      value={editEmployee.position}
                      onChange={(e) => setEditEmployee({ ...editEmployee, position: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Employee ID</label>
                    <Input
                      placeholder="EMP-001"
                      value={editEmployee.id1}
                      onChange={(e) => setEditEmployee({ ...editEmployee, id1: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Level</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={editEmployee.level}
                      onChange={(e) => setEditEmployee({ ...editEmployee, level: e.target.value })}
                    >
                      <option>Junior</option>
                      <option>Middle</option>
                      <option>Senior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      placeholder="New York, USA"
                      value={editEmployee.location}
                      onChange={(e) => setEditEmployee({ ...editEmployee, location: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Projects (comma separated)</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Project A, Project B, Project C"
                    value={editEmployee.projects}
                    onChange={(e) => setEditEmployee({ ...editEmployee, projects: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-violet-600 hover:bg-violet-700"
                    onClick={handleUpdateEmployee}
                  >
                    Update Employee
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}