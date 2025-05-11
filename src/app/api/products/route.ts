import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
} 

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, price, category, description, stock, status , agencyId } = body;

  const product = await db.product.create({
    data: {
      name,
      price: parseFloat(price),
      category,
      description,
      stock: parseInt(stock),
      agencyId,
      status,
    },
  });

  return NextResponse.json(product);
}
