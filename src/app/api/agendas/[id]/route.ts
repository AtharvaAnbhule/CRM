import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const data = await req.json();

  try {
    const updated = await db.agenda.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        start: new Date(data.start),
        end: new Date(data.end),
        completed: data.completed,
      },
    });

    return NextResponse.json({ success: true, agenda: updated });
  } catch (error) {
    console.error("Error updating agenda:", error);
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}


export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    await db.agenda.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("Error deleting agenda:", error);
    return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 });
  }
}
