// app/api/slack/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const slackRes = await axios.post("https://slack.com/api/oauth.v2.access", null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: "https://www.workeloo.com/api/slack", // Must match Slack app settings
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
    return NextResponse.redirect("https://www.workeloo.com/company?connected=success");
  } catch (err: any) {
    console.error("Slack OAuth Error:", err.response?.data || err.message);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}
