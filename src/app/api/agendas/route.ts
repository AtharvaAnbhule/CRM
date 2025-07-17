import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subaccountId = searchParams.get("subaccountId");

    if (!subaccountId) {
      return NextResponse.json({ success: false, error: "subAccountId is required" }, { status: 400 });
    }

    const agendas = await db.agenda.findMany({
      where: { subaccountId },
      orderBy: { start: "asc" },
    });

    return NextResponse.json({ success: true, agendas }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // if (!body.subaccountId || !body.title || !body.start || !body.end) {
    //   return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    // }

    const newTask = await db.agenda.create({
      data: {
        subaccountId: body.subAccountId,
        title: body.title,
        description: body.description || "",
        priority: body.priority || "Medium",
        start: new Date(body.start),
        status: body.status || "To Do",
        end: new Date(body.end),
      },
    });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Error adding task:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
