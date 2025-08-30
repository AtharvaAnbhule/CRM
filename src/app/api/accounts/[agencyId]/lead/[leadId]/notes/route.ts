import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";


// GET all notes for a specific lead
export async function GET(
    req: Request,
    { params }: { params: { agencyId: string; leadId: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the lead exists and belongs to the agency
        const lead = await db.leadSub.findUnique({
            where: {
                id: params.leadId,
                subAccountId: params.agencyId,
            },
        });

        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // Get all notes for this lead
        const notes = await db.notttt.findMany({
            where: {
                leadId: params.leadId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ notes });
    } catch (error) {
        console.error("Error fetching notes:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST - Create a new note for a specific lead
export async function POST(
    req: NextRequest,
    { params }: { params: { agencyId: string; leadId: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { message, behavior } = body;

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Verify the lead exists and belongs to the agency
        const lead = await db.leadSub.findUnique({
            where: {
                id: params.leadId,
                subAccountId: params.agencyId,
            },
        });

        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // Create the note with the leadId from the URL params
        const note = await db.notttt.create({
            data: {
                message,
                behavior: behavior || null,
                leadId: params.leadId, // This comes from the URL parameter
            },
        });

        return NextResponse.json({
            success: true,
            note
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating note:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}