"use server";

import Stripe from "stripe";
import { stripe as StripeInstance } from "@/lib/stripe";
import { db } from "@/lib/db";
import { Plan, Prisma } from "@prisma/client";
import { logger } from "@/lib/utils";
import { ADD_ONS } from "@/config/add-ons";

// Runtime check to ensure price ID matches your enum
const isValidPlan = (priceId?: string): priceId is Plan => {
  return !!priceId && Object.values(Plan).includes(priceId as Plan);
};

export const subscriptionCreate = async (
  subscription: Stripe.Subscription,
  customerId: string,
) => {
  try {
    const agency = await db.agency.findFirst({
      where: {
        customerId,
      },
      include: {
        subAccounts: true,
      },
    });

    if (!agency) {
      throw new Error("Could not find an agency to upsert the subscription");
    }

    const priceItem = subscription.items.data[0]?.price;
    const priceId = priceItem?.id;

    // validate the plan before inserting
    const plan: Plan = isValidPlan(priceId)
      ? priceId
      : Plan.price_1Qo44dSEJ5pBzldsEC6ufGe1; // fallback plan

    const data: Prisma.SubscriptionUncheckedCreateInput = {
      active: subscription.status === "active",
      agencyId: agency.id,
      customerId,
      currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
      priceId: priceItem?.id || "",
      subscriptionId: subscription.id,
      plan: plan,
      price: priceItem?.unit_amount?.toString() || null,
    };

    const response = await db.subscription.upsert({
      where: {
        agencyId: agency.id,
      },
      create: data,
      update: data,
    });

    console.log("✅ Subscription successfully upserted.");
    return response;
  } catch (error) {
    logger(error);
    console.error("❌ Subscription Insert Error:", error);
  }
};

export const getAddOnsProducts = async () => {
  const addOnsProducts = await StripeInstance.products.list({
    ids: ADD_ONS.map((addOne) => addOne.id),
    expand: ["data.default_price"],
  });

  return addOnsProducts;
};

export const getPrices = async () => {
  const prices = await StripeInstance.prices.list({
    product: process.env.NEXT_PUBLIC_PLURA_PRODUCT_ID,
    active: true,
  });

  return prices;
};

export const getCharges = async (customerId: string | undefined) => {
  const charges = await StripeInstance.charges.list({
    limit: 50,
    customer: customerId,
  })

  return charges;
}


export const getConnectAccountProducts = async (stripeAccount: string) => {
  const products = await StripeInstance.products.list(
    {
      limit: 50,
      expand: ["data.default_price"],
    },
    {
      stripeAccount,
    },
  );

  return products.data;
};
