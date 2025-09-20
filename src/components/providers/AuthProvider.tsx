"use client";

import React from "react";

import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { dark as darkTheme } from "@clerk/themes";

const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <ClerkProvider 
      appearance={{ baseTheme: theme === "dark" ? darkTheme : undefined }} 
       frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
};

export default AuthProvider;
