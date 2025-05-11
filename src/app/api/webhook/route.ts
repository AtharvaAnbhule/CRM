import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!webhookSecret || !signature) {
    console.error('Missing webhook secret or signature');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Webhook signature mismatch');
    return new NextResponse('Invalid signature', { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error('Failed to parse event body');
    return new NextResponse('Invalid body', { status: 400 });
  }

  switch (event.event) {
    case 'payment_link.paid': {
      const paymentLink = event.payload.payment_link.entity;
      const productId = paymentLink.notes?.productId;
      const email = paymentLink.customer?.email;

      console.log('📦 Payment Link Paid Webhook Received');
      console.log('Product ID:', productId);
      console.log('Customer Email:', email);

      if (!productId || !email) {
        console.error('Missing productId or email in webhook payload');
        break;
      }

      try {
        // Check product exists
        const product = await db.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          console.error('❌ Product not found');
          break;
        }

        // Decrease stock
        await db.product.update({
          where: { id: productId },
          data: {
            stock: {
              decrement: 1,
            },
          },
        });

        // Add to Purchase table
        await db.purchase.create({
          data: {
            userEmail: email,
            productId: productId,
          },
        });

        console.log(`✅ Purchase recorded for ${email} and stock updated.`);
      } catch (err) {
        console.error('🔥 Error processing payment_link.paid event:', err);
      }

      break;
    }

    case 'payment.failed':
      console.log('❌ Payment Failed:', event.payload.payment.entity);
      break;

    case 'payment.captured':
      console.log('✅ Payment Captured:', event.payload.payment.entity);
      break;

    default:
      console.log(`Unhandled Razorpay event: ${event.event}`);
  }

  return new NextResponse('Webhook received', { status: 200 });
}
