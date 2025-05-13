"use server";

import { db } from "@/lib/db";
import { Plan, type Agency } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs";
import { logger } from "@/lib/utils";

export const getAgencyDetails = async (agencyId: string) => {
  try {
    const agencyDetails = await db.agency.findUnique({
      where: {
        id: agencyId,
      },
      include: {
        subAccounts: true,
      },
    });

    if (!agencyDetails) throw new Error("Agency not found");

    return agencyDetails;
  } catch (error) {
    logger(error);
  }
};

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: {
      id: agencyId,
    },
    data: agencyDetails,
  });

  return response;
};

export const deleteAgency = async (agencyId: string) => {
  const deletedUserFromDB = await db.agency.delete({
    where: {
      id: agencyId,
    },
    include: {
      subAccounts: true,
    },
  });

  return deletedUserFromDB;
};

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null;

  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: { email: agency.companyEmail },
        },
        ...agency,
        sidebarOptions: {
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/company/${agency.id}`,
            },
            {
              name: "Product",
              icon: "tune",
              link: `/company/${agency.id}/products`,
            },
            {
              name: "Leads",
              icon: "leads",
              link: `/company/${agency.id}/leads`,
            },
            {
              name: "Start Point",
              icon: "clipboardIcon",
              link: `/company/${agency.id}/start`,
            },
            {
              name: "Email Marketing",
              icon: "link",
              link: `/company/${agency.id}/email-marketing`,
            },
            {
              name: "Billing",
              icon: "payment",
              link: `/company/${agency.id}/billing`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/company/${agency.id}/settings`,
            },
            {
              name: "Accounts",
              icon: "person",
              link: `/company/${agency.id}/accounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/company/${agency.id}/members`,
            },
          ],
        },
      },
      include: {
        sidebarOptions: true, // include needed relations
      },
    });

    // ✅ Fix: return only serializable data
    return JSON.parse(JSON.stringify(agencyDetails));
  } catch (error) {
    logger("❌ Error in upsertAgency", error);
    return null;
  }
};


export const getAgencySubscription = async (agencyId: string) => {
  const agencySubscription = await db.agency.findUnique({
    where: {
      id: agencyId,
    },
    select: {
      customerId: true,
      subscriptions: true,
    },
  });

  return agencySubscription;
};

export const updateAgencyConnectedId = async (
  agencyId: string,
  connectAccountId: string
) => {
  const response = await db.agency.update({
    where: {
      id: agencyId,
    },
    data: {
      connectAccountId,
    },
  });

  return response;
};
