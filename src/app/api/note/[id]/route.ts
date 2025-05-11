// app/api/notes/[id]/route.ts
 
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await db.notes.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Note deleted" });
}
