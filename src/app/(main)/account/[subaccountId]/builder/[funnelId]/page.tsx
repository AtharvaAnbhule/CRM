import React from "react";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";

import { getFunnel } from "@/queries/funnels";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlurPage from "@/components/common/BlurPage";
import FunnelSettings from "@/components/modules/funnels/FunnelSettings";
import FunnelSteps from "@/components/modules/funnels/FunnelSteps";

import { cn, constructMetadata } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface FunnelIdPageProps {
  params: {
    funnelId?: string;
    subaccountId?: string;
  };
}

const FunnelIdPage = async ({ params }: FunnelIdPageProps) => {
  const { funnelId, subaccountId } = params;

  if (!funnelId || !subaccountId) {
    return <div className="text-red-500">Invalid Funnel or Subaccount ID</div>;
  }

  const funnelPages = await getFunnel(funnelId);

  if (!funnelPages) {
    return <div className="text-red-500">Funnel not found</div>;
  }

  return (
    <BlurPage>
      <div className="flex justify-between items-center mb-4">
        <Link
          href="#"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "inline-flex items-center gap-2"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <Sheet>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex items-center gap-2 ml-auto"
            )}
          >
            <Settings className="w-4 h-4" />
            Settings
          </SheetTrigger>
          <SheetContent side="bottom" className="w-full h-[80vh] p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Builder Settings</h2>
            <FunnelSettings subAccountId={subaccountId} defaultData={funnelPages} />
          </SheetContent>
        </Sheet>
      </div>
      <Tabs defaultValue="steps" className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none sm:flex-row flex-col flex-start gap-4 sm:gap-0 sm:h-16 h-auto w-full sm:justify-between mb-4 pb-4 sm:pb-0">
          <h1 className="text-3xl font-bold mb-4 text-secondary-foreground">{funnelPages.name}</h1>
          <div className="flex items-center w-full sm:w-auto">
            <TabsTrigger value="steps">Pages</TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="steps">
          <FunnelSteps
            funnel={funnelPages}
            subAccountId={subaccountId}
            initialPages={funnelPages.funnelPages}
            funnelId={funnelId}
          />
        </TabsContent>
      </Tabs>
    </BlurPage>
  );
};

export default FunnelIdPage;

export const metadata = constructMetadata({
  title: "Funnel - Workeloo",
});
