import { db } from "@/lib/db"; // Make sure this exports your Prisma client

export const getLeadDone = async (agencyId: string) => {
  try {
    const leads = await db.lead.findMany({
      where: {
        status: {
          equals: "Deal Done", // safer than just status: "Deal Done"
        },
        agencyId: {
          equals: agencyId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return leads;
  } catch (error) {
    console.error("Error fetching deal done leads:", error);
    return [];
  }
};
