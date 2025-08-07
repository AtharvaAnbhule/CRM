// // app/agency/[agencyId]/billing/page.tsx

// import React from "react";
// import { redirect } from "next/navigation";
// import { getAddOnsProducts, getCharges, getPrices } from "@/lib/stripe/stripe-actions";
// import { getAgencySubscription } from "@/queries/company";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Separator } from "@/components/ui/separator";
// import Price from "@/components/modules/billing/Price";
// import { PRICING } from "@/config/pricing";
// import { cn, constructMetadata } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
// import { format } from "date-fns";

// export const dynamic = "force-dynamic"; // Ensure it's always rendered fresh

// interface AgencyBillingPageProps {
//   params: {
//     agencyId: string | undefined;
//   };
// }

// const AgencyBillingPage: React.FC<AgencyBillingPageProps> = async ({ params }) => {
//   const { agencyId } = params;

//   if (!agencyId) redirect("/company/unauthorized");

//   const addOns = await getAddOnsProducts();
//   const agencySubscription = await getAgencySubscription(agencyId);
//   const prices = await getPrices();

//   // Debug logs
//   console.log("Agency Subscription:", agencySubscription);

//   const priceId = agencySubscription?.subscriptions?.priceId;
//   const currentPlanDetails = PRICING.find((price) => price.priceId === priceId);

//   const charges = await getCharges(agencySubscription?.customerId);
//   const allCharges = charges.data.map((charge) => ({
//     id: charge.id,
//     description: charge.description || "N/A",
//     date: charge.created
//       ? format(new Date(charge.created * 1000), "dd/MM/yyyy hh:mm a")
//       : "Invalid Date",
//     status: charge.status || "Unknown",
//     amount: charge.amount ? `$${(charge.amount / 100).toFixed(2)}` : "$0.00",
//   }));

//   const isActive = agencySubscription?.subscriptions?.active;
//   const amt = isActive && currentPlanDetails?.price ? currentPlanDetails?.price : "$0";
//   const buttonCta = isActive ? "Change Plan" : "Get Started";
//   const description =
//     isActive && currentPlanDetails?.description
//       ? currentPlanDetails.description
//       : "Let's get started! Pick a plan that works best for you!";
//   const title = isActive && currentPlanDetails?.title ? currentPlanDetails.title : "Starter";
//   const starterFeatures = PRICING.find((p) => p.title === "Starter")?.features || [];
//   const features = isActive && currentPlanDetails?.features ? currentPlanDetails.features : starterFeatures;
//   const latestCharge = allCharges.length > 0 ? allCharges[0] : null;
//   charges.data.sort((a, b) => b.created - a.created);

//   const charge = await getCharges(agencySubscription?.customerId);

//   return (
//     <div className="bg-gradient-to-br min-h-screen p-8 dark:text-white">
//       <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Billing</h1>
//       <Separator className="mb-6 border-white/20" />

//       <h2 className="text-3xl mb-6">Current Plan</h2>
//       <div className="flex flex-col lg:flex-row gap-8">

//         <Price
//           isPlanExists={Boolean(isActive)}
//           prices={prices.data}
//           customerId={agencySubscription?.customerId || ""}
//           amt={amt}
//           buttonCta={buttonCta}
//           description={description}
//           title={title}
//           highlightTitle="Plan Options"
//           highlightDescription="Modify your plan or contact support at support@VanzIo.com."
//           duration="/ month"
//           features={features}
//         />
//       </div>

//       <h2 className="text-3xl mt-10 mb-6">Payment History</h2>
//       <Table className="dark:bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
//         <TableHeader>
//           <TableRow>
//             <TableHead>Description</TableHead>
//             <TableHead>Date</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Invoice ID</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {allCharges.length > 0 ? (
//             allCharges.map((charge) => (
//               <TableRow key={charge.id}>
//                 <TableCell>{charge.description}</TableCell>
//                 <TableCell>{charge.date}</TableCell>
//                 <TableCell>
//                   <Badge
//                     className={cn({
//                       "bg-emerald-500 dark:text-white": charge.status.toLowerCase() === "paid",
//                       "bg-orange-600 dark:text-white": charge.status.toLowerCase() === "pending",
//                       "bg-red-600 dark:text-white": charge.status.toLowerCase() === "failed",
//                     })}
//                   >
//                     {charge.status.toUpperCase()}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>{charge.amount}</TableCell>
//                 <TableCell className="text-gray-400">{charge.id}</TableCell>
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={5} className="text-center py-14 text-gray-400">
//                 No charges found.
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

// export default AgencyBillingPage;

// export const metadata = constructMetadata({
//   title: "Billing - Vanz.Io",
// });

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type PricingCardProps = {
  title: string;
  price: number;
  description: string;
  features: string[];
  actionLabel: string;
  popular?: boolean;
  current?: boolean;
};

const PricingCard = ({
  title,
  price,
  description,
  features,
  actionLabel,
  popular = false,
  current = false,
}: PricingCardProps) => (
  <Card
    className={`w-full max-w-md relative overflow-hidden ${current ? "border-2 border-primary" : ""}`}>
    {popular && (
      <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-bold px-4 py-1 transform translate-x-2 translate-y-2 rotate-12">
        MOST POPULAR
      </div>
    )}
    <CardHeader className="pb-4">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-2xl flex items-center gap-2">
            {title}
            {current && <Badge variant="secondary">Current Plan</Badge>}
          </CardTitle>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold">Rs {price}</span>
          <span className="text-muted-foreground block text-sm">/month</span>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-3">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="text-green-500 h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{f}</span>
          </div>
        ))}
      </div>
      <Button className="w-full mt-6" size="lg" asChild>
        <Link href={`billing/checkout/?amount=${price}`}>
          {actionLabel}
          {popular && <Zap className="ml-2 h-4 w-4 fill-current" />}
        </Link>
      </Button>
    </CardContent>
  </Card>
);

const CurrentPackageBox = ({ currentPackage }: { currentPackage: any }) => {
  const expiryDate = new Date(currentPackage.dateTaken);
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  const daysRemaining = Math.floor(
    (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Show Rs 0 if subscription has expired (daysRemaining <= 0)
  const displayPrice = daysRemaining > 0 ? currentPackage.price : 0;
  const statusText =
    daysRemaining > 0
      ? `Renews on ${expiryDate.toLocaleDateString()} (${daysRemaining} days remaining)`
      : "Subscription expired";

  return (
    <div className="w-full max-w-4xl mt-12">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Crown className="h-5 w-5 text-yellow-500" />
        Your Current Subscription
      </h3>
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl">
              {currentPackage.title} Plan
            </CardTitle>
            <CardDescription className="mt-2">
              Active since{" "}
              {new Date(currentPackage.dateTaken).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold">Rs {displayPrice}</span>
            <span className="text-muted-foreground block text-sm">
              {daysRemaining > 0 ? "per month" : "subscription expired"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{statusText}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan includes</p>
              <p className="font-medium">{currentPackage.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default function Page() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const id = pathParts[2];

  const [currentPackage, setCurrentPackage] = useState<null | {
    title: string;
    price: number;
    description: string;
    dateTaken: string;
  }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/verify/${id}`, { method: "GET" });
        const data = await response.json();

        setCurrentPackage({
          title: data?.title || "Starter",
          price: data?.price || 0,
          description: data?.description || "Your current subscription plan.",
          dateTaken: data?.updatedAt || new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error fetching subscription", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubscription();
    }
  }, [id]);

  const plans = [
    {
      title: "Basic",
      price: 300,
      description: "Essential features to get started",
      features: [
        "Comprehensive CRM Management",
        "Dedicated Full-Time Support",
        "Unlimited User Accounts",
        "Basic Analytics Dashboard",
        "Email Support",
      ],
      actionLabel: "Get Basic",
    },
    {
      title: "Pro",
      price: 1000,
      description: "Perfect for small & medium businesses",
      features: [
        "Team Workeloo works alongside you",
        "Full Support for Marketing & Management",
        "Priority 24/7 Support",
        "Advanced Analytics",
        "API Access",
        "Custom Workflows",
      ],
      actionLabel: "Get Pro",
      popular: true,
    },
  ];

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {[1, 2].map((i) => (
            <Card key={i} className="w-full max-w-md">
              <CardHeader>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-24 mt-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full mt-6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Pricing Plans
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your business needs
        </p>
      </div>

      <div className="flex flex-col lg:flex-row justify-center gap-8 items-stretch">
        {plans.map((plan) => (
          <PricingCard
            key={plan.title}
            {...plan}
            current={currentPackage?.title === plan.title}
          />
        ))}
      </div>

      {currentPackage && <CurrentPackageBox currentPackage={currentPackage} />}

      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>
          Need something custom? Contact our sales team for enterprise
          solutions.
        </p>
        <p className="mt-2">
          All plans come with a 14-day money-back guarantee.
        </p>
      </div>
    </div>
  );
}
