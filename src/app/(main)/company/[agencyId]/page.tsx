import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Stripe from "stripe";
import { format } from "date-fns";
import {
  Clipboard,
  Contact2,
  DollarSign,
  Goal,
  Loader,
  ShoppingCart,
  UserCheck,
  Users,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getAgencyDetails } from "@/queries/company";
import { getSubAccountsByAgency } from "@/queries/account";



import { AreaChart } from "@/components/ui/area-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CircleProgress } from "@/components/ui/circle-progress";
import BlurPage from "@/components/common/BlurPage";

import { stripe } from "@/lib/stripe";
import { constructMetadata } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import dynamic from "next/dynamic";
import { getSubAccountWithContacts } from "@/queries/contacts";


import Razorpay from "razorpay";
import { getProducts } from "@/queries/products";
import { getLeadDone } from "@/queries/Dealdone";
import { getRazorpayInstance } from "@/components/razorpayintance";



const ChartComponent = dynamic(() => import("@/components/common/Graph"), { ssr: false });

interface AgencyIdPageProps {
  params: {
    agencyId: string | undefined;
  };
}

const AgencyIdPage: React.FC<AgencyIdPageProps> = async ({ params }) => {
  const { agencyId } = params;

  if (!agencyId) redirect("/company/unauthorized");

  let currency: string = "INR";
  let sessions: Stripe.Checkout.Session[] = [];
  let totalClosedSessions;
  let totalPendingSessions;
  let net: number = 0;
  let potentialIncome: number = 0;
  let closingRate: number = 0;

  const currentDate = new Date().getFullYear();
  const startDate = new Date(`${currentDate}-01-01T00:00:00Z`).getTime() / 1000;
  const endDate = new Date(`${currentDate}-12-31T23:59:59Z`).getTime() / 1000;


  const agencyDetails = await getAgencyDetails(agencyId);

  if (!agencyDetails) redirect("/company/unauthorized");

  const subAccounts = await getSubAccountsByAgency(agencyId);

  if (agencyDetails?.connectAccountId) {
    const razorpay = getRazorpayInstance(agencyDetails.connectAccountId);
  
    const paymentsResponse = await razorpay.payments.all({
      from: Math.floor(startDate / 1000),
      to: Math.floor(endDate / 1000),
      count: 100,
    });
  
    const payments = paymentsResponse.items;
  
    const totalClosedSessions = payments
      .filter((payment) => payment.status === "captured")
      .map((payment) => ({
        ...payment,
        created: new Date(payment.created_at * 1000).toLocaleDateString(),
        amount: Number(payment.amount) / 100,
      }));
      
  
    const totalPendingSessions = payments
      .filter((payment) => payment.status === "authorized")
      .map((payment) => ({
        ...payment,
        created: new Date(payment.created_at * 1000).toLocaleDateString(),
        amount: Number(payment.amount) / 100,
      }));
      
  
      const net = +totalClosedSessions
      .reduce((sum, p) => sum + Number(p.amount), 0)
      .toFixed(2);
    
    const potentialIncome = +totalPendingSessions
      .reduce((sum, p) => sum + Number(p.amount), 0)
      .toFixed(2);
    
    const closingRate = payments.length
      ? +((totalClosedSessions.length / payments.length) * 100).toFixed(2)
      : 0;
  
    const currency = payments[0]?.currency?.toUpperCase() || "INR";
  

     
 
    // You now have:
    // totalClosedSessions, totalPendingSessions, net, potentialIncome, closingRate, currency
  }
  const products = await getProducts() ;
  // {!agencyDetails.connectAccountId && (
  //   <div className="absolute -top-10 -left-10 right-0 bottom-0 z-30 flex items-center justify-center backdrop-blur-md bg-background/50">
  //     <Card>
  //       <CardHeader>
  //         <CardTitle>Connect Your Stripe</CardTitle>
  //         <CardDescription>
  //           You need to connect your stripe account to see metrics
  //         </CardDescription>
  //         <Link
  //           href={`/agency/${agencyDetails.id}/launchpad`}
  //           className="p-2 w-fit bg-secondary text-white rounded-md flex items-center gap-2"
  //         >
  //           <Clipboard />
  //           Launch Pad
  //         </Link>
  //       </CardHeader>
  //     </Card>
  //   </div>
  // )}
  const leads = await getLeadDone(agencyId) ;
  
  return (
    <>
    <div className="relative h-full p-6">
      <h1 className="text-3xl font-bold mb-4">Analytics Overview</h1>
      <Separator className="mt-2 mb-6" />
  
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          <Card className="flex flex-col items-center text-center">
            <div className="bg-green-100 p-4 rounded-full">
              <Users className="text-green-500 w-8 h-8" />
            </div>
            <p className="text-muted-foreground mt-2">Registered Accounts</p>
            <h2 className="text-2xl font-bold">{subAccounts.length}</h2>
            <p className="text-green-500 text-sm mt-1 flex items-center">▲ 12% compared to last month</p>
          </Card>
  
          <Card className="flex flex-col items-center text-center">
            <div className="bg-green-100 p-4 rounded-full">
              <UserCheck className="text-green-500 w-8 h-8" />
            </div>
            <p className="text-muted-foreground mt-2">Company Details size</p>
            <h2 className="text-2xl font-bold">{agencyDetails.size}</h2>
            <p className="text-red-500 text-sm mt-1 flex items-center">▼ 5% compared to last month</p>
          </Card>
        </div>
  
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="relative">
            <CardHeader>
              <CardDescription>Annual Revenue</CardDescription>
              <CardTitle className="text-4xl">{"$0.0"}</CardTitle>
              <small className="text-xs text-muted-foreground">Year {format(new Date(), "yyyy")}</small>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Based on aggregated data from all payment sources.
            </CardContent>
            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
  
          
        </div>
  
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="relative">
            <CardHeader>
              <CardDescription>Client Portfolio</CardDescription>
              <CardTitle className="text-4xl">{subAccounts.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Displays the current client count in your ecosystem.
            </CardContent>
            <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
  
          <Card className="relative">
            <CardHeader>
              <CardTitle>Target Milestones</CardTitle>
              <CardDescription>
                <p className="mt-2">Visual progress of your organizations expansion goal.</p>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="w-full space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Achieved: {subAccounts.length}</span>
                  <span>Target: {agencyDetails.goal}</span>
                </div>
                <Progress value={(subAccounts.length / agencyDetails.goal) * 100} />
              </div>
            </CardFooter>
            <Goal className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
        </div>
  
        <Card className="relative">
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
            <CardDescription>
              <p className="mt-2">Summary of the data you’ve provided below.</p>
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="font-bold">Company: {agencyDetails.name || "N/A"}</div>
              <div>Location: {agencyDetails.address || "N/A"}</div>
              <div className="font-bold">Email: {agencyDetails.companyEmail || "N/A"}</div>
              <div>Contact: {agencyDetails.companyPhone || "N/A"}</div>
              <div>Label Type: {agencyDetails.whiteLabel || "N/A"}</div>
              <div>Region: {agencyDetails.state || "N/A"}</div>
              <div>Objective: {agencyDetails.goal || "N/A"}</div>
              <div>Client ID: {agencyDetails.customerId || "N/A"}</div>
              <div>Nation: {agencyDetails.country || "N/A"}</div>
            </div>
          </CardFooter>
          <Goal className="absolute right-4 top-4 text-muted-foreground" />
        </Card>


        <div className="overflow-auto rounded-lg border shadow-md mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-violet-600">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead: any) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.phone}</TableCell>
              <TableCell className="text-green-600 font-semibold">{lead.status}</TableCell>
              <TableCell>{new Date(lead.updatedAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         
        </div>
      </div>
    </div>
  </>
  );
};

export default AgencyIdPage;

export const metadata = constructMetadata({
  title: "Dashboard - Workeloo",
});