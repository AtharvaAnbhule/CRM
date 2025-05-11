// app/api/facebook/webhook/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";  // your Prisma client

const FB_APP_ID        = "1240662807489806";
const FB_APP_SECRET    = "c080f89fe6f8b941d3d6485986fb9811";
const VERIFY_TOKEN     = "12345678";
let   PAGE_ACCESS_TOKEN = ""; // we’ll fetch once and cache

// GET: verify webhook
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");
  
    console.log("Webhook verification attempt:", { mode, token, challenge });
  
    if (mode === "subscribe" && token === process.env.FB_WEBHOOK_VERIFY_TOKEN) {
      return new Response(challenge ?? "", { status: 200 });
    }
  
    return new Response("Forbidden", { status: 403 });
  }
  

// POST: handle incoming leadgen
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 FB Webhook:", body);

    const entry      = body.entry?.[0];
    const change     = entry?.changes?.[0];
    const leadgen_id = change?.value?.leadgen_id;
    if (!leadgen_id) {
      return NextResponse.json({ error: "Missing leadgen_id" }, { status: 400 });
    }

    // 1) fetch page token if not already
    if (!PAGE_ACCESS_TOKEN) {
      const tokenRes = await fetch(
        `https://graph.facebook.com/oauth/access_token` +
        `?client_id=${FB_APP_ID}` +
        `&client_secret=${FB_APP_SECRET}` +
        `&grant_type=client_credentials`
      );
      const tokenData = await tokenRes.json();
      PAGE_ACCESS_TOKEN = tokenData.access_token;
    }

    // 2) fetch full lead data
    const leadRes = await fetch(
      `https://graph.facebook.com/v18.0/${leadgen_id}` +
      `?access_token=${PAGE_ACCESS_TOKEN}`
    );
    const leadData = await leadRes.json();
    console.log("✅ Lead data:", leadData);

    // 3) extract fields
    const fieldMap: Record<string, string> = {};
    for (const field of leadData.field_data ?? []) {
      fieldMap[field.name.toLowerCase()] = field.values?.[0] ?? "";
    }

    // 4) persist to your DB
    await db.lead.create({
      data: {
        name:     fieldMap.full_name || fieldMap.name || "Unknown",
        email:    fieldMap.email || null,
        phone:    fieldMap.phone || null,
        Category: "Facebook",
        message:  fieldMap.message || "",
        source:   "Facebook",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error processing lead:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
