import { db } from "@/lib/db";
import { NextResponse } from "next/server";
// Assuming you've initialized Prisma here

export async function fetchallleads() {
  try {
    const leads = await db.lead.findMany(); // Fetch all leads from the database
    return NextResponse.json(leads); // Return the fetched leads as JSON
  } catch (error) {
    console.error("Error fetching leads: ", error);
    return NextResponse.error(); // Return error response if something fails
  }
}
