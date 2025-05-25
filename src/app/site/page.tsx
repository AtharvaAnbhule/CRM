import React from "react";
import MaxWidthWrapper from "@/components/ui/max-width-wrapper";
import HoverPriceCard from "@/components/modules/landing/HoverPriceCard";
import { HeroContainerScroll } from "@/components/modules/landing/HeroContainerScroll";
import { InfiniteMovingCards } from "@/components/modules/landing/InfiniteMovingCard";
import { cn, constructMetadata } from "@/lib/utils";
import { StickyScroll } from "@/components/modules/landing/StickyScrollReveal";
import { BackgroundBeams } from "@/components/modules/landing/BackgroundBeams";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LegalFooter, LegalPages } from "@/components/modules/landing/Copyright";

const HomePage: React.FC = () => {
  return (
    <div className="h-full bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="w-full relative py-20">
        <MaxWidthWrapper>
          <HeroContainerScroll />
        </MaxWidthWrapper>
        <BackgroundBeams />
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white dark:bg-[#1e293b]">
        <MaxWidthWrapper className="flex items-center flex-col gap-6">
          <h2 className="text-5xl font-bold text-center">Flexible Pricing Plans</h2>
          <p className="text-[#6b7280] dark:text-[#9ca3af] text-lg text-center max-w-2xl">
            Choose a plan that suits your needs. Start with a free plan or unlock premium features to elevate your agency experience.
          </p>
          <HoverPriceCard />
        </MaxWidthWrapper>
      </section>

      {/* Infinite Moving Cards Section */}
      <section className="w-full py-24 bg-[#f9fafb] dark:bg-[#0f172a]">
        <InfiniteMovingCards pauseOnHover={true} speed="slow" />
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-white dark:bg-[#1e293b]">
        <MaxWidthWrapper>
          <div className="flex flex-col gap-6 items-center">
            <h2 className="text-5xl font-bold text-center">Discover Our Features</h2>
            <div className="text-[#6b7280] dark:text-[#9ca3af] text-center max-w-xl leading-relaxed">
              <p>
              Workeloo is designed to simplify agency management and maximize productivity with intelligent tools at your disposal.
              </p>
            </div>
          </div>
        </MaxWidthWrapper>

        <div className="py-12">
          <StickyScroll />
        </div>
      </section>

      {/* Call to Action Section */}
      <div className="h-[40rem] w-full rounded-md relative flex flex-col items-center justify-center antialiased 
                      bg-gradient-to-br from-purple-600 to-indigo-600 
                      dark:from-[#4c1d95] dark:to-[#312e81] text-white">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="relative z-10 text-5xl md:text-7xl font-extrabold">Empower Your Company</h1>
          
          <div className="flex justify-center mt-8">
            <Link
              href="/company"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "w-40 text-lg px-6 py-3 border border-white rounded-lg text-white hover:bg-white hover:text-[#4c1d95] transition-all duration-300"
              )}
            >
              Get Started
            </Link>
          </div>
          
          <p className="text-neutral-300 text-lg max-w-lg mx-auto mt-6">
            Experience seamless Company management with Workeloo CRM. Get started now and unlock powerful features.
          </p>
          
          <LegalFooter />
      
        </div>
      </div>
    </div>
  );
};

export default HomePage;

export const metadata = constructMetadata();