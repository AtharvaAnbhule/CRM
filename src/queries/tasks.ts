import { db } from "@/lib/db";

 // Adjust the path as needed

// Function to get the count of all tasks created today
export async function getAllTaskCountToday(subaccountId: string) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Set to start of today (00:00:00)
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Set to end of today (23:59:59)

    const taskCount = await db.agenda.count({
      where: { 
        subaccountId: subaccountId,
        createdAt: {
          gte: startOfDay, // Greater than or equal to start of today
          lte: endOfDay,   // Less than or equal to end of today
        },
      },
    });

    return taskCount; // Return the count of tasks
  } catch (error) {
    throw new Error(`Error fetching task count: ${error}`);
  }
}
