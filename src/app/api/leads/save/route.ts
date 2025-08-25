import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leads } = await request.json();

    if (!leads || !Array.isArray(leads)) {
        return NextResponse.json(
            { error: 'Invalid leads data' },
            { status: 400 }
        );
    }

    try {
        const savedLeads = await Promise.all(
            leads.map((lead) =>
                db.lead.create({
                    data: {
                        ...lead,
                        agencyId: userId,
                        source: 'Generated',
                        status: 'New',
                    },
                })
            )
        );

        return NextResponse.json({ leads: savedLeads }, { status: 201 });
    } catch (error) {
        console.error('Error saving leads:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}