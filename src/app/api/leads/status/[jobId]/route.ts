import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

// Import the jobs map from your generate route
import { jobs } from '../../generate/route';

export async function GET(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;

    try {
        const job = jobs.get(jobId);

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: job.status,
            progress: job.progress,
            leads: job.leads || [],
            error: job.error,
        });
    } catch (error) {
        console.error('Error fetching job status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}