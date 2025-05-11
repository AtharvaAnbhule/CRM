import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { agencyId: string } }
) {
  // Log params to check if id is passed correctly
  console.log("Received params:", params);

  const { agencyId } = params;

  // Check if id is valid
  if (!agencyId) {
    return NextResponse.json({ error: "Agency ID is missing" }, { status: 400 });
  }

  try {
    // Fetch the agency from the database based on the id
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      include: { subscriptions: true },
    });

    if (!agency || !agency.subscriptions || !agency.subscriptions.subscriptionId) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json(agency.subscriptions);
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
