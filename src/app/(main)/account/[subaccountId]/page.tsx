import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Stripe from "stripe";
import { format } from "date-fns";
import {
  Clipboard,
  Contact2,
  DollarSign,
  Info,
  ShoppingCart,
} from "lucide-react";

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

  const projects = getProjectCount(subaccountId);
  const employees = getTotalEmployeesBySubaccountId(subaccountId);
  const tasks = getAllTaskCountToday(subaccountId);
  const transactions = await getTransactionsForSubaccount(subaccountId);

  return (
    <BlurPage>
      <div className="relative h-full px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Dashboard Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "MMMM d, yyyy")} • {subAccountDetails.name}
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Projects Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Projects
              </CardDescription>
              <Banknote className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active projects this year
              </p>
            </CardContent>
          </Card>

          {/* Employees Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Employees
              </CardDescription>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total team members
              </p>
            </CardContent>
          </Card>

          {/* Tasks Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Pending Tasks
              </CardDescription>
              <Workflow className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks to complete today
              </p>
            </CardContent>
          </Card>

          {/* Pipeline Value Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 ">
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Workflow Value
              </CardDescription>
              <BarChart3 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <PipelineValue subAccountId={subaccountId} />
              <p className="text-xs text-muted-foreground mt-1">
                Current pipeline valuation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Details & Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Account Details Card */}
          <Card className="lg:col-span-1 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Account Details</CardTitle>
                <Info className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="font-medium">{subAccountDetails.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Mission
                </p>
                <p className="font-medium">{subAccountDetails.mission}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <p className="font-medium">
                  {subAccountDetails.state}, {subAccountDetails.country}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Vision
                </p>
                <p className="font-medium">{subAccountDetails.vision}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Goal
                </p>
                <p className="font-medium">{subAccountDetails.goal}</p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Chart Card */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Transaction Activity</CardTitle>
                <LineChart className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <AreaChart
                className="h-[300px]"
                data={
                  transactions.map((tx) => ({
                    created: new Date(tx.date).toLocaleDateString(),
                    amount: tx.amount,
                  })) || []
                }
                index="created"
                categories={["amount"]}
                colors={["primary"]}
                yAxisWidth={60}
                showAnimation
              />
            </CardContent>
          </Card>
        </div>

        {/* Transaction History Table */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <div className="flex items-center gap-2">
                <BadgeDelta
                  deltaType="moderateIncrease"
                  isIncreasePositive
                  size="sm">
                  +12.3%
                </BadgeDelta>
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {transaction.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-right">
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </BlurPage>
  );
};

export default SubAccountPageId;

export const metadata = constructMetadata({
  title: "Dashboard - Workeloo",
});
