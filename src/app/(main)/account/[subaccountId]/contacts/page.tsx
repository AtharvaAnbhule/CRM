import React from "react";
import { redirect } from "next/navigation";
import { Decimal } from "@prisma/client/runtime/library";
import { format } from "date-fns";

import { getSubAccountWithContacts } from "@/queries/contacts";

import BlurPage from "@/components/common/BlurPage";
import { constructMetadata, formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import CreateContactButton from "./_components/CreateButton";

interface SubAccountContactPageProps {
  params: {
    subaccountId: string | undefined;
  };
}

const SubAccountContactPage: React.FC<SubAccountContactPageProps> = async ({
  params,
}) => {
  const { subaccountId } = params;

  if (!subaccountId) redirect("/account/unauthorized");

const contacts = await getSubAccountWithContacts(subaccountId);
  const allContacts = contacts?.contacts;

  const formatTotal = (tickets: { value: Decimal | null }[]) => {
    if (!tickets || !tickets.length) return null;

    const laneAmt = tickets.reduce(
      (sum, ticket) => sum + (Number(ticket.value) || 0),
      0
    );

    return formatPrice(laneAmt);
  };
 
  return (
    <BlurPage>
      <div className="flex items-center justify-start md:flex-col flex-col gap-4 p-6  dark:text-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold">Contacts Management</h1>
        <p className="dark:text-gray-400">
          View and manage all your account contacts efficiently.
        </p>
        
      </div>
      <div className="flex justify-end">
      <CreateContactButton subAccountId={subaccountId} />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-700 shadow-md mt-6">
        <Table className="w-full bg-gray-800 text-white">
          <TableHeader className="bg-gray-700">
            <TableRow>
              <TableHead className="text-lg font-semibold">Name</TableHead>
              <TableHead className="text-lg font-semibold">Email</TableHead>
              <TableHead className="text-lg font-semibold">Phone number</TableHead>
              <TableHead className="text-lg font-semibold">Status</TableHead>
              <TableHead className="text-lg font-semibold">Created Date</TableHead>
              <TableHead className="text-lg font-semibold">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-medium">
            {allContacts?.length ? (
              allContacts.map((contact) => (
                <TableRow key={contact.id} className="hover:bg-gray-700 transition">
                  <TableCell className="flex items-center space-x-4 py-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage alt={contact.name} />
                      <AvatarFallback className="bg-primary text-white">
                        {contact.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{contact.name}</span>
                  </TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>
                    {formatTotal(contact.tickets) === null ? (
                      <Badge variant="destructive">Inactive</Badge>
                    ) : (
                      <Badge className="bg-emerald-600 text-white">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(contact.createdAt, "MM/dd/yyyy")}</TableCell>
                  <TableCell className="text-green-400">{formatTotal(contact.tickets)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-400">
                  No contacts available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </BlurPage>
  );
};

export default SubAccountContactPage;

export const metadata = constructMetadata({
  title: "Contacts - ",
});
