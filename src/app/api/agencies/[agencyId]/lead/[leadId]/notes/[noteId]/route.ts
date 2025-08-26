import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";


// PATCH - Update a specific note
export async function PATCH(
    req: NextRequest,
    { params }: { params: { agencyId: string; leadId: string; noteId: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { message, behavior } = body;

        // Verify the note exists and belongs to the lead and agency
        const note = await db.nottt.findFirst({
            where: {
                id: params.noteId,
                leadId: params.leadId,
                lead: {
                    agencyId: params.agencyId,
                },
            },
        });

        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        const updatedNote = await db.note.update({
            where: {
                id: params.noteId,
            },
            data: {
                message: message || note.message,
                behavior: behavior !== undefined ? behavior : note.behavior,
            },
        });

        return NextResponse.json({ note: updatedNote });
    } catch (error) {
        console.error("Error updating note:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a specific note
export async function DELETE(
    req: NextRequest,
    { params }: { params: { agencyId: string; leadId: string; noteId: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the note exists and belongs to the lead and agency
        const note = await db.nottt.findFirst({
            where: {
                id: params.noteId,
                leadId: params.leadId,
                lead: {
                    agencyId: params.agencyId,
                },
            },
        });

        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        await db.note.delete({
            where: {
                id: params.noteId,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Note deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting note:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}