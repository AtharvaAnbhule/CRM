// app/api/products/route.ts (Next.js 14 with App Router)
import { db } from '@/lib/db';
import { NextResponse } from 'next/server'
 // Adjust path to your Prisma client

export async function getProducts(agencyId:string) {
 try {
    const products = await db.product.findMany({
      where: {
        agencyId: agencyId, // Assumes 'agencyId' exists in your Product model
      },
    });

    const totalProducts = products.length;

    return NextResponse.json(totalProducts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
