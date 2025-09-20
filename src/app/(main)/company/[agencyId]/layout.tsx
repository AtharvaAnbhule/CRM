"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Role } from "@prisma/client";

import { verifyInvintation } from "@/queries/invitation";
import { getNotification } from "@/queries/noti";

import Sidebar from "@/components/navigation/Sidebar";
import BlurPage from "@/components/common/BlurPage";
import InfoBar from "@/components/common/InfoBar";

interface AgencyIdLayoutProps extends React.PropsWithChildren {
  params: {
    agencyId: string | undefined;
  };
}

const AgencyIdLayout: React.FC<AgencyIdLayoutProps> = ({ params, children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      if (isLoaded) {
        if (!isSignedIn) {
          router.push("/company/sign-in");
        } else {
          // verify agency and fetch notifications
          const agencyId = await verifyInvintation();
          if (!agencyId || !params.agencyId) {
            router.push("/company");
            return;
          }

          if (
            user?.privateMetadata.role !== Role.AGENCY_OWNER &&
            user?.privateMetadata.role !== Role.AGENCY_ADMIN
          ) {
            router.push("/company/unauthorized");
            return;
          }

          const noti = await getNotification(agencyId);
          setNotifications(noti);
          setReady(true); // everything loaded, render children
        }
      }
    };

    init();
  }, [isLoaded, isSignedIn, router, params.agencyId, user]);

  if (!ready) return null; // wait until session & data are loaded

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.agencyId} type="agency" />
      <div className="md:pl-[300px]">
        <InfoBar
          notifications={notifications}
          subAccountId={user?.id}
          role={user?.privateMetadata.role}
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default AgencyIdLayout;
