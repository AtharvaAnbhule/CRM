"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { type Plan } from "@prisma/client";
import { toast } from "sonner";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { getStripe } from "@/lib/stripe/stripe-client";
import { useModal } from "@/hooks/use-modal";
import SubscriptionDetails from "@/components/forms/SubscriptionDetails";
import Loading from "@/components/ui/loading";
import { PRICING } from "@/config/pricing";
import { cn } from "@/lib/utils";

interface SubscriptionFormWrapperProps {
  customerId: string;
  isPlanExists: boolean;
}

const SubscriptionFormWrapper: React.FC<SubscriptionFormWrapperProps> = ({
  customerId,
  isPlanExists,
}) => {
  const router = useRouter();
  const { setClose, data } = useModal();

  const [selectedPriceId, setSelectedPriceId] = React.useState<Plan | "">(
    data?.plans?.defaultPriceId || ""
  );
  const [subscription, setSubscription] = React.useState<{
    subscriptionId: string;
    clientSecret: string;
  }>({ clientSecret: "", subscriptionId: "" });

  const stripeOptions: StripeElementsOptions = React.useMemo(
    () => ({
      clientSecret: subscription?.clientSecret,
      appearance: {
        theme: "flat",
      },
    }),
    [subscription]
  );

  React.useEffect(() => {
    if (!selectedPriceId) return;

    const createSecret = async () => {
      const res = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: selectedPriceId,
          customerId,
        }),
      });

      const data = await res.json();

      setSubscription({
        clientSecret: data.clientSecret,
        subscriptionId: data.subscriptionId,
      });

      if (isPlanExists) {
        toast("Plan updated successfully.");
        setClose();
        router.refresh();
      }
    };

    createSecret();
  }, [selectedPriceId, customerId, data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.plans?.plans.map((plan) => {
          const isSelected = selectedPriceId === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPriceId(plan.id as Plan)}
              className={cn(
                "border rounded-xl p-5 cursor-pointer shadow-sm transition-all hover:shadow-md bg-white dark:bg-neutral-900",
                isSelected && "border-violet-600 ring-2 ring-violet-400"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                    ${plan.unit_amount ? plan.unit_amount / 100 : "0"}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{plan.nickname}</p>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                    {PRICING.find((p) => p.priceId === plan.id)?.description}
                  </p>
                </div>

                {isSelected && (
                  <span className="h-3 w-3 mt-1 rounded-full bg-emerald-500 shadow-md" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {stripeOptions.clientSecret && !isPlanExists && (
        <>
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">Payment Method</h2>
          <Elements stripe={getStripe()} options={stripeOptions}>
            <SubscriptionDetails selectedPriceId={selectedPriceId} />
          </Elements>
        </>
      )}

      {!stripeOptions.clientSecret && selectedPriceId && (
        <div className="flex justify-center items-center h-32">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default SubscriptionFormWrapper;
