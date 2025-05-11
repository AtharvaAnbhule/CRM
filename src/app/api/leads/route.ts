import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, phone , message , Category } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    const lead = await db.lead.create({
        //@ts-ignore
      data: { name, email, phone  , message , Category},
    });

    return NextResponse.json({ message: "Lead captured successfully!", lead });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 



export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // Fetch leads from database based on category
    const leads = await db.lead.findMany({
      where: {
        Category: category,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
