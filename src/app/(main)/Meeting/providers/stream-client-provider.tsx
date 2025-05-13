"use client";

import Loader from "../components/loader";
import { useUser } from "@clerk/nextjs";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import tokenProvider from "../actions/stream.actions";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export default function StreamVideoProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    let client: StreamVideoClient | null = null;

    if (!isLoaded) {
      // still loading Clerk → show loader
      setVideoClient(null);
      return;
    }

    if (!apiKey) {
      console.error("Stream API key is not set");
      return;
    }

    // fallback "anonymous" user when there's no signed-in user
    const streamUser = user
      ? {
          id: user.id,
          name: user.username || user.id,
          image: user.imageUrl,
        }
      : {
          id: "anonymous",
          name: "Anonymous",
          image: "",
        };

    client = new StreamVideoClient({
      apiKey,
      user: streamUser,
      tokenProvider,
    });

    setVideoClient(client);

    return () => {
      client?.disconnectUser();
    };
  }, [isLoaded, user]);

  // While Clerk is booting up
  if (!isLoaded || videoClient === null) {
    return <Loader />;
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
