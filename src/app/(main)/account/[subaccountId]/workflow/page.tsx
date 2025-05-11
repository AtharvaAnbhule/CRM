import React from "react";
import { redirect } from "next/navigation";

import { createPipeline, getUserPipelines } from "@/queries/workflow";
import { constructMetadata } from "@/lib/utils";

interface PipelinesPageProps {
  params: {
    subaccountId: string | undefined;
  };
}

const PipelinesPage: React.FC<PipelinesPageProps> = async ({ params }) => {
  const { subaccountId } = params;

  if (!subaccountId) redirect("/account/unauthorized");

  const pipelineExists = await getUserPipelines(subaccountId);

  if (!!pipelineExists.length) {
    redirect(`/account/${subaccountId}/workflow/${pipelineExists[0].id}`);
  }

  const response = await createPipeline(subaccountId);

  if (response) {
    redirect(`/account/${subaccountId}/workflow/${response.id}`);
  }

  redirect("/error");
};
export default PipelinesPage;

export const metadata = constructMetadata({
  title: "Workflow - Workeloo",
});
