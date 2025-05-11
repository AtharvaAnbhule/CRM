 
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
 
export async function GET(req:Request) {
  try {
    const { searchParams } = new URL(req.url, process.env.NEXT_PUBLIC_BASE_URL);
    const query = searchParams.get("query");
     
    if (!query || query.length < 2) {
      return NextResponse.json([], { status: 200 });
    }
 
    const employees = await db.employee.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
 