import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req:Request, { params }:any) {
    const { projectId } = params;
  
    try {
      // Fetch assigned employees for the project
      const assignedEmployees = await db.employeeProject.findMany({
        where: { projectId },
        include: { employee: true },
      });
  
      return NextResponse.json(assignedEmployees.map(({ employee }) => employee), { status: 200 });
    } catch (error) {
      console.error('Error fetching assigned employees:', error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }