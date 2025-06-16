"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import { PRICING } from "@/config/pricing";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const HoverPriceCard: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4")}>
      {PRICING.map((price, idx) => (
        <div
          key={price.priceId}
          className="relative group block p-2 h-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
              />
            )}
          </AnimatePresence>
          
          <Card
            className={cn(
              "w-full h-full flex flex-col justify-between  relative",
              "border border-gray-200 dark:border-gray-800 rounded-xl",
              "bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow",
              {
                "border-primary/50 dark:border-primary/80 shadow-lg":
                  price.title === "Unlimited Saas",
              }
            )}
          >
            <div>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  {price.title}
                </CardTitle>
                <CardDescription className={cn("text-gray-600 dark:text-gray-400", {
                  "text-primary-foreground/80": price.title === "Unlimited Saas",
                })}>
                  {price.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-4">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">
                    {price.price}
                  </span>
                  {price.title !== "Starter" && (
                    <span className={cn("text-lg text-muted-foreground", {
                      "text-primary-foreground/70": price.title === "Unlimited Saas",
                    })}>
                      /month
                    </span>
                  )}
                </div>
              </CardContent>
            </div>

            <CardFooter className="flex flex-col items-start gap-6">
              <div className="space-y-3 w-full">
                {price.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2
                      className={cn(
                        "flex-shrink-0 h-5 w-5 text-emerald-500 mt-0.5",
                        {
                          "text-emerald-300": price.title === "Unlimited Saas",
                        }
                      )}
                    />
                    <p className="text-sm">{feature}</p>
                  </div>
                ))}
              </div>
              
              <Link
                href={`/company?plan=${price.priceId}`}
                className={cn(
                  "w-full transition-transform hover:translate-y-[-2px]",
                  buttonVariants({
                    variant: price.title === "Unlimited Saas" ? "default" : "outline",
                    size: "lg",
                  })
                )}
              >
                Get Started
              </Link>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default HoverPriceCard;