import React from "react";
import AuthProvider from "@/components/providers/AuthProvider";


 

import "@stream-io/video-react-sdk/dist/css/styles.css";
import StreamVideoProvider from "./Meeting/providers/stream-client-provider";

const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (<AuthProvider><StreamVideoProvider>{children}</StreamVideoProvider></AuthProvider>) ; 
};

export default MainLayout;
