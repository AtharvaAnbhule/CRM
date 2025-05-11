
// Adjust based on your project structure

import { db } from "@/lib/db";

// 🔹 Mark Employee Attendance (POST)
export async function POST(req: Request) {
  try {
    const { employeeId, subaccountId } = await req.json();

    if (!employeeId || !subaccountId) {
      return Response.json({ error: "Missing employeeId or subaccountId" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ensure only date is stored, without time

    // Check if attendance is already marked today
    const existingAttendance = await db.attendance.findFirst({
      where: { employeeId, date: today },
    });

    if (existingAttendance) {
      return Response.json({ message: "Attendance already marked for today." });
    }

    // Mark attendance
    const attendance = await db.attendance.create({
      data: {
        employeeId,
        subaccountId,
        date: today,
      },
    });

    return Response.json({ message: "Attendance marked successfully", attendance });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🔹 Fetch Employee Attendance Records (GET)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return Response.json({ error: "Missing employeeId" }, { status: 400 });
    }

    // Fetch all attendance records for the employee
    const attendanceRecords = await db.attendance.findMany({
      where: { employeeId },
      orderBy: { date: "desc" }, // Show recent records first
    });

    return Response.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    
    const updatedEmployee = await db.employee.update({
      where: { id },
      data: body,
    });

    return Response.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return Response.json({ error: "Error updating employee" }, { status: 500 });
  }
} 


// Handle DELETE (Remove Employee)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check if employee exists
    const existingEmployee = await db.employee.findUnique({
      where: { id: id },
    });

    if (!existingEmployee) {
      return Response.json({ error: "Employee not found" }, { status: 404 });
    }

    // Delete employee
    await db.employee.delete({ where: { id: id } });

    return Response.json({ message: "Employee deleted successfully" });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
 