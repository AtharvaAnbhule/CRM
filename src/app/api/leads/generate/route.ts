import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { Client } from "@googlemaps/google-maps-services-js";

// Simple in-memory job tracking (for development)
// In production, you might want to use a more persistent solution
export const jobs = new Map<string, {
    status: 'pending' | 'processing' | 'completed' | 'failed',
    progress: number,
    leads?: any[],
    error?: string
}>();

export async function POST(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, location, requestedLeads } = await request.json();

    if (!category || !location || !requestedLeads) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }

    const jobId = `job_${Date.now()}`;

    // Initialize job
    jobs.set(jobId, {
        status: 'pending',
        progress: 0
    });

    // Process the job asynchronously
    processJob(jobId, userId, category, location, parseInt(requestedLeads));

    return NextResponse.json({ jobId }, { status: 202 });
}

async function processJob(jobId: string, userId: string, category: string, location: string, requestedLeads: number) {
    const client = new Client({});

    try {
        jobs.set(jobId, { status: 'processing', progress: 0 });

        // Step 1: Search for businesses using Google Places API
        const placesResponse = await client.textSearch({
            params: {
                query: `${category} in ${location}`,
                key: process.env.GOOGLE_MAPS_API_KEY!,
            },
        });

        const places = placesResponse.data.results;
        if (!places || places.length === 0) {
            throw new Error("No businesses found for the given criteria");
        }

        // Step 2: Process places (limited to requestedLeads)
        const leadsToProcess = Math.min(places.length, requestedLeads);
        const leads: any[] = [];
        let processedCount = 0;

        for (const place of places.slice(0, requestedLeads)) {
            try {
                // Get place details
                const detailsResponse = await client.placeDetails({
                    params: {
                        place_id: place.place_id!,
                        fields: ["name", "formatted_phone_number", "website", "formatted_address"],
                        key: process.env.GOOGLE_MAPS_API_KEY!,
                    },
                });

                const placeDetails = detailsResponse.data.result;

                leads.push({
                    name: placeDetails.name || "Unknown Business",
                    phone: placeDetails.formatted_phone_number || "",
                    email: placeDetails.url, // Can be enriched later
                    Category: category,
                    message: `Generated from ${location}`,
                });

                processedCount++;
                const progress = Math.floor((processedCount / leadsToProcess) * 100);
                jobs.set(jobId, { status: 'processing', progress, leads });

            } catch (error) {
                console.error(`Error processing place ${place.place_id}:`, error);
            }
        }

        jobs.set(jobId, { status: 'completed', progress: 100, leads });

    } catch (error) {
        console.error("Error processing lead generation job:", error);
        jobs.set(jobId, {
            status: 'failed',
            progress: 100,
            error: error instanceof Error ? error.message : 'Failed to process job'
        });
    }
}