import { db } from "@/lib/db";
import { NextResponse } from "next/server";




// ✅ Get all notes for a specific Lead
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("leadId");

  if (!leadId) {
    return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
  }

  try {
    const notes = await db.note.findMany({
        take: 100,
        skip: 0,
        select: {
          id: true,
          message: true,
          behavior: true,
          createdAt: true,
          leadId: true,
          lead: {
            select: {
              name: true,  // Modify as needed
            },
          },
        },
    });

    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching notes" }, { status: 500 });
  }
}

// ✅ Add a new note for a Lead
export async function POST(req: Request) {
  try {
    const { leadId, message, behavior } = await req.json();

    if (!leadId || !message || !behavior) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newNote = await db.note.create({
      data: { leadId, message, behavior },
    });

    return NextResponse.json(newNote);
  } catch (error) {
    return NextResponse.json({ error: "Error adding note" }, { status: 500 });
  }
}

// ✅ Delete a note
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
  }

  try {
    await db.note.delete({ where: { id: id } });
    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting note" }, { status: 500 });
  }
}
