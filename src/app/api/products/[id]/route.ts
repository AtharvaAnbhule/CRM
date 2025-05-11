import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
 

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const deleted = await db.product.delete({
    where: { id: params.id },
  });
  return NextResponse.json(deleted);
}
