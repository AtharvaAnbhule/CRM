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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";


// Pricing Card Component
type PricingCardProps = {
  title: string;
  price: number;
  description: string;
  features: string[];
  actionLabel: string;
};

const PricingCard = ({
  title,
  price,
  description,
  features,
  actionLabel,
}: PricingCardProps) => (
  <Card className="max-w-80 space-y-6">
    <CardHeader className="pb-8 pt-4 gap-8">
      <CardTitle>{title}</CardTitle>
      <h3 className="text-3xl font-bold my-6">Rs {price}</h3>
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      <CardDescription className="pt-1.5 h-12">{description}</CardDescription>
      {features.map((f, i) => (
        <span
          key={i}
          className="flex justify-center items-center gap-4 text-sm text-muted-foreground"
        >
          <CheckCircle2 className="text-green-500 h-4 w-4" />
          {f}
        </span>
      ))}
    </CardContent>
    <CardFooter className="mt-2">
      <Button className="w-full" asChild>
        <Link href={`billing/checkout/?amount=${price}`}>{actionLabel}</Link>
      </Button>
    </CardFooter>
  </Card>


  
);

// Current Package Component
const CurrentPackageBox = ({ currentPackage }: { currentPackage: any }) => {
  // Calculate expiry date (one month after the package is taken)
  const expiryDate = new Date(currentPackage.dateTaken);
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  return (
    <Card className="max-w-100 space-y-6 mt-10 w-500">
      <CardHeader className="pb-8 pt-4 gap-8">
        <CardTitle>Current Package</CardTitle>
        <h3 className="text-3xl font-bold my-6">Rs {currentPackage.price}</h3>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardDescription className="pt-1.5 h-12">{currentPackage.description}</CardDescription>
        <span className="text-sm text-muted-foreground">
          Expiry Date: {expiryDate.toLocaleDateString()}
        </span>
      </CardContent>
    
    </Card>
  );
};

export default function Page() {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const id = pathParts[2]; // assuming the URL is /company/<agencyId>/billing/checkout

  const [currentPackage, setCurrentPackage] = useState<null | {
    title: string;
    price: number;
    description: string;
    dateTaken: string;
  }>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(`/api/verify/${id}`, { method: "GET" });
        const data = await response.json();

        console.log("Fetched subscription data:", data);

        // Update with real values from the API
        setCurrentPackage({
          title: data?.title || "Starter",
          price: data?.price || 0,
          description: data?.description || "Your current subscription plan.",
          dateTaken: data?.updatedAt || new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error fetching subscription", err);
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
      description: "Essential features you need to get started",
      features: [
        "Comprehensive CRM Management",

"Dedicated Full-Time Support from the Workeloo Team",

"Unlimited User Accounts",
      ],
      actionLabel: "Get Basic",
    },
    {
      title: "Pro",
      price: 1000,
      description: "Perfect for owners of small & medium businesses",
      features: [
        "Team Workeloo will work along you for betterment of your company",
        "Full Support from Team Workeloo for Marketing,Management,Development of products",
        "Unlimited use of CRM Platform",
      ],
      actionLabel: "Get Pro",
    },
  ];

  return (
    <div className="container py-8 flex flex-col items-center justify-center text-center">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">Pricing Plans</h1>
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Choose the plan thats right for you
      </h2>
      <section className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-8 mt-20">
        {plans.map((plan) => (
          <PricingCard key={plan.title} {...plan} />
        ))}
      </section>

      {/* Show current package only if data is available */}
      {currentPackage && <CurrentPackageBox currentPackage={currentPackage} />}
    </div>
  );
}
