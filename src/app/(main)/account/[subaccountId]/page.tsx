import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Stripe from "stripe";
import { format } from "date-fns";
import { Clipboard, Contact2, DollarSign, Info, ShoppingCart } from "lucide-react";

import { getSubAccountDetails } from "@/queries/account";
import { getFunnels } from "@/queries/funnels";

import { AreaChart } from "@/components/ui/area-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleProgress } from "@/components/ui/circle-progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BadgeDelta } from "@/components/ui/badge-delta";
import PipelineValue from "@/components/modules/pipelines/PipelineValue";
import FunnelSubAccountChart from "@/components/modules/funnels/FunnelSubAccountChart";
import BlurPage from "@/components/common/BlurPage";

import { stripe } from "@/lib/stripe";
import {
  Banknote,
  TrendingUp,
  Workflow,

  BarChart3,
  LineChart,
  FileText,
} from "lucide-react";
import { constructMetadata } from "@/lib/utils";
import { getProjectCount } from "@/queries/project";
import { getTotalEmployeesBySubaccountId } from "@/queries/employees";
import { getAllTaskCountToday } from "@/queries/tasks";
import { getTransactionsForSubaccount } from "@/queries/transactions";

interface SubAccountPageIdProps {
  params: {
    subaccountId: string | undefined;
  };
}

const SubAccountPageId: React.FC<SubAccountPageIdProps> = async ({
  params,
}) => {

  const { subaccountId } = params;

  if (!subaccountId) redirect("/account/unauthorized");

  let currency: string = "USD";
  let sessions: Stripe.Checkout.Session[] = [];
  let totalClosedSessions;
  let totalPendingSessions;
  let net: number = 0;
  let potentialIncome: number = 0;
  let closingRate: number = 0;

  const currentDate = new Date().getFullYear();
  const startDate = new Date(`${currentDate}-01-01T00:00:00Z`).getTime() / 1000;
  const endDate = new Date(`${currentDate}-12-31T23:59:59Z`).getTime() / 1000;

  const subAccountDetails = await getSubAccountDetails(subaccountId);

  if (!subAccountDetails) redirect("/account/unauthorized");

  if (subAccountDetails.connectAccountId) {
    const response = await stripe.accounts.retrieve({
      stripeAccount: subAccountDetails.connectAccountId,
    });

    currency = response.default_currency?.toUpperCase() || "USD";

    const checkoutSessions = await stripe.checkout.sessions.list(
      {
        created: {
          gte: startDate,
          lte: endDate,
        },
        limit: 100,
      },
      {
        stripeAccount: subAccountDetails.connectAccountId,
      }
    );

    sessions = checkoutSessions.data;

    totalClosedSessions = checkoutSessions.data
      .filter((session) => session.status === "complete")
      .map((session) => ({
        ...session,
        created: new Date().toLocaleDateString(),
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
      }));

    totalPendingSessions = checkoutSessions.data
      .filter((session) => session.status === "open")
      .map((session) => ({
        ...session,
        created: new Date().toLocaleDateString(),
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
      }));

    net = +totalClosedSessions
      .reduce((total, session) => total + (session.amount_total || 0), 0)
      .toFixed(2);

    potentialIncome = +totalPendingSessions
      .reduce((total, session) => total + (session.amount_total || 0), 0)
      .toFixed(2);

    closingRate +
      (
        (totalClosedSessions.length / checkoutSessions.data.length) *
        100
      ).toFixed(2);
  }

  const funnels = await getFunnels(subaccountId);

  const funnelPerformanceMetrics = funnels.map((funnel) => ({
    ...funnel,
    totalFunnelVisits: funnel.funnelPages.reduce(
      (total, page) => total + page.visits,
      0
    ),
  }));


  // {!subAccountDetails.connectAccountId && (
  //   <div className="absolute -top-10 -left-10 right-0 bottom-0 z-30 flex items-center justify-center backdrop-blur-md bg-background/50">
  //     <Card>
  //       <CardHeader>
  //         <CardTitle>Connect Your Stripe</CardTitle>
  //         <CardDescription>
  //           You need to connect your stripe account to see metrics
  //         </CardDescription>
  //         <Link
  //           href={`/subaccount/${subAccountDetails.id}/launchpad`}
  //           className="p-2 w-fit bg-secondary text-white rounded-md flex items-center gap-2"
  //         >
  //           <Clipboard />
  //           Launch Pad
  //         </Link>
  //       </CardHeader>
  //     </Card>
  //   </div>
  // )} 

   
    const projects  = getProjectCount(subaccountId) ; 
   const employees = getTotalEmployeesBySubaccountId(subaccountId) ; 

const tasks = getAllTaskCountToday(subaccountId) ; 
  const transactions  = await getTransactionsForSubaccount(subaccountId) ; 
  return (
    <BlurPage>
  <div className="relative h-full px-4 py-6 space-y-8">
    {/* Dashboard Heading */}
    <h1 className="text-2xl xl:text-3xl font-semibold text-violet-600">
      Dashboard Overview
    </h1>

    {/* Top Metrics */}
    <div className="flex flex-col xl:flex-row gap-6">
      <Card className="flex-1 relative border-violet-200 shadow-md">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardDescription className="text-violet-500">Number of Projects</CardDescription>
            <CardTitle className="text-3xl align-center justify-items-center font-semibold">
              Total:{projects}
            </CardTitle>
            <small className="text-xs text-muted">Year: {format(new Date(), "yyyy")}</small>
          </div>
          <Banknote className="text-violet-500 w-6 h-6" />
        </CardHeader>
        <CardContent className="text-sm text-zinc-500">

        </CardContent>
      </Card>
 


      
      <Card className="flex-1 relative border-violet-200 shadow-md">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardDescription className="text-violet-500">Total Employees</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {employees}
            </CardTitle>
            <small className="text-xs text-muted">Year: {format(new Date(), "yyyy")}</small>
          </div>
          <TrendingUp className="text-violet-500 w-6 h-6" />
        </CardHeader>
        <CardContent className="text-sm text-zinc-500">
          Projected Employees from current opportunities.
        </CardContent>
      </Card> 


      <Card className="flex-1 relative border-violet-200 shadow-md">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardDescription className="text-violet-500">Total Tasks Pending...</CardDescription>
          <CardTitle className="text-3xl font-semibold">
            {tasks}
          </CardTitle>
          <small className="text-xs text-muted">Year: {format(new Date(), "yyyy")}</small>
        </div>
        <TrendingUp className="text-violet-500 w-6 h-6" />
      </CardHeader>
      <CardContent className="text-sm text-zinc-500">
        Projected Tasks from current opportunities.
      </CardContent>
    </Card> 

      {/* Changed "Pipeline" to "Workflow" */}
      <Card className="xl:w-fit border-violet-200 shadow-md">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardDescription className="text-violet-500">Workflow Value</CardDescription>
            <PipelineValue subAccountId={subaccountId} />
          </div>
          <Workflow className="text-violet-500 w-6 h-6" />
        </CardHeader>
      </Card>

      
    </div>

    <Card className="relative flex-1 border-violet-200 shadow-md">
        <CardHeader className="flex items-center justify-between">
          <CardDescription className="text-violet-500">Account Details</CardDescription>
          <Info className="text-violet-500 w-6 h-6" />
        </CardHeader>
        <CardContent className=" text-muted flex flex-col font-bold text-lg">

          <div className=" text-zinc-500 text-xs">
           Name-: {subAccountDetails.name}
          </div> 
          <div className=" text-zinc-500 text-xs">
           Mission-: {subAccountDetails.mission}
          </div> 
          <div className=" text-zinc-500 text-xs">
           
          Country-: {subAccountDetails.country}
          </div> 
          <div className=" text-zinc-500 text-xs">
           Goal-: {subAccountDetails.goal}
          </div> 
          <div className=" text-zinc-500 text-xs">
           Vision-: {subAccountDetails.vision}
          </div> 
          <div className=" text-zinc-500 text-xs">
           State-: {subAccountDetails.state}
          </div>
        </CardContent>
      </Card>

    {/* Charts Section */}
    <div className="flex flex-col xl:flex-row gap-6">
      

      <Card className="p-4 flex-1 border-violet-200 shadow-md">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg text-violet-600">Checkout Patterns</CardTitle>
        <LineChart className="text-violet-500 w-6 h-6" />
      </CardHeader>
    
      <AreaChart
        className="text-sm stroke-violet-500"
        data={
          transactions.map((tx) => ({
            created: new Date(tx.createdAt).toLocaleDateString(), // X-axis
            amount: tx.amount, // Y-axis
          })) || []
        }
        index="created"
        categories={["amount"]}
        colors={["violet"]}
        yAxisWidth={36}
        showAnimation
      /> 
      </Card>
    </div>

    {/* Transaction History */}
    <div className="flex flex-col xl:flex-row gap-6">
      <Card className="p-4 flex-1 h-[450px] overflow-auto relative border-violet-200 shadow-md">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-violet-600">
            Transaction History
            <BadgeDelta
              className="rounded-xl bg-transparent"
              deltaType="moderateIncrease"
              isIncreasePositive
              size="xs"
            >
              +12.3%
            </BadgeDelta>
          </CardTitle>
          <FileText className="text-violet-500 w-6 h-6" />
        </CardHeader>
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>${transaction.amount.toFixed(2)}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Card>
    </div>
  </div>
</BlurPage>


  );
};

export default SubAccountPageId;

export const metadata = constructMetadata({
  title: "Dashboard - Workeloo",
});
