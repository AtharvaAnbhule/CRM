// app/agency/[agencyId]/billing/page.tsx

import React from "react";
import { redirect } from "next/navigation";
import { getAddOnsProducts, getCharges, getPrices } from "@/lib/stripe/stripe-actions";
import { getAgencySubscription } from "@/queries/company";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import Price from "@/components/modules/billing/Price";
import { PRICING } from "@/config/pricing";
import { cn, constructMetadata } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const dynamic = "force-dynamic"; // Ensure it's always rendered fresh

interface AgencyBillingPageProps {
  params: {
    agencyId: string | undefined;
  };
}

const AgencyBillingPage: React.FC<AgencyBillingPageProps> = async ({ params }) => {
  const { agencyId } = params;

  if (!agencyId) redirect("/company/unauthorized");

  const addOns = await getAddOnsProducts();
  const agencySubscription = await getAgencySubscription(agencyId);
  const prices = await getPrices();

  // Debug logs
  console.log("Agency Subscription:", agencySubscription);

  const priceId = agencySubscription?.subscriptions?.priceId;
  const currentPlanDetails = PRICING.find((price) => price.priceId === priceId);

  const charges = await getCharges(agencySubscription?.customerId);
  const allCharges = charges.data.map((charge) => ({
    id: charge.id,
    description: charge.description || "N/A",
    date: charge.created
      ? format(new Date(charge.created * 1000), "dd/MM/yyyy hh:mm a")
      : "Invalid Date",
    status: charge.status || "Unknown",
    amount: charge.amount ? `$${(charge.amount / 100).toFixed(2)}` : "$0.00",
  }));

  const isActive = agencySubscription?.subscriptions?.active;
  const amt = isActive && currentPlanDetails?.price ? currentPlanDetails?.price : "$0";
  const buttonCta = isActive ? "Change Plan" : "Get Started";
  const description =
    isActive && currentPlanDetails?.description
      ? currentPlanDetails.description
      : "Let's get started! Pick a plan that works best for you!";
  const title = isActive && currentPlanDetails?.title ? currentPlanDetails.title : "Starter";
  const starterFeatures = PRICING.find((p) => p.title === "Starter")?.features || [];
  const features = isActive && currentPlanDetails?.features ? currentPlanDetails.features : starterFeatures;
  const latestCharge = allCharges.length > 0 ? allCharges[0] : null;
  charges.data.sort((a, b) => b.created - a.created);


  const charge = await getCharges(agencySubscription?.customerId);




  return (
    <div className="bg-gradient-to-br min-h-screen p-8 dark:text-white">
      <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Billing for International Users in USD</h1>
      <Separator className="mb-6 border-white/20" />

      <h2 className="text-3xl mb-6">Current Plan</h2>
      <div className="flex flex-col lg:flex-row gap-8">
     
        <Price
          isPlanExists={Boolean(isActive)}
          prices={prices.data}
          customerId={agencySubscription?.customerId || ""}
          amt={amt}
          buttonCta={buttonCta}
          description={description}
          title={title}
          highlightTitle="Plan Options"
          highlightDescription="Modify your plan or contact support at support@VanzIo.com."
          duration="/ month"
          features={features}
        />
      </div>

      <h2 className="text-3xl mt-10 mb-6">Payment History</h2>
      <Table className="dark:bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Invoice ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allCharges.length > 0 ? (
            allCharges.map((charge) => (
              <TableRow key={charge.id}>
                <TableCell>{charge.description}</TableCell>
                <TableCell>{charge.date}</TableCell>
                <TableCell>
                  <Badge
                    className={cn({
                      "bg-emerald-500 dark:text-white": charge.status.toLowerCase() === "paid",
                      "bg-orange-600 dark:text-white": charge.status.toLowerCase() === "pending",
                      "bg-red-600 dark:text-white": charge.status.toLowerCase() === "failed",
                    })}
                  >
                    {charge.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{charge.amount}</TableCell>
                <TableCell className="text-gray-400">{charge.id}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-14 text-gray-400">
                No charges found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgencyBillingPage;

export const metadata = constructMetadata({
  title: "Billing - Vanz.Io",
}); 