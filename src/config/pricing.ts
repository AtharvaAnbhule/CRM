export interface PricingItem {
  title: string;
  description: string;
  price: string;
  duration: string;
  highlight: string;
  features: string[];
  /** Product ID from Stripe */
  priceId: string;
}

export const PRICING: PricingItem[] = [
  {
    title: "Starter",
    description: "Ideal for individuals or small teams looking to explore Workeloo’s core features.",
    price: "Free",
    duration: "",
    highlight: "Included features:",
    features: [
      "Up to 3 client accounts",
      "2 team members",
      "Unlimited workflow creations",
    ],
    priceId: "",
  },
  {
    title: "Basic",
    description: "Great for growing agencies looking to expand their capacity with essential tools.",
    price: "₹300",
    duration: "month",
    highlight: "Everything in Starter, plus:",
    features: [
      "Unlimited client accounts",
      "Unlimited team members",
      "Advanced project & task automation",
    ],
    priceId: "price_1Qj1u1SEJ5pBzlds9jak2O09",
  },
  {
    title: "Unlimited SaaS",
    description: "A complete suite for established agencies and startups scaling operations.",
    price: "₹1000",
    duration: "month",
    highlight: "Everything in Basic, plus:",
    features: [
      "White-label branding & rebilling support",
      "Dedicated 24/7 customer support",
      "Full company setup assistance",
      "Marketing, development & finance consulting",
    ],
    priceId: "price_1Qj1u1SEJ5pBzldsSALJRSHk",
  },
];