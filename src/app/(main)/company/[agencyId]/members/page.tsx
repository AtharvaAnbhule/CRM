import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";

import { getAgencyDetails } from "@/queries/company";
import { getAuthUserGroup } from "@/queries/auth";

import TeamsDataTable from "./data-table";
import { teamTableColumns } from "./columns";
import SendInvitation from "@/components/forms/SendInvitation";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TeamPageProps {
  params: {
    agencyId: string | undefined;
  };
}

const TeamPage: React.FC<TeamPageProps> = async ({ params }) => {
  const { agencyId } = params;
  const authUser = await currentUser();

  if (!authUser) redirect("/company/sign-in");
  if (!agencyId) redirect("/company/unauthorized");

  const teamMembers = await getAuthUserGroup(agencyId);
  if (!teamMembers) redirect("/company/sign-in");

  const agencyDetails = await getAgencyDetails(agencyId);
  if (!agencyDetails) redirect("/company/unauthorized");

  return (
    <>
    
    <TeamsDataTable
    className= "bg-violet-600"
  actionButtonText = {
        <>
    <Plus className="w-4 h-4" />
      Add
      </>
}
modalChildren = {< SendInvitation agencyId = { agencyId } />}
filterValue = "name"
// @ts-expect-error not sure why this error occurs but table is working fine
columns = { teamTableColumns }
data = { teamMembers }
  />
  
  </>
  );
};

export default TeamPage;

export const metadata = constructMetadata({
  title: "Team - Workeloo",
});
