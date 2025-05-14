import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { Role } from "@prisma/client";

import { verifyInvintation } from "@/queries/invitation";
import { getAuthUserDetails } from "@/queries/auth";
import { getNotification } from "@/queries/noti";

import Sidebar from "@/components/navigation/Sidebar";
import InfoBar from "@/components/common/InfoBar";

import { NotificationsWithUser } from "@/lib/types";

interface SubAccountIdLayoutProps {
  children: React.ReactNode;
  params: {
    subaccountId: string | undefined;
  };
}

const SubAccountIdLayout: React.FC<SubAccountIdLayoutProps> = async ({
  children,
  params,
}) => {
  const { subaccountId } = params;
  const agencyId = await verifyInvintation();

  if (!subaccountId) redirect(`/account/unauthorized`);
  if (!agencyId) redirect(`/account/unauthorized`);

  const user = await currentUser();

  if (!user) redirect(`/company/sign-in`);

  let notifications: NotificationsWithUser = [];

  if (!user.privateMetadata.role) {
    redirect(`/account/unauthorized`);
  }

  const authUser = await getAuthUserDetails();
  const hasPermission = authUser?.permissions.find(
    (permission) =>
      permission.access && permission.subAccountId === subaccountId
  );
  if (!hasPermission) redirect(`/account/unauthorized`);

  const allNotifications = await getNotification(agencyId);

  if (
    user.privateMetadata.role === Role.AGENCY_ADMIN ||
    user.privateMetadata.role === Role.AGENCY_OWNER
  ) {
    notifications = allNotifications;
  } else {
    const filteredNotifications = allNotifications?.filter(
      (notification) => notification.subAccountId === subaccountId
    );
    if (filteredNotifications) notifications = filteredNotifications;
  }

  return (
    <div className= "h-screen overflow-y-auto" >
    <Sidebar id={ subaccountId } type = "subaccount" />

      <div className="md:pl-[300px]" >
        <InfoBar
          notifications={ notifications }
  role = { user.privateMetadata.role as Role }
  subAccountId = { params.subaccountId as string }
    />
    <div className="relative" > { children } </div>
      </div>
      </div>
  );
};

export default SubAccountIdLayout;
