import { db } from "@/lib/db";

// src/app/api/feedback/route.ts
 

export async function POST(req: Request) {
  try {
    const { rating, suggestion, email } = await req.json();

    if (!rating || rating < 0 || rating > 10) {
      return new Response(JSON.stringify({ error: 'Invalid rating. Must be between 0 and 10.' }), { status: 400 });
    }

    const feedback = await db.feedback.create({
      data: { rating, suggestion, email },
    });

    return new Response(JSON.stringify(feedback), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to submit feedback.' }), { status: 500 });
  }
}
