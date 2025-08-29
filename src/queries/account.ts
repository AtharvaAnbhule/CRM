"use server";

import { db } from "@/lib/db";
import { Role, type SubAccount } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const getSubAccountDetails = async (subAccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subAccountId,
    },
  });

  return response;
};

export const getSubAccountsByAgency = async (agencyId: string) => {
  const response = await db.subAccount.findMany({
    where: {
      agencyId,
    },
  });

  return response;
};

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null;

  const subscription = await db.subscription.findFirst({
    where: { agencyId: subAccount.agencyId },
  });

  const planAmount = subscription?.price || 0; // fallback if no subscription


  if (planAmount == 0) {
    const subaccountCount = await db.subAccount.count({
      where: { agencyId: subAccount.agencyId },
    });

    // if (subaccountCount >= 2) {
    //   return NextResponse.json(
    //     { error: "Subaccount limit reached for your current subscription plan." },
    //     { status: 403 }
    //   );
    // }

  }


  const agencyOwner = await db.user.findFirst({
    where: {
      agency: {
        id: subAccount.agencyId,
      },
      role: Role.AGENCY_OWNER,
    },
  });

  if (!agencyOwner) {
    throw new Error("Could not create account");
  }

  const permissionId = uuidv4();

  const response = await db.subAccount.upsert({
    where: {
      id: subAccount.id,
    },
    update: subAccount,
    create: {
      ...subAccount,
      permissions: {
        create: {
          id: permissionId,
          access: true,
          email: agencyOwner.email,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        },
      },
      pipelines: {
        create: {
          name: "First Cycle",
        },
      },
      sidebarOptions: {
        create: [
          {
            name: "Start Point",
            icon: "clipboardIcon",
            link: `/account/${subAccount.id}/start`,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/account/${subAccount.id}/settings`,
          },
          {
            name: "Keys",
            icon: "shield",
            link: `/account/${subAccount.id}/Keys`,
          },
          {
            name: "transactions",
            icon: "payment",
            link: `/account/${subAccount.id}/transactions`,
          },
          {
            name: "Builder",
            icon: "pipelines",
            link: `/account/${subAccount.id}/builder`,
          },
          {
            name: "Images",
            icon: "database",
            link: `/account/${subAccount.id}/media`,
          },
          {
            name: "Automations",
            icon: "chip",
            link: `/account/${subAccount.id}/automations`,
          },
          {
            name: "Tasks",
            icon: "check",
            link: `/account/${subAccount.id}/tasks`,
          },
          {
            name: "Employees",
            icon: "person",
            link: `/account/${subAccount.id}/employees`,
          },
          {
            name: "Projects",
            icon: "leads",
            link: `/account/${subAccount.id}/Projects`,
          },
          {
            name: "Workflow",
            icon: "flag",
            link: `/account/${subAccount.id}/workflow`,
          },
          {
            name: "Contacts",
            icon: "person",
            link: `/account/${subAccount.id}/contacts`,
          },
          {
            name: "Dashboard",
            icon: "category",
            link: `/account/${subAccount.id}`,
          },
        ],
      },
    },
  });

  return response;
};

export const getSubAccountTeamMembers = async (subAccountId: string) => {
  const subAccountWithAccess = await db.user.findMany({
    where: {
      agency: {
        subAccounts: {
          some: {
            id: subAccountId,
          },
        },
      },
      role: Role.SUBACCOUNT_USER,
      permissions: {
        some: {
          subAccountId,
          access: true,
        },
      },
    },
  });

  return subAccountWithAccess;
};

export const deleteSubAccount = async (subAccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subAccountId,
    },
  });
  const deletePermissions = await db.permissions.deleteMany({
    where: {
      subAccountId,
    },
  });

  return response;
};

export const updateSubAccountConnectedId = async (
  subAccountId: string,
  connectAccountId: string
) => {
  const response = await db.subAccount.update({
    where: {
      id: subAccountId,
    },
    data: {
      connectAccountId,
    },
  });

  return response;
};
