import { db } from "@/lib/db";
import { NextResponse } from "next/server";
 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, agencyId, role } = body;

    if (!email || !agencyId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await db.invitation.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: "Invitation already exists for this email." }, { status: 409 });
    }

    const newInvitation = await db.invitation.create({
      data: {
        email,
        agencyId,
        role,
        status:"ACCEPTED"
      },
    });

    return NextResponse.json({ success: true, user: newInvitation });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
