// /app/api/bugs/[bugId]/route.ts

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const { id } = params; // Extract the bugId from URL parameters
  
    if (!id) {
      return NextResponse.json({ error: 'Bug ID is required' }, { status: 400 });
    }
  
    try {
      // Perform the update to mark the bug as resolved
      const updatedBug = await db.bug.update({
        where: {
          id: id, // Use the bugId to find the correct bug
        },
        data: {
          isResolved: true, // Mark the bug as resolved
        },
      });
  
      return NextResponse.json(updatedBug); // Return the updated bug data
    } catch (error) {
      console.error('Error resolving bug:', error);
      return NextResponse.json({ error: 'Failed to resolve bug' }, { status: 500 });
    }
  }