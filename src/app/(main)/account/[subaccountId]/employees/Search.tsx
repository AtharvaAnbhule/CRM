"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SearchEmployee() {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (query.length < 2) {
      setEmployees([]);
      return;
    }

    const fetchEmployees = async () => {
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

    const delayFetch = setTimeout(fetchEmployees, 300); // Debounce for 300ms
    return () => clearTimeout(delayFetch);
  }, [query]);

  const handleSelect = (employee) => {
    setSelectedEmployee(employee);
    setQuery(employee.name);
    setEmployees([]); // Hide dropdown
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <Input
        type="text"
        placeholder="Search for an employee..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />

      {/* Dropdown Suggestions */}
      {employees.length > 0 && (
        <Card className="absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-md z-10 max-h-40 overflow-y-auto">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect(emp)}
            >
              {emp.name}
            </div>
          ))}
        </Card>
      )}

      {/* Show Selected Employee */}
      {selectedEmployee && (
        <div className="mt-3 p-3 border rounded-md">
          <p><strong>Selected:</strong> {selectedEmployee.name}</p>
        </div>
      )}
    </div>
  );
}
