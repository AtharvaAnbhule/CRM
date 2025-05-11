"use server";

import { db } from "@/lib/db";
import { Stripe } from "stripe";


export const subscriptionCreate = async (
  subscription: Stripe.Subscription,
  customerId: string
) => {
  try {
    const agency = await db.agency.findFirst({
      where: {
        customerId,
      },
    });

    if (!agency) {
      throw new Error("Could not find agency for this customer ID");
    }

    const data = {
      active: subscription.status === "active",
      agencyId: agency.id,
      customerId,
      currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
      priceId: (subscription.items.data[0]?.price?.id ?? "") as string,
      subscriptionId: subscription.id,
      plan: (subscription.items.data[0]?.price?.id ?? "") as any, // Replace with your `Plan` enum if needed
    };

    const response = await db.subscription.upsert({
      where: {
        agencyId: agency.id,
      },
      //@ts-ignore
      create: data,
      update: data,
    });

    return response;
  } catch (error) {

    throw new Error("Subscription creation failed");
  }
}; 


export const getAgencySubscription = async (agencyId: string) => {
  return await db.subscription.findFirst({
    where: { agencyId },
    orderBy: { createdAt: "desc" }, // latest subscription
  });
};
