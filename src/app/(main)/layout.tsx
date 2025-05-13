"use client";

import React from "react";
import AuthProvider from "@/components/providers/AuthProvider";
import StreamVideoProvider from "./Meeting/providers/stream-client-provider";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default MainLayout;
