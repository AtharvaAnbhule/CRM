import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Clerk auth
import { db } from '@/lib/db';
import { randomUUID } from 'crypto'; // ✅ generate unique IDs

interface Lead {
    name: string;
    phone: string;
    email: string;
    Category: string;
    message: string;
}

export async function POST(
    request: NextRequest,
    { params }: { params: { agencyId: string } }
) {
    try {
        // ✅ Clerk auth
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { agencyId } = params;
        const { leads } = await request.json();

        console.log("Incoming leads upload:", { agencyId, leadCount: leads?.length });

        if (!leads || !Array.isArray(leads)) {
            return NextResponse.json(
                { error: 'Leads array is required' },
                { status: 400 }
            );
        }

        // ✅ Verify agency exists and user has access
        const agency = await db.agency.findUnique({
            where: { id: agencyId },
            include: { users: true },
        });

        if (!agency) {
            return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
        }

        // ✅ Ensure user belongs to this agency
        const hasAccess = agency.users.some((user) => user.id === userId);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Access denied to this agency' },
                { status: 403 }
            );
        }

        // ✅ Process and save leads
        let savedCount = 0;
        const errors: string[] = [];

        for (const leadData of leads) {
            try {
                // If no email, generate a unique placeholder
                const email =
                    leadData.email && leadData.email.trim() !== ""
                        ? leadData.email
                        : `noemail-${randomUUID()}@placeholder.com`;

                console.log("Processing lead:", { email, agencyId });

                const existingLead = await db.leads.findFirst({
                    where: {
                        email,
                        agencyId,
                    },
                });

                if (!existingLead) {
                    await db.leads.create({
                        data: {
                            name: leadData.name,
                            phone: leadData.phone || "",
                            email,
                            status: "new",
                            notes: leadData.message || "",
                            followUpDate: new Date(),
                            agencyId,
                        },
                    });
                    savedCount++;
                    console.log("✅ Lead saved:", email);
                } else {
                    console.log("⏩ Skipping duplicate lead:", email);
                }
            } catch (leadError) {
                console.error("❌ Error saving lead:", leadError);
                errors.push(
                    `Failed to save lead: ${leadData.name} (${leadData.email || "empty email"})`
                );
            }
        }

        return NextResponse.json({
            success: true,
            count: savedCount,
            errors,
            message: `Successfully saved ${savedCount} leads${errors.length > 0 ? ` with ${errors.length} errors` : ""
                }`,
        });
    } catch (error) {
        console.error("🔥 Error in auto upload:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
