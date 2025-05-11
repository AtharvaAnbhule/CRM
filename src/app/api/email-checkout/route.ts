// File: app/api/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';

const razorpay = new Razorpay({
  key_id: process.env.key_id!,
  key_secret: process.env.key_secret!,
});

export async function POST(req: NextRequest) {
  try {
    const { email, productId } = await req.json();

    if (!email || !productId) {
      return NextResponse.json({ error: 'Email and Product ID are required.' }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    // 🔥 Create a Razorpay Payment Link
    const paymentLink = await razorpay.paymentLink.create({
      amount: product.price * 100, // in paise
      currency: 'INR',
      accept_partial: false,
      description: `Payment for ${product.name}`,
      customer: {
        email: email,
      },
      notes: {
        productId, // 👈 this is key!
      },
      notify: {
        email: true,
      },
      callback_url: `${process.env.NEXT_PUBLIC_URL}/company`,
      callback_method: 'get',
    });

    // 🔥 Email the user the Razorpay-hosted payment page link
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD,
      },
    });

    const messageHtml = `
  <div style="font-family: 'Segoe UI', sans-serif; line-height: 1.6; background-color: #f9fafb; padding: 40px; border-radius: 10px; color: #333;">
    <h1 style="color: #4f46e5;">Introducing Your New Favorite Tool: ${product.name}</h1>

    <p style="font-size: 16px; color: #444;">
      We’re excited to share a powerful solution designed just for you. <strong>${product.name}</strong> is built to make your life easier and your work more effective.
    </p>

    <div style="margin-top: 20px; background: #ffffff; border: 1px solid #e5e7eb; padding: 24px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <h2 style="margin-bottom: 10px; color: #111827;">🔍 Product Overview</h2>
      <p><strong>Name:</strong> ${product.name}</p>
      <p><strong>Description:</strong> ${product.description}</p>
      <p><strong>Price:</strong> ₹${product.price}</p>
      <p><strong>Stock:</strong> ₹${product.stock}</p>
    </div>

    <p style="margin-top: 24px; font-size: 16px; color: #444;">
      When you complete your purchase, you’ll receive guaranteed access to the product within <strong>12 hours</strong>. For faster verification, please share a screenshot of your payment confirmation at 
      <a href="mailto:atharvaanbhule@gmail.com" style="color: #4f46e5;">atharvaanbhule@gmail.com</a>.
    </p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${paymentLink.short_url}" target="_blank" 
         style="background: #4f46e5; color: white; padding: 14px 28px; font-size: 16px; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.4);">
        ✅ Complete Your Payment Now
      </a>
    </div>

    <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
      This is a secure payment link powered by Razorpay. If you have any questions, feel free to reach out.
    </p>

    <hr style="margin-top: 40px; border: none; border-top: 1px solid #e5e7eb;" />

    <p style="font-size: 14px; color: #9ca3af;">Together we grow, together we succeed.</p>
    <p style="font-size: 14px; color: #9ca3af;">— Team Workeloo</p>
  </div>
`;


    await transporter.sendMail({
      from: `"Your Company" <${process.env.CONTACT_EMAIL}>`,
      to: email,
      subject: `Complete your payment for ${product.name}`,
      html: messageHtml,
    });

    return NextResponse.json({ success: true, link: paymentLink.short_url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
