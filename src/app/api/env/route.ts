// app/api/env/route.ts

import { db } from "@/lib/db";
import {  NextResponse } from "next/server";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const subaccountId = searchParams.get("subaccountId");

  if (!subaccountId) {
    return NextResponse.json({ error: "Missing subaccountId" }, { status: 400 });
  }

  try {
    const body = await req.json();

    const saved = await db.envKey.create({
      data: {
        subaccountId,
        ...body,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error saving data" }, { status: 500 });
  }
}


// app/api/env-keys/route.js
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subaccountId = searchParams.get("subaccountId");

  if (!subaccountId) {
    return NextResponse.json({ error: "Missing subaccountId" }, { status: 400 });
  }

  const keys = await db.envKey.findMany({
    where: { subaccountId },
    orderBy: { createdAt: "desc" }, // newest first
  });

  return NextResponse.json(keys);
}
  