// app/api/agencies/[agencyId]/leads/route.ts
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { agencyId: string } }
) {
    try {
        const subAccountId = params.agencyId; // this is actually a SubAccount ID
        console.log('Creating leads for subaccount:', subAccountId);

        // Check if subaccount exists
        const subAccount = await db.subAccount.findUnique({
            where: { id: subAccountId },
        });

        if (!subAccount) {
            return NextResponse.json(
                { error: 'SubAccount not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { leads: leadsData } = body;

        if (!leadsData || !Array.isArray(leadsData)) {
            return NextResponse.json(
                { error: 'Leads array is required' },
                { status: 400 }
            );
        }

        // Validate leads (must have name + email)
        const validLeads = leadsData.filter((lead) => lead.name && lead.email);

        if (validLeads.length === 0) {
            return NextResponse.json(
                { error: 'No valid leads provided' },
                { status: 400 }
            );
        }

        // Map leads to include subAccountId
        const leadsWithSubAccount = validLeads.map((lead) => ({
            name: lead.name,
            email: lead.email,
            phone: lead.phone || '',
            status: lead.status || 'new',
            notes: lead.notes || '',
            subAccountId,
        }));

        // Upsert each lead
        const createdLeads = await db.$transaction(
            leadsWithSubAccount.map((lead) =>
                db.leadSub.upsert({
                    where: {
                        email_subAccountId: {
                            email: lead.email,
                            subAccountId: lead.subAccountId,
                        },
                    },
                    update: {
                        name: lead.name,
                        phone: lead.phone,
                        status: lead.status,
                        notes: lead.notes,
                    },
                    create: lead,
                })
            )
        );

        return NextResponse.json({
            message: `Successfully processed ${createdLeads.length} leads`,
            leads: createdLeads,
        });
    } catch (error) {
        console.error('Error creating leads:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
