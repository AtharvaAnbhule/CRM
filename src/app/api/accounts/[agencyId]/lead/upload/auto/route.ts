import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

interface Lead {
    name: string;
    phone?: string;
    email?: string;
    Category?: string;
    message?: string;
}

export async function POST(
    request: NextRequest,
    { params }: { params: { agencyId: string } }
) {
    try {
        // ✅ Clerk auth
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { agencyId } = params;
        const { leads } = await request.json();

        if (!leads || !Array.isArray(leads)) {
            return NextResponse.json(
                { error: "Leads array is required" },
                { status: 400 }
            );
        }

        // ✅ Verify subaccount exists & user has access
        const subaccount = await db.subAccount.findUnique({
            where: { id: agencyId }
        });

        if (!subaccount) {
            return NextResponse.json(
                { error: "Subaccount/Agency not found" },
                { status: 404 }
            );
        }



        // ✅ Save leads
        let savedCount = 0;
        const errors: string[] = [];

        for (const leadData of leads) {
            try {
                // assign unique placeholder if no email
                const email =
                    leadData.email && leadData.email.trim() !== ""
                        ? leadData.email
                        : `noemail-${randomUUID()}@placeholder.com`;

                await db.leadSub.create({
                    data: {
                        name: leadData.name,
                        phone: leadData.phone || "",
                        email,
                        status: "new",
                        notes: leadData.message || "",
                        followUpDate: new Date(),
                        subAccountId: agencyId,
                    },
                });

                savedCount++;
            } catch (err) {
                console.error("Error saving lead:", err);
                errors.push(
                    `Failed to save lead: ${leadData.name} (${leadData.email || "empty email"})`
                );
            }
        }

        return NextResponse.json({
            success: true,
            count: savedCount,
            errors,
            message: `Saved ${savedCount} leads${errors.length > 0 ? ` with ${errors.length} errors` : ""
                }`,
        });
    } catch (error) {
        console.error("🔥 Error in save-to-private:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 
