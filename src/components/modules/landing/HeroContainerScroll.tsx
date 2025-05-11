"use client";
import React from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";
import { TypewriterEffect } from "./TypewriterEffect";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Feather } from "lucide-react";

interface HeroContainerScrollProps {}

export const HeroContainerScroll: React.FC<HeroContainerScrollProps> = () => {
  const containerRef = React.useRef<any>(null); 

  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return ( 
    <>
    <section className="py-16 px-6 md:px-12">
    <div className="max-w-8xl mx-auto text-center"> 
    
    <div className="bg-gradient-to-r from-gray-800 to-purple-600 bg-clip-text text-transparent">
            <h1 className="text-6xl font-bold text-center md:text-[250px]">Workeloo</h1>
          </div>
         
      {/* Main Heading */}
      <h1 className="text-4xl md:text-5xl font-bold dark:text-white-900 leading-tight">
        The Future of <span className="text-[#6B46C1]">Customer</span> Relationship Management{" "}
        Starts Here.
      </h1>

      {/* Subtext */}
      <p className="dark:text-white-700 text-lg mt-4">
        Manage your leads, track customer interactions, and automate workflows 
        with our powerful, AI-driven CRM platform. Simplify operations, increase 
        efficiency, and grow your business like never before.
      </p>

      {/* Buttons */}
      
    </div>
  </section>
    <div
      className="flex items-center justify-center relative pt-32 z-10"
      ref={containerRef}
    >
      <div className="w-full relative" style={{ perspective: "1000px" }}>
        <motion.div style={{ translateY }} className="max-w-5xl mx-auto text-center">
          <p className="text-center font-medium mt-4 text-gray-600 dark:text-gray-300">
            <TypewriterEffect />
          </p>
          
        </motion.div>
        <Card rotate={rotate} scale={scale} />
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-gray-50 dark:from-gray-900 z-10"></div>
      </div>
    </div>
    </>
  );
};

interface CardProps {
  rotate: any;
  scale: any;
}

const Card: React.FC<CardProps> = ({ rotate, scale }) => {
  return (
    <motion.div className="relative">
      {/* Main Image */}
      <Image
        src="/assets/header.png"
        alt="CRM Dashboard Preview"
        width={1200}
        height={1200}
        className="rounded-lg z-10"
      /> 

      {/* Overlapping Image (Bottom-Right) */}
      <Image
        src="/assets/image.png"
        alt="CRM Features Preview"
        width={400}
        height={200}
        className="absolute bottom-0 right-0 transform translate-x-4 translate-y-4 z-20"
      />
    </motion.div>
  );
};
