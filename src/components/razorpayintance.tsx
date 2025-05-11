// lib/razorpay.ts
import Razorpay from 'razorpay';

export function getRazorpayInstance(accountId?: string) {
  return new Razorpay({
    key_id: process.env.key_id!,
    key_secret: process.env.key_secret!,
    headers: accountId ? { "X-Razorpay-Account": accountId } : undefined,
  });
}
