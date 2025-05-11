import { db } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function POST(req:Request) {
  try {
    const { projectId, employeeId } = await req.json();

    if (!projectId || !employeeId) {
      return NextResponse.json({ error: 'Project ID and Employee ID are required' }, { status: 400 });
    }

    // Check if project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if employee exists
    const employee = await db.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Assign the employee to the project
    await db.employeeProject.create({
      data: {
        projectId,
        employeeId,
      },
    });

    return NextResponse.json({ message: 'Employee assigned successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error assigning employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



