import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).send("Missing or invalid code");
  }

  try {
    const slackRes = await axios.post("https://slack.com/api/oauth.v2.access", null, {
      params: {
        client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: "https://www.workeloo.com/api/slack", // must match Slack config
      },
    });

    const data = slackRes.data;

    if (!data.ok) {
      return res.status(400).json({ error: data.error });
    }

    // You can store the token (data.access_token) and team/user info in your DB here

    // After successful connection, redirect user to your /company page
    res.redirect("/company?connected=success");
  } catch (err) {
    console.error("Slack OAuth error", err);
    res.status(500).send("Slack OAuth failed");
  }
}
