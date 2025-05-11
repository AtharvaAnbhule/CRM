"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useModal } from "@/hooks/use-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/common/CustomModal";

import { PriceList } from "@/lib/types";
import { PRICING } from "@/config/pricing";
import SubscriptionFormWrapper from "@/app/(main)/company/[agencyId]/InternationalBilling/_components/SubscriptionFormWrapper";

interface PricingCardProps {
  customerId: string;
  prices: PriceList["data"];
  isPlanExists: boolean;
  selectedPriceId?: string;
}

const Price: React.FC<PricingCardProps> = ({
  customerId,
  prices,
  isPlanExists,
  selectedPriceId,
}) => {
  const searchParams = useSearchParams();
  const planFromQuery = searchParams.get("plan");

  const { setOpen } = useModal();

  const selectedStripePlan = prices.find(
    (p) => p.id === selectedPriceId || p.id === planFromQuery
  ) || prices[0];

  const localPlan = PRICING.find(
    (item) => item.priceId === selectedStripePlan?.id
  );

  const amt = selectedStripePlan?.unit_amount
    ? `$${(selectedStripePlan.unit_amount / 100).toFixed(2)}`
    : localPlan?.price || "$0";

  const title = localPlan?.title || "Custom Plan";
  const description =
    localPlan?.description || "Custom features tailored to you";
  const duration = selectedStripePlan?.recurring?.interval
    ? `/${selectedStripePlan.recurring.interval}`
    : "";
  const features = localPlan?.features || ["Standard features included"];
  const highlightTitle = localPlan?.highlight || "What you get";
  const highlightDescription =
    "Modify or upgrade your subscription anytime as your needs grow.";
  const buttonCta = isPlanExists ? "Change Plan" : "Get Started";

  const handleManagePlan = async () => {
    setOpen(
      <CustomModal
        title="Manage Subscription"
        subTitle="Customize your subscription plan as per your growing business needs."
        scrollShadow={false}
      >
        <SubscriptionFormWrapper
          customerId={customerId}
          isPlanExists={isPlanExists}
        />
      </CustomModal>,
      async () => ({
        plans: {
          defaultPriceId: selectedStripePlan.id,
          plans: prices,
        },
      })
    );
  };

  return (
    <Card className="relative w-full max-w-5xl border border-gray-300 dark:border-neutral-700 rounded-2xl shadow-sm p-6 transition-all bg-gradient-to-br from-white via-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-md text-gray-600 dark:text-gray-300">
            {description}
          </CardDescription>
        </div>

        <div className="text-right lg:text-center">
          <h2 className="text-5xl font-bold text-violet-700 dark:text-violet-400">
            {amt}
            <span className="text-base font-light text-gray-500 dark:text-gray-400 ml-1">
              {duration}
            </span>
          </h2>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              What’s included:
            </h4>
            <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
              {features.map((feature, idx) => (
                <li key={`${feature}-${idx}`}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-neutral-900 shadow-inner">
            <h5 className="text-md font-medium text-gray-800 dark:text-white">
              {highlightTitle}
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {highlightDescription}
            </p>
            <div className="mt-6">
              <Button
                onClick={handleManagePlan}
                className="w-full md:w-auto bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 text-md font-semibold rounded-lg"
              >
                {buttonCta}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-6 border-t dark:border-neutral-800 mt-6 text-sm text-muted-foreground flex justify-between">
        <p className="text-gray-500 dark:text-gray-400">
          Cancel anytime • No hidden fees
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          Powered by your own payment gateway
        </p>
      </CardFooter>
    </Card>
  );
};

export default Price;
