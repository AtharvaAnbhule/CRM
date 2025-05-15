// app/api/facebook/leads/route.ts
export async function GET() {
  const FB_APP_ID = "1240662807489806";
  const FB_APP_SECRET = "c080f89fe6f8b941d3d6485986fb9811";

  try {
    // Step 1: Get App Access Token
    const tokenRes = await fetch(
      `https://graph.facebook.com/oauth/access_token?client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&grant_type=client_credentials`
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Step 2: Replace with your lead ID or list call
    const leadgen_id = "YOUR_LEADGEN_ID_HERE"; // ← real ID needed
    const leadRes = await fetch(
      `https://graph.facebook.com/v18.0/${leadgen_id}?access_token=${accessToken}`
    );
    const leadData = await leadRes.json();

    return Response.json({ lead: leadData });
  } catch (err: any) {
    console.error("❌ Failed to fetch lead:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
