"use client";

import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css"; // Essential for Calendar layout
import { Button } from "@/components/ui/button";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  start: Date;
  end: Date;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Task Form States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Add Task Handler
  const handleAddTask = () => {
    if (!taskTitle || !selectedDate) return;

    const newTask: Task = {
      id: `${Date.now()}`,
      title: taskTitle,
      description: taskDescription,
      priority,
      start: selectedDate,
      end: new Date(selectedDate.getTime() + 60 * 60 * 1000), // 1-hour event
    };

    setEvents([...events, newTask]);
    setShowModal(false);
    setTaskTitle("");
    setTaskDescription("");
    setPriority("Medium");
  };

  // Custom Event Styling
  const eventStyleGetter = (event: Task) => {
    let bgColor = "bg-blue-500";
    if (event.priority === "High") bgColor = "bg-red-500";
    else if (event.priority === "Medium") bgColor = "bg-yellow-400";
    else bgColor = "bg-green-500";

    return {
      className: `text-white p-1 rounded-md shadow-md ${bgColor}`,
    };
  };

  return (
    <div className="min-h-screen dark:text-black  bg-black-50 p-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Professional Task Calendar 📅
        </h1>

        {/* Calendar Component */}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          style={{ height: 500 }}
          onSelectSlot={(slotInfo) => {
            setSelectedDate(slotInfo.start);
            setShowModal(true);
          }}
          eventPropGetter={eventStyleGetter}
        />

        {/* Modal for Task Creation */}
        {showModal && (
          <div className="z-10 fixed inset-0 bg-grey bg-opacity-50 flex items-center justify-center">
            <div className="dark:text-white bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-black">Add New Task</h2>

              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task Title"
                className="w-full p-2 border border-gray-300 rounded mb-3"
              />

              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Task Description"
                className="w-full p-2 border border-gray-300 rounded mb-3"
              ></textarea>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full dark:text-white p-2 border border-gray-300 rounded mb-3"
              >
                <option value="High">🔥 High Priority</option>
                <option value="Medium">⚠️ Medium Priority</option>
                <option value="Low">✅ Low Priority</option>
              </select>

              <div className="flex gap-2">
                <Button
                  className="bg-green-500 text-white w-full"
                  onClick={handleAddTask}
                >
                  Add Task
                </Button>
                <Button
                  className="bg-red-500 text-white w-full"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
