// app/api/products/route.ts (Next.js 14 with App Router)
import { db } from '@/lib/db';
import { NextResponse } from 'next/server'
 // Adjust path to your Prisma client

export async function getProducts() {
  try {
    const products = await db.product.findMany();
    const totalProducts = products.length;

    return NextResponse.json({ products, totalProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
