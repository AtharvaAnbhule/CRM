import { db } from "@/lib/db";
import { NextResponse } from "next/server";
 

export async function GET() {
  const transactions = await db.transaction.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const txn = await db.transaction.create({ data: body });
  return NextResponse.json(txn);
}
