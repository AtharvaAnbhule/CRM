// app/api/agencies/[agencyId]/leads/route.ts
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(
    request: NextRequest,
    { params }: { params: { agencyId: string } }
) {
    try {
        const agencyId = params.agencyId;
        console.log('Creating leads for agency:', agencyId);

        // Check if agency exists
        const agency = await db.agency.findUnique({
            where: { id: agencyId }
        });

        if (!agency) {
            return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
        }

        const body = await request.json();
        const { leads: leadsData } = body;

        if (!leadsData || !Array.isArray(leadsData)) {
            return NextResponse.json({ error: 'Leads array is required' }, { status: 400 });
        }

        // Validate leads
        const validLeads = leadsData.filter(lead => lead.name && lead.email);

        if (validLeads.length === 0) {
            return NextResponse.json({ error: 'No valid leads provided' }, { status: 400 });
        }

        // Add agencyId to each lead and ensure proper formatting
        const leadsWithAgency = validLeads.map(lead => ({
            name: lead.name,
            email: lead.email,
            phone: lead.phone || '',
            status: lead.status || 'new',
            notes: lead.notes || '',
            agencyId,
        }));

        // Use transaction to create leads
        const createdLeads = await db.$transaction(
            leadsWithAgency.map(lead =>
                db.leads.upsert({
                    where: {
                        email_agencyId: {
                            email: lead.email,
                            agencyId: lead.agencyId,
                        },
                    },
                    update: {
                        // Update existing lead with new data
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
            leads: createdLeads
        });

    } catch (error) {
        console.error('Error creating leads:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}