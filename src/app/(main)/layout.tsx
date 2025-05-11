import React from "react";
import AuthProvider from "@/components/providers/AuthProvider";
import Providers from "./CodeBuilder/components/providers";


const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (<AuthProvider><Providers>{children}</Providers></AuthProvider>) ; 
};

export default MainLayout;
