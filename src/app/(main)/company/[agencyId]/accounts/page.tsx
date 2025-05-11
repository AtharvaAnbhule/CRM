import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getAuthUserDetails } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import DeleteButton from "./components/DeleteButton";
import CreateButton from "./components/CreateButton";
import { constructMetadata } from "@/lib/utils";

interface AllSubAccountsPageProps {
  params: {
    agencyId: string | undefined;
  };
}

const AllSubAccountsPage: React.FC<AllSubAccountsPageProps> = async ({
  params,
}) => {
  const { agencyId } = params;

  const user = await getAuthUserDetails();

  if (!agencyId) redirect("/company/unauthorized");
  if (!user) redirect("/company/sign-in");

  return (
    <AlertDialog>
      <div className="flex flex-col min-h-screen  p-6">
        <div className="text-center md:text-left dark:text-white">
          <h1 className="text-4xl font-bold dark:text-white">Manage Your Accounts</h1>
          <p className="text-lg opacity-80">Organize and access all your accounts efficiently.</p>
        </div>

        <div className="flex justify-center md:justify-start mt-5">
          <CreateButton user={user} agencyId={agencyId} />
        </div>

        <div className="mt-6  p-4 rounded-lg shadow-lg">
          <Table>
            <TableHeader>
              <TableRow className="">
                <TableHead className="w-24">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Company ID</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!!user.agency?.subAccounts.length ? (
                user.agency.subAccounts.map((subAccount) => (
                  <TableRow key={subAccount.id} className="">
                    <TableCell>
                      <div className="relative w-16 h-16">
                        <Image
                          src={subAccount.subAccountLogo}
                          alt="logo"
                          fill
                          className="rounded-md object-contain bg-gray-200 p-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/account/${subAccount.id}`} className="text-blue-600 hover:underline">
                        {subAccount.name}
                      </Link>
                    </TableCell>
                    <TableCell>{subAccount.address}</TableCell>
                    <TableCell>{subAccount.agencyId}</TableCell>
                    <TableCell>{subAccount.state}</TableCell>
                    <TableCell>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <DeleteButton subAccountId={subAccount.id} />
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No accounts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AlertDialog>
  );
};

export default AllSubAccountsPage;

export const metadata = constructMetadata({
  title: "Accounts - Workeloo",
});
