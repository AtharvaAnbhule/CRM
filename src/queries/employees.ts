import { db } from "@/lib/db";

// File: /queries/employees.ts
  // adjust this path as per your project structure

export async function getTotalEmployeesBySubaccountId(subaccountId: string) {
  const count = await db.employee.count({
    where: {
      subaccountId,
    },
  });

  return count;
}
