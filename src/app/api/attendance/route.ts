import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Import Prisma instance

// POST: Mark attendance
export async function POST(req: NextRequest) {
  try {
    const { employeeId, subaccountId } = await req.json();

    if (!employeeId || !subaccountId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance for today already exists
    const existingAttendance = await db.attendance.findFirst({
      where: {
        employeeId,
        date: today,
      },
    });

    if (existingAttendance) {
      return NextResponse.json({ message: "Attendance already marked for today" });
    }

    // Mark attendance
    const newAttendance = await db.attendance.create({
      data: {
        employeeId,
        subaccountId,
        date: today,
      },
    });

    return NextResponse.json(newAttendance);
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json({ error: "Error marking attendance" }, { status: 500 });
  }
}

// GET: Fetch attendance records
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const attendanceRecords = await db.attendance.findMany({
      where: { employeeId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Error fetching attendance" }, { status: 500 });
  }
}
