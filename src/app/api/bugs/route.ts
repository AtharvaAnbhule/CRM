import { db } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new NextResponse('Missing projectId', { status: 400 });
  }

  try {
    const bugs = await db.bug.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bugs);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, projectId } = await req.json();

    if (!projectId) {
      return new NextResponse('Missing projectId', { status: 400 });
    }

    const bug = await db.bug.create({
      data: {
        title,
        description,
        projectId,
      },
    });

    return NextResponse.json(bug);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 


