// app/api/notes/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";


// Fetch all notes that are not expired
export async function GET() {
  const now = new Date();

  const notes = await db.notes.findMany({
    where: {
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(notes);
}

// Create a new note that expires in 30 days
export async function POST(req: Request) {
 

 


  const body = await req.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days later

  const note = await db.notes.create({
    data: {
      content: body.content,
      expiresAt: new Date(body.expiresAt),
    },
  });

  return NextResponse.json(note);
}
