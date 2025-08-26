import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";


export async function GET(
    req: NextRequest,
    { params }: { params: { agencyId: string; leadId: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const lead = await db.leads.findUnique({
            where: {
                id: params.leadId,
                agencyId: params.agencyId,
            }
        });

        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        return NextResponse.json({ lead });
    } catch (error) {
        console.error("Error fetching lead:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}


export async function PATCH(
    req: NextRequest,
    { params }: { params: { agencyId: string; leadId: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status, name, email, phone, notes } = body;

        // Check if lead exists
        const existingLead = await db.leads.findUnique({
            where: {
                id: params.leadId,
                agencyId: params.agencyId,
            },
        });

        if (!existingLead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // Prepare update data
        const updateData: any = {};
        if (status) updateData.status = status;
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (notes !== undefined) updateData.notes = notes;

        const lead = await db.leads.update({
            where: {
                id: params.leadId,
                agencyId: params.agencyId,
            },
            data: updateData,
        });

        return NextResponse.json({ lead });
    } catch (error) {
        console.error("Error updating lead:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { agencyId: string; leadId: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if lead exists
        const existingLead = await db.leads.findUnique({
            where: {
                id: params.leadId,
                agencyId: params.agencyId,
            },
        });

        if (!existingLead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // Delete the lead (this will cascade delete notes due to the relation)
        await db.leads.delete({
            where: {
                id: params.leadId,
                agencyId: params.agencyId,
            },
        });

        return NextResponse.json({ message: "Lead deleted successfully" });
    } catch (error) {
        console.error("Error deleting lead:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}