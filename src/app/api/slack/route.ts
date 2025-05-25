// app/api/slack/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
   const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  console.log(code) ; 
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const slackRes = await axios.post("https://slack.com/api/oauth.v2.access", null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: "https://localhost:3000/api/slack", // Must match Slack app settings
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = slackRes.data;
    console.log("Slack response:", data);

    if (!data.ok) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // Optional: Store token in DB here

    // Redirect after success
    return NextResponse.redirect("https://localhost:3000/company?connected=success");
  } catch (err: any) {
    console.error("Slack OAuth Error:", err.response?.data || err.message);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}
