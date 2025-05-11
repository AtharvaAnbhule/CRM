// app/api/leads/[id]/status/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const leadId = params.id;
    const { status , agencyId } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: { status },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("[LEAD_STATUS_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to update lead status" }, { status: 500 });
  }
}
