// app/api/agencies/[agencyId]/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';




export async function GET(
    request: NextRequest,
    { params }: { params: { agencyId: string } }
) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { agencyId } = params;

        // Verify the user has access to this agency
        const agency = await db.subAccount.findUnique({
            where: {
                id: agencyId,
            }
        });

        if (!agency) {
            return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
        }

        // Fetch all leads for this agency
        const leads = await db.leadSub.findMany({
            where: {
                subAccountId: agencyId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ leads });
    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}