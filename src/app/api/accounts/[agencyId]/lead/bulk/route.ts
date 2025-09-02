import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
// make sure you have this prisma client helper

// DELETE /api/accounts/:subaccountId/lead/bulk
export async function DELETE(
    req: Request,
    { params }: { params: { agencyId: string } }
) {
    try {
        const { agencyId } = params;
        const body = await req.json();
        const { leadIds } = body as { leadIds: string[] };

        if (!agencyId || !Array.isArray(leadIds) || leadIds.length === 0) {
            return NextResponse.json(
                { error: "Invalid request: subaccountId and leadIds are required" },
                { status: 400 }
            );
        }

        // ✅ Ensure leads belong to the correct subaccount before deletion
        const result = await db.leadSub.deleteMany({
            where: {
                id: { in: leadIds },
                subAccountId: agencyId, // assumes `Lead` has a `subaccountId` field
            },
        });

        return NextResponse.json(
            {
                message: `${result.count} lead(s) deleted successfully`,
                deletedCount: result.count,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Bulk delete failed:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete leads" },
            { status: 500 }
        );
    }
}
