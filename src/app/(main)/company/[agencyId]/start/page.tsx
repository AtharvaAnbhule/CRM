import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getAgencyDetails } from "@/queries/company";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { constructMetadata, logger } from "@/lib/utils";

interface StartPageProps {
  params: { agencyId: string };
  searchParams: { code?: string; state?: string };
}

export default async function StartPage({
  params,
  searchParams,
}: StartPageProps) {
  const { agencyId } = params;
  const { code, state } = searchParams;

  // 🚨 Log incoming params for debugging
  console.log("Received params:", { agencyId, code, state });

  if (!agencyId) redirect("/company/unauthorized");

  const agencyDetails = await getAgencyDetails(agencyId);
  if (!agencyDetails) redirect("/company/unauthorized");

  let connectedSlack = false;

  const SLACK_CLIENT_ID = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!;
  const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET!;
  const SLACK_REDIRECT_URI = process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI!;

  console.log("SLACK_CLIENT_ID", SLACK_CLIENT_ID);
  console.log("SLACK_REDIRECT_URI", SLACK_REDIRECT_URI);

  if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET || !SLACK_REDIRECT_URI) {
    throw new Error("Slack environment variables missing.");
  }

  if (code) {
    try {
      const response = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: SLACK_CLIENT_ID,
          client_secret: SLACK_CLIENT_SECRET,
          redirect_uri: SLACK_REDIRECT_URI,
        }),
      });

      const slackData = await response.json();
      console.log("Slack response:", slackData);

      if (slackData.ok) {
        connectedSlack = true;
        // Store slackData.team.id, access_token, etc. in your DB if needed
        redirect(`/company/${agencyId}`);
      }
    } catch (error) {
      logger("Slack OAuth Error", error);
    }
  }

  const isAllDetailsExist =
    agencyDetails.address &&
    agencyDetails.agencyLogo &&
    agencyDetails.city &&
    agencyDetails.companyEmail &&
    agencyDetails.companyPhone &&
    agencyDetails.country &&
    agencyDetails.name &&
    agencyDetails.state &&
    agencyDetails.zipCode;

  const slackOAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=channels:read,chat:write&redirect_uri=${encodeURIComponent(
    SLACK_REDIRECT_URI
  )}&state=${agencyId}`;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="w-full max-w-[800px]">
        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-6 px-8">
            <CardTitle className="text-3xl font-bold">Welcome to Your Start point!</CardTitle>
            <CardDescription className="mt-2">
              Complete the steps below to start managing your workspace.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 p-8">
            <Step
              image="/appstore.png"
              description="Download the app and get started on your mobile device."
              action={<Button>Download App</Button>}
            />

            <Step
              image={agencyDetails.agencyLogo || "/placeholder-logo.png"}
              description="Complete your company profile."
              action={
                isAllDetailsExist ? (
                  <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                ) : (
                  <Link
                    href={`/company/${agencyId}/settings`}
                    className={buttonVariants()}
                  >
                    Complete Profile
                  </Link>
                )
              }
            />

            <Step
              image="/assets/download.png"
              description="Connect your Slack workspace for real-time updates."
              action={
                connectedSlack ? (
                  <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                ) : (
                  <Link href={slackOAuthUrl} className={buttonVariants()}>
                    Connect Slack
                  </Link>
                )
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Step({
  image,
  description,
  action,
}: {
  image: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center border p-4 rounded-md gap-4">
      <div className="flex items-center gap-4">
        <Image src={image} alt="Step" height={80} width={80} className="rounded-md" />
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export const metadata = constructMetadata({
  title: "Start - Workeloo",
});
