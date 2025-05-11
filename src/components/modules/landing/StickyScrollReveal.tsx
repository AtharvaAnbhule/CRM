"use client";

import React, { useRef } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

const content = [
  {
    title: "Website Builder",
    description: (
      <>
        <p>
          The Website Builder for Company CRM is a powerful tool designed to
          streamline the process of creating and managing websites for agencies.
        </p>
        <p>
          With an intuitive interface and robust features, companies can build
          custom websites without extensive coding knowledge.
        </p>
      </>
    ),
    image: "/assets/builder.png",
  },
  {
    title: "Kanban Board",
    description: (
      <>
        <p>
          The Kanban Board offers a visual and efficient way to manage projects.
        </p>
        <p>
          Drag-and-drop tasks, organize workflows, and improve productivity
          effortlessly.
        </p>
      </>
    ),
    image: "/assets/workflow.png",
  },
  {
    title: "Team Access",
    description: (
      <>
        <p>
          Secure and seamless access control for teams, ensuring efficient
          collaboration.
        </p>
        <p>
          Assign custom permissions and maintain data security effortlessly.
        </p>
      </>
    ),
    image: "https://utfs.io/f/9645dd80-d15c-418f-93ae-c1f329cc5ebb-1tmp4m.png",
  },
  {
    title: "Leads Dashboard",
    description: (
      <>
        <p>
          A powerful dashboard to track leads, prioritize follow-ups, and
          analyze sales performance.
        </p>
        <p>Gain real-time insights and drive business growth with ease.</p>
      </>
    ),
    image: "/assets/pre.png",
  },
];

export const StickyScroll = ({
  contentClassName,
}: {
  contentClassName?: string | React.ReactNode;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        return distance < Math.abs(latest - cardsBreakpoints[acc]) ? index : acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center space-y-10 p-10  dark:text-white rounded-md shadow-lg"
    >
      {content.map((item, index) => (
        <motion.div
          key={index}
          className={cn(
            "flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl p-8 rounded-3xl shadow-md transition-all duration-300",
            index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse",
            activeCard === index ? " dark:text-white scale-105" : "bg-violet/80 text-gray-800"
          )}
        >
          {/* Text Content */}
          <motion.div
            className="lg:w-1/2 space-y-4"
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={{
              opacity: activeCard === index ? 1 : 0.5,
              x: activeCard === index ? 0 : index % 2 === 0 ? -50 : 50,
            }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold">{item.title}</h2>
            <p className="text-lg">{item.description}</p>
          </motion.div>

          {/* Image Content */}
          <motion.div
            className="lg:w-1/2 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: activeCard === index ? 1 : 0.5, scale: activeCard === index ? 1 : 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={item.image}
              width={500}
              height={300}
              className="rounded-xl border shadow-lg"
              alt="Feature"
            />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};
