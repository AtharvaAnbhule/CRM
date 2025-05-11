import { db } from "@/lib/db";

// utils/projectUtils.ts
// Adjust the import path to where your prisma client is located

// Function to get project count based on subAccountId
export const getProjectCount = async (subaccountId: string): Promise<number> => {
  try {
    // Query the projects count associated with the subAccountId
    const projects = await db.project.findMany({
      where: {
        projectId: subaccountId,
      },
    });

    // Return the number of projects
    return projects.length;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return 0; // Return 0 in case of an error
  }
};
