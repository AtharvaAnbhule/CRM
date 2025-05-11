import React from "react";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { getAuthUser } from "@/queries/auth";
import { getAgencyDetails } from "@/queries/company";

import CompanyDetails from "@/components/forms/CompanyDetails";
import UserDetailsForm from "@/components/forms/UserDetails";
import { constructMetadata } from "@/lib/utils";

interface AgencySettingsPageProps {
  params: {
    agencyId: string | undefined;
  };
}

const CompanySettingsPage: React.FC<AgencySettingsPageProps> = async ({
  params,
}) => {
  const { agencyId } = params;
  const authUser = await currentUser();

  if (!authUser) redirect("/company/sign-in");
  if (!agencyId) redirect("/company/unauthorized");

  const userDetails = await getAuthUser(authUser.emailAddresses[0].emailAddress);

  if (!userDetails) redirect("/company/sign-in");

  const agencyDetails = await getAgencyDetails(agencyId);

  if (!agencyDetails) redirect("/company/unauthorized");

  const subAccounts = agencyDetails.subAccounts;

  return (
    <main className="min-h-screen bg-gradient-to-tr from-gray-100 to-white dark:from-[#0f0f11] dark:to-[#1a1a1d] py-12 px-4 sm:px-6 lg:px-8">
      <section className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
            Company Settings
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            Manage your companys profile and admin preferences.
          </p>
        </header>

        {/* Company Details */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
              Company Information
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Update your company details below.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
            <CompanyDetails data={agencyDetails} />
          </div>
        </div>

        {/* User Details */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
              Admin Details
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage the admin account associated with this Company.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
            <UserDetailsForm
              type="agency"
              id={agencyId}
              subAccounts={subAccounts}
              userData={userDetails}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default CompanySettingsPage;

export const metadata = constructMetadata({
  title: "Settings - Workeloo",
});
