import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db"; // adjust this if needed
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderCreationId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      agencyId,
      amount,
    } = body;

    const secret = process.env.key_secret;

    if (!secret) {
      console.error("RAZORPAY_SECRET is not defined.");
      return NextResponse.json({ isOk: false, message: "Server config error" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderCreationId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({
        isOk: false,
        message: "Invalid signature. Payment verification failed.",
      });
    }

    const currentPeriodEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription = await db.subscription.upsert({
      where: {
        agencyId: agencyId, // assumes agencyId is unique
      },
      update: {
        subscriptionId: razorpayOrderId,
        customerId: razorpayPaymentId,
        priceId: "monthly-basic", // update if needed
        currentPeriodEndDate,
        active: true,
        price: amount,
      },
      create: {
        agencyId: agencyId,
        subscriptionId: razorpayOrderId,
        customerId: razorpayPaymentId,
        priceId: "monthly-basic", // same here
        currentPeriodEndDate,
        active: true,
        price: amount,
      },
    });

    return NextResponse.json({
      isOk: true,
      message: "Payment verified and subscription upserted successfully.",
      subscription,
    });

  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json({
      isOk: false,
      message: "Internal Server Error during payment verification.",
    });
  }
}


