import { db } from "@/lib/db";
import { format } from "date-fns";
import { NextResponse } from "next/server";
 

// Handle GET Request (Fetch Employees)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subaccountId = searchParams.get("subaccountId");

  if (!subaccountId) {
    return NextResponse.json({ error: "subaccountId is required" }, { status: 400 });
  }

  try {
    const employees = await db.employee.findMany({
      where: { subaccountId },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Error fetching employees" }, { status: 500 });
  }
}

// Handle POST Request (Create Employee)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, gender, id1, birthday, position, level, photo ,  location, projects, subaccountId } = body;

    // // Validate required fields
    // if (  !email || !position || !level || !subaccountId) {
    //   return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    // }

    const newEmployee = await db.employee.create({
      data: {
        name,
        email,
        gender,
        birthday: new Date(birthday),
        position,
        level,
        location,
        projects,
        photo,
        subaccountId,
        id1 , 
      },
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error("Error adding employee:", error);
    return NextResponse.json({ error: "Error adding employee" }, { status: 500 });
  }
}
 




 

