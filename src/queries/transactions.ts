import { db } from "@/lib/db";

  // Adjust the import path to your prisma client

// Function to get all transactions for a specific subaccountId
export async function getTransactionsForSubaccount(subaccountId: string) {
  try {
    const transactions = await db.transaction.findMany({
      where: {
        subaccountid: subaccountId, // Filter by subaccountId
      },
      orderBy: {
        date: "desc", // Optionally order by creation date, descending (most recent first)
      },
    });

    return transactions; // Return the list of transactions
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Error fetching transactions");
  }
}
