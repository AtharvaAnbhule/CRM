"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/common/FileUpload";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Input } from "@/components/ui/input";
import SearchEmployee from "./Search";
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Trash } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function EmployeeApp() { 





  const pathname = usePathname();
  const subaccountId = pathname.split("/")[2]; // Extract subaccountId from URL

  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [query, setQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null); 
  const [attendance, setAttendance] = useState({}); // Stores attendance data 
  const [markedToday, setMarkedToday] = useState({}); 
 

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
    phone:"",
    id1:"" , 
    subaccountId,
  }); 


  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (query.length < 2) {
      fetchEmployees(); // Fetch all employees instead of clearing the list.
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
  
    const delayFetch = setTimeout(fetchEmployee, 300); // Debounce for 300ms
    return () => clearTimeout(delayFetch);
  }, [query]);
  
 //@ts-ignore
  const handleSelect = (employee) => {
    setSelectedEmployee(employee);
    setQuery(employee.name);
    setEmployees([]); // Hide dropdown
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`/api/employees?subaccountId=${subaccountId}`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();


      setEmployees(data);
       
 //@ts-ignore
      const attendancePromises = data.map((emp) =>
        fetch(`/api/attendance?employeeId=${emp.id}`).then((res) => res.json())
      );

      const attendanceResults = await Promise.all(attendancePromises);

      const attendanceMap = {};
       //@ts-ignore
      data.forEach((emp, index) => {
         //@ts-ignore
        attendanceMap[emp.id] = attendanceResults[index] || [];
      });

      setAttendance(attendanceMap);
      
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };
  

  
  // Fetch employees when component mounts
  useEffect(() => {
    if (!subaccountId) {
      console.error("subaccountId is undefined!");
      return;
    }



    fetchEmployees();
  }, [subaccountId]); 

 //@ts-ignore
  const handleDeleteEmployee = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
  
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
  
      if (!res.ok) throw new Error("Failed to delete employee");
  
      // Update state after deletion
       //@ts-ignore
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };
  
  

  // Handle adding new employee
  const handleAddEmployee = async () => {
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEmployee, subaccountId }),
      });

      if (!res.ok) throw new Error("Failed to add employee");

      // Refetch employee list after successful addition
      const updatedEmployees = await fetch(`/api/employees?subaccountId=${subaccountId}`).then((res) =>
        res.json()
      );

      setEmployees(updatedEmployees);
      setModalOpen(false);
    } catch (err) {
      console.error("Error adding employee:", err);
    }
  }; 

  const handleUpdateEmployee = async () => {
    try {
       //@ts-ignore
      const res = await fetch(`/api/employees/${editEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEmployee),
      });

      if (!res.ok) throw new Error("Failed to update employee");

      // Update employee list
       //@ts-ignore
      setEmployees((prev) =>
         //@ts-ignore
        prev.map((emp) => (emp.id === editEmployee.id ? editEmployee : emp))
      );

      setEditModalOpen(false);
    } catch (err) {
      console.error("Error updating employee:", err);
    }
  };

 //@ts-ignore
  const handleMarkAttendance = async (employeeId) => {
     //@ts-ignore
    if (markedToday[employeeId]) return; // Prevent multiple submissions
  
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, subaccountId }),
      });
  
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
  
      if (!res.ok) throw new Error(data?.error || "Failed to mark attendance");
  
      // Fetch updated attendance data
      const attendanceRes = await fetch(`/api/attendance?employeeId=${employeeId}`);
      const updatedAttendance = await attendanceRes.json();
  
      setAttendance((prev) => ({ ...prev, [employeeId]: updatedAttendance }));
  
      // Mark attendance for today
      setMarkedToday((prev) => ({ ...prev, [employeeId]: true }));
  
      // Store the marked status in localStorage
      localStorage.setItem(`attendance_${employeeId}_${new Date().toDateString()}`, "true");
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  };
  
  // Check localStorage on component mount to see if attendance was already marked
  useEffect(() => {
    const today = new Date().toDateString();
    const initialMarked = {};
  
    employees.forEach((emp) => {
       //@ts-ignore
      if (localStorage.getItem(`attendance_${emp.id}_${today}`)) {
         //@ts-ignore
        initialMarked[emp.id] = true;
      }
    });
  
    setMarkedToday(initialMarked);
  }, [employees]);

  // Calculate attendance percentage 
   //@ts-ignore
   const calculateAttendancePercentage = (employeeId: string): string => {
    //@ts-ignore
    const records = attendance[employeeId] || [];
    const today = new Date();
    const totalDaysPassed = today.getDate();

    const attendedDays = new Set(
      //@ts-ignore
      records.map((record) => new Date(record.date).getDate())
    );

    const percentage =
      totalDaysPassed === 0
        ? 0
        : (attendedDays.size / totalDaysPassed) * 100;

    return percentage.toFixed(2);
  };


  


  

  return (
    <div className=" h-screen flex flex-col rouded-md">
    <h1 className="text-5xl font-bold mb-10">Manage your employees for particular project</h1>
    <div className="flex flex-row gap-5">
    <Button
      className="mt-10 bg-violet-700 hover:bg-violet-500 text-white w-[130px] px-4 py-2 rounded"
      onClick={() => setModalOpen(true)}
    >
      + Add Employee
    </Button> 
    <Button
  onClick={() => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Employee Report", 14, 22);
  
    const tableColumn = [
      "Name",
      "Email",
      "Position",
      "Level",
      "Location",
      "Attendance %",
    ];
  
    const tableRows = employees.map((emp) => [
      emp.name,
      emp.email,
      emp.position,
      emp.level,
      emp.location,
      calculateAttendancePercentage(emp.id),
    ]);
  
    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
    });
  
    doc.save("employee_report.pdf")}}
  className="mt-10 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded"
>
  Download Employees data
</Button>

</div>
    <div className="mt-3 mb-3 ">
    <Input
        type="text"
        placeholder="Search for an employee..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
    </div>


    {loading ? (
      <p className="mt-4 text-gray-500">Loading employees...</p>
    ) : (
      <div className="mt-4 space-y-4 overflow-y-auto">
        {employees.length >=0 && (
          employees.map((emp) => (
            <div key={emp.id} className="flex items-center dark:bg-black dark:text-white bg-gray-100 p-4 rounded-lg" onClick={() => setSelectedEmployee(emp)}>
              <div className="ml-4">
                <p className="font-semibold dark:text-white">{emp.name}</p>
                <Image
                  src={emp.photo}
                  alt="Employee Photo"
                  width={70}
                  height={150}
                  className="rounded-full mr-10"
                />
                
                <p className="text-gray-700">Attendance: {calculateAttendancePercentage(emp.id)}%</p>
                <p className="text-sm text-gray-600">{emp.email}</p>
                <p className="text-sm text-gray-500">Location: {emp.location}</p>
                
                <Button
                  className="bg-violet-700 hover:bg-violet-500 text-white w-10 px-2 py-1 rounded"
                  onClick={() => {
                    setEditEmployee(emp);
                    setEditModalOpen(true);
                  }}
                >
                Edit
                </Button>
              </div>
 
              <p className="ml-auto mr-5 text-gray-500 gap-2 flex">{emp.position} ({emp.level})</p>

              
              <div className="flex flex-row gap-3 space-y-2 w-auto">
                
                <Button
                  className="bg-red-500 text-white px-3 mt-2 py-1 rounded-full"
                  onClick={() => handleDeleteEmployee(emp.id)}
                >
                  <Trash />
                </Button>
                <Button
                  className={`px-3 py-1 rounded ${markedToday[emp.id] ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500"}`}
                  onClick={() => handleMarkAttendance(emp.id)}
                  disabled={markedToday[emp.id]}
                >
                  {markedToday[emp.id] ? "Marked" : "Mark Attendance"}
                </Button>
              </div>
              
            </div>
          ))
        )}
      </div>
    )}



    <Sheet
    open={!!selectedEmployee}
    onOpenChange={(open) => !open && setSelectedEmployee(null)}
  >
    <SheetContent
      side="bottom"
      className="max-h-[90vh] overflow-y-auto rounded-t-2xl border-t bg-background text-foreground shadow-xl transition-all duration-300"
    >
      <SheetHeader>
        <SheetTitle className="text-center text-2xl font-semibold">
          Employee Overview
        </SheetTitle>
      </SheetHeader>
  
      {selectedEmployee && (
        <div className="mt-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center space-y-2">
            <img
              src={selectedEmployee.photo}
              alt="Employee"
              className="w-28 h-28 rounded-full object-cover border-4 border-border shadow-md"
            />
            <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
            <p className="text-muted-foreground text-sm">
              {selectedEmployee.position}
            </p>
          </div>
  
          <Separator />
  
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-5 text-sm sm:px-6 text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Email</p>
              <p>{selectedEmployee.email}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Phone</p>
              <p>{selectedEmployee.phone}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Gender</p>
              <p>{selectedEmployee.gender}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Birthday</p>
              <p>{selectedEmployee.birthday}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Level</p>
              <p>{selectedEmployee.level}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Location</p>
              <p>{selectedEmployee.location}</p>
            </div>
          </div>
  
          <Separator />
  
          {/* Projects and Attendance */}
          <div className="px-4 sm:px-6 space-y-3">
            <div>
              <p className="font-semibold text-foreground">Projects</p>
              <p className="text-muted-foreground">{selectedEmployee.projects}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Attendance</p>
              <p className="text-muted-foreground">
                {calculateAttendancePercentage(selectedEmployee.id)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </SheetContent>
  </Sheet>
  
    

      {/* Modal for adding employee */}
      {modalOpen && (
        <div className="absolute inset-0 z-[100] h-full bg-black bg-opacity-50 overflow-y-auto flex items-center justify-center">
        <div className="dark:bg-black bg-white w-[80%] max-h-[80vh] p-6 rounded-lg overflow-auto">
    
            <h2 className="text-lg font-bold dark:text-white">Add Employee</h2> 
     
            <FileUpload
              value={newEmployee.photo}
              onChange={(uploadedUrl) => setNewEmployee({ ...newEmployee, photo: uploadedUrl })}
              endpoint="media" 
         
            />
            <input
              type="text"
              placeholder="Name"
              className="border p-2 w-full my-2 dark:text-white"
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="border p-2 w-full my-2 dark:text-white"
              onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="border p-2 w-full my-2"
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            />

            {/* Gender Selection */}
            <select
              className="border p-2 w-full my-2"
              onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="date"
              className="border p-2 w-full my-2"
              onChange={(e) => setNewEmployee({ ...newEmployee, birthday: e.target.value })}
            />
            <input
              type="text"
              placeholder="Position"
              className="border p-2 w-full my-2"
              onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
            />
            <input
              type="text"
              placeholder="Enter Employee Id"
              className="border p-2 w-full my-2"
              onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
            />


            {/* Level Selection */}
            <select
              className="border p-2 w-full my-2"
              onChange={(e) => setNewEmployee({ ...newEmployee, level: e.target.value })}
            >
              <option>Junior</option>
              <option>Middle</option>
              <option>Senior</option>
            </select>

            {/* Location Field */}
            <input
              type="text"
              placeholder="Location"
              className="border p-2 w-full my-2"
              onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
            />

            {/* Projects Field */}
            <textarea
              placeholder="Projects (separate by commas)"
              className="border p-2 w-full my-2"
              onChange={(e) => setNewEmployee({ ...newEmployee, projects: e.target.value })}
            />

          

            <button className="bg-violet-700 hover:bg-violet-500 text-white px-4 py-2 rounded mt-2" onClick={handleAddEmployee}>
              Save
            </button>
            <button className="ml-2 text-gray-500" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
    
          </div>
        </div>
      )} 

      {editModalOpen && editEmployee && (
        <>
          {/* Prevent page scroll when modal is open */}
          <style>{`
            body {
              overflow: hidden;
            }
          `}</style>
      
          <div className="absolute bg-black inset-0 z-[100] overflow-y-hidden h-[120%] bg-opacity-50 flex items-center justify-center">
            {/* Scrollable Container */}
            <div className=" dark:bg-black bg-white w-[70%] max-h-[80vh] p-6 rounded-lg overflow-auto">
              <h2 className="text-lg font-bold dark:text-white">Edit Employee</h2>
    
              <FileUpload
                value={editEmployee.photo}
                onChange={(uploadedUrl) => setEditEmployee({ ...editEmployee, photo: uploadedUrl })}
                endpoint="media"
              />
      
              <input
                type="text"
                placeholder="Name"
                className="border p-2 w-full my-2"
                value={editEmployee.name}
                onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
              />
      
              <input
                type="text"
                placeholder="Phone Number"
                className="border p-2 w-full my-2"
                value={editEmployee.phone}
                onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
              />
      
              <input
                type="email"
                placeholder="Email"
                className="border p-2 w-full my-2"
                value={editEmployee.email}
                onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })}
              />
      
              <input
                type="text"
                placeholder="Location"
                className="border p-2 w-full my-2"
                value={editEmployee.location}
                onChange={(e) => setEditEmployee({ ...editEmployee, location: e.target.value })}
              />
      
              <select
                className="border p-2 w-full my-2"
                value={editEmployee.gender}
                onChange={(e) => setEditEmployee({ ...editEmployee, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
      
              <input
                type="date"
                value={editEmployee.date}
                className="border p-2 w-full my-2"
                onChange={(e) => setEditEmployee({ ...editEmployee, birthday: new Date(e.target.value).toISOString() })}
              />
      
              <input
                type="text"
                value={editEmployee.position}
                placeholder="Position"
                className="border p-2 w-full my-2"
                onChange={(e) => setEditEmployee({ ...editEmployee, position: e.target.value })}
              />
      
              <input
                type="text"
                value={editEmployee.id1}
                placeholder="Enter Employee Id"
                className="border p-2 w-full my-2"
                onChange={(e) => setEditEmployee({ ...editEmployee, id1: e.target.value })}
              />
      
              <select
                className="border p-2 w-full my-2"
                value={editEmployee.role}
                onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value })}
              >
                <option>Junior</option>
                <option>Middle</option>
                <option>Senior</option>
              </select>
      
              <button
                className="bg-violet-700 hover:bg-violet-500 text-white px-4 py-2 rounded mt-2"
                onClick={handleUpdateEmployee}
              >
                Update
              </button>
      
              <button
                className="ml-2 text-gray-500"
                onClick={() => {
                  setEditModalOpen(false);
                  document.body.style.overflow = "auto"; // Restore scrolling when modal closes
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
      
      

    </div>
  );
}
