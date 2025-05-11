import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

type Props = {};

const EndCallButton = (props: Props) => {
  const router = useRouter();
  const call = useCall();


  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    if (!isEnding) return;

    const cleanUpAndRedirect = async () => {
      try {
        await call?.endCall(); // Or call.leave() if you're not host
        // Allow SDK DOM cleanup before navigation
        setTimeout(() => {
          router.push(`/`);
          router.refresh();
        }, 200); // give time for SDK unmount
      } catch (error) {
        console.error('Error ending call:', error);
      }
    };

    cleanUpAndRedirect();
  }, [isEnding, call, router]);

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  return (
    <Button
  className="bg-red-500"
  onClick={() => {
    setIsEnding(true);
  }}
>
  End call for everyone
</Button>

  );
};

export default EndCallButton;
