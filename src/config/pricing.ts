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
    description: "Perfect for trying out Workeloo",
    price: "Free",
    duration: "",
    highlight: "Key features",
    features: ["3 accounts", "2 members", "Unlimited Workflows"],
    priceId: "",
  },
  {
    title: "Unlimited Saas",
    description: "The ultimate agency kit",
    price: "Rs5999",
    duration: "month",
    highlight: "Key features",
    features: ["Everything in Starter and Basic", "Rebilling", "24/7 Support team","Full Etablishment of Company","Help in Marketing,Development,Manage Finances etc..."],
    priceId: "price_1Qj1u1SEJ5pBzldsSALJRSHk",
  },
  {
    title: "Basic",
    description: "For serious agency owners",
    price: "Rs200",
    duration: "month",
    highlight: "Everything in Starter",
    features: ["Everything in Starter", "Unlimited accounts", "Unlimited members"],
    priceId: "price_1Qj1u1SEJ5pBzlds9jak2O09",
  },
];
