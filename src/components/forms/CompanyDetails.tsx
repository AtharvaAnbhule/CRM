"use client";

import React from "react";

import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumberInput } from "@tremor/react";
import { Role, type Agency } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import {
  deleteAgency,
  updateAgencyDetails,
  upsertAgency,
} from "@/queries/company";
import { saveActivityLogsNotification } from "@/queries/noti";
import { initUser } from "@/queries/auth";

import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import FileUpload from "../common/FileUpload";

import {
  AgencyDetailsValidator,
  type AgencyDetailsSchema,
} from "@/lib/validators/agency-details";

interface AgencyDetailsProps {
  data?: Partial<Agency>;
}

const CompanyDetails: React.FC<AgencyDetailsProps> = ({ data }) => {
  const router = useRouter();

  const [deletingAgency, setDeletingAgency] = React.useState<boolean>(false);

  const form = useForm<AgencyDetailsSchema>({
    mode: "onChange",
    resolver: zodResolver(AgencyDetailsValidator),
    defaultValues: {
      whiteLabel: data?.whiteLabel || false,
      ...data,
    },
  });
  const isSubmitting = form.formState.isSubmitting;
  //   const isLoading = isSubmitting || deletingAgency;

  React.useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  const onSubmit: SubmitHandler<AgencyDetailsSchema> = async (values) => {
    try {
      let customerId: string | undefined;

      if (!data?.id) {
        // create Stripe customer if there is no agency
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          size: values.size,
          updates: values.updates,
          years: values.years,
          vision: values.vision,
          mission: values.mission,
          linkedinUrl: values.linkedinUrl,
          facebookUrl: values.facebookUrl,
          twitterUrl: values.twitterUrl,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.zipCode,

            },
            name: values.name,

          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.zipCode,
          },
        };

        const customerResponse = await fetch("/api/stripe/create-customer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        });

        const customerData: { customerId: string } =
          await customerResponse.json();

        customerId = customerData.customerId;
      }

      await initUser({ role: Role.AGENCY_OWNER });
      if (!data?.customerId && !customerId) return;

      const response = await upsertAgency({
        id: data?.id ? data.id : uuidv4(),
        customerId: data?.customerId || customerId || "",
        address: values.address,
        agencyLogo: values.agencyLogo,
        size: values.size,
        years: values.years,
        city: values.city,
        updates: values.updates,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        whiteLabel: values.whiteLabel,
        vision: values.vision,
        linkedinUrl: values.linkedinUrl,
        twitterUrl: values.twitterUrl,
        facebookUrl: values.facebookUrl,
        mission: values.mission,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        connectAccountId: "",
        goal: 5,
      });

      toast.success("Created Agency");

      if (data?.id) router.refresh();
      if (response) router.refresh();
    } catch (error) {
      toast.error("Oppsie!", {
        description: "Could not create your agency. Please try again.",
      });
    }
  };

  const handleDeleteAgency = async () => {
    if (!data?.id) return;

    setDeletingAgency(true);
    // TODO: discontinue the subscription for the user

    try {
      const response = await deleteAgency(data.id);

      toast.success("Deleted Agency", {
        description: "Deleted your agency and all related subaccounts.",
      });

      router.refresh();
    } catch (error) {

      toast.error("Oppse!", {
        description: "Could not delete your agency. Please try again.",
      });

      router.refresh();
    }

    setDeletingAgency(false);
  };

  return (
    <AlertDialog>
    <div className= "flex sm:flex-col lg:flex-row gap-5" >
    <div>
    <Card className= "w-full my-10" >
      <CardHeader>
      <CardTitle>Create an Company </CardTitle>
        <CardDescription>
            Lets create an company for your business. 
          </CardDescription>
    </CardHeader>
    < CardContent >
    <Form { ...form } >
    <form onSubmit= { form.handleSubmit(onSubmit) } className = "space-y-4" >
      <FormField
                disabled={ isSubmitting }
  control = { form.control }
  name = "agencyLogo"
  render = {({ field }) => (
    <FormItem>
    <FormLabel>Company Logo </FormLabel>
      < FormControl >
      <FileUpload
                        endpoint="agencyLogo"
value = { field.value }
onChange = { field.onChange }
  />
  </FormControl>
  < FormMessage />
  </FormItem>
                )}
              />
  < div className = "flex md:flex-row gap-4" >
    <FormField
                  disabled={ isSubmitting }
control = { form.control }
name = "name"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Company Name </FormLabel>
    < FormControl >
    <Input placeholder="Your company name" {...field } />
      </FormControl>
      < FormMessage />
      </FormItem>
                  )}
                />
  </div>
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "companyEmail"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Company Email </FormLabel>
    < FormControl >
    <Input placeholder="Your company email" {...field } />
      </FormControl>
      < FormMessage />
      </FormItem>
                    )}
                  />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "companyPhone"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Company Phone Number </FormLabel>
    < FormControl >
    <Input
                        placeholder="Your company phone number"
{...field }
                      />
  </FormControl>
  < FormMessage />
  </FormItem>
                )}
              />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "size"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Company Size </FormLabel>
    < FormControl >
    <NumberInput
                                      placeholder="Your company Size"
{...field }
                                    />
  </FormControl>
  < FormMessage />
  </FormItem>
                              )}
                            />




  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "years"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Established Year </FormLabel>
    < FormControl >
    <Input
                                                    placeholder="Establishment year"
{...field }
                                                  />
  </FormControl>
  < FormMessage />
  </FormItem>
                                            )}
                                          />

  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "updates"
render = {({ field }) => {
  return (
    <FormItem className= "flex flex-row items-center justify-between rounded-lg border gap-4 p-4" >
    <div>
    <FormLabel>Receive Updates </FormLabel>
      <FormDescription>
                                                      mode will give you access to all recent updates from the CRM.

                                                    </FormDescription>
    </div>

    < FormControl >
    <Switch
                                                      checked={ field.value }
  onCheckedChange = { field.onChange }
    />
    </FormControl>
    </FormItem>
                                              );
}}
                                          />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "whiteLabel"
render = {({ field }) => {
  return (
    <FormItem className= "flex flex-row items-center justify-between rounded-lg border gap-4 p-4" >
    <div>
    <FormLabel>Public Company </FormLabel>
      <FormDescription>
                          mode will show your
                          company logo to all  accounts by default. You can
                          overwrite this functionality through Account
  settings.
                        </FormDescription>
    </div>

    < FormControl >
    <Switch
                          checked={ field.value }
  onCheckedChange = { field.onChange }
    />
    </FormControl>
    </FormItem>
                  );
}}
              />


  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "vision"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Vision of Company </FormLabel>
    < FormControl >
    <Input placeholder="Enter Vision of Company" {...field } />
      </FormControl>
      < FormMessage />
      </FormItem>
                              )}
                            />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "mission"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Mission of the company </FormLabel>
    < FormControl >
    <Input placeholder="Enter Mission" {...field } />
      </FormControl>
      < FormMessage />
      </FormItem>
                                            )}
                                          />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "address"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Address </FormLabel>
  < FormControl >
  <Input placeholder="Enter the Address" {...field } />
    </FormControl>
    < FormMessage />
    </FormItem>
                )}
              />
  < div className = "flex md:flex-row gap-4" >
    <FormField
                  disabled={ isSubmitting }
control = { form.control }
name = "city"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>City </FormLabel>
  < FormControl >
  <Input placeholder="Enter City" {...field } />
    </FormControl>
    < FormMessage />
    </FormItem>
                  )}
                />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "state"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>State </FormLabel>
  < FormControl >
  <Input placeholder="Enter State" {...field } />
    </FormControl>
    < FormMessage />
    </FormItem>
                  )}
                />


  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "zipCode"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Zip Code </FormLabel>
    < FormControl >
    <Input placeholder="Enter PinCode" {...field } />
      </FormControl>
      < FormMessage />
      </FormItem>
                  )}
                />
  </div>
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "linkedinUrl"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>LinkedIn URL </FormLabel>
    < FormControl >
    <Input placeholder="Enter LinkedIn URL" {...field } />
      </FormControl>
      < FormMessage />
      </FormItem>
                    )}
                  />

  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "twitterUrl"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Enter Twitter URL </FormLabel>
    < FormControl >
    <Input placeholder="Enter Twitter URL" {...field } />
      </FormControl>
      < FormMessage />
      </FormItem>
                    )}
                  />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "facebookUrl"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Enter Facebook URL </FormLabel>
    < FormControl >
    <Input placeholder="Enter Facebook URL" {...field } />
      </FormControl>
      < FormMessage />
      </FormItem>
                    )}
                  />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "country"
render = {({ field }) => (
  <FormItem>
  <FormLabel>Country </FormLabel>
  < FormControl >
  <Input placeholder= "Enter respective country" {...field } />
    </FormControl>
    < FormMessage />
    </FormItem>
                )}
              />

{
  data?.id && (
    <div className="flex flex-col gap-2" >
      <FormLabel>Create A Goal </FormLabel>
        <FormDescription>
        🎯 Create a goal for your company.
    </FormDescription>
    < NumberInput
  defaultValue = { data.goal }
  min = { 1}
  className = "!bg-background !border !border-input rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  placeholder = "Account Goal"
  onValueChange = { async(value) => {
    if (!data.id) {
      return;
    }

    await updateAgencyDetails(data?.id, { goal: value });
    await saveActivityLogsNotification({
      description: `Updated the company goal to | ${value} Sub Account`,
    });

    router.refresh();
  }
}
                  />
  </div>
              )}
<div className="flex justify-end " >
  <Button
                  type="submit"
isLoading = { isSubmitting }
disabled = { isSubmitting }
className = "bg-violet-600"
  >
  Save Company Information
    </Button>
    </div>
    </form>
    </Form>
    </CardContent>
    </Card>
    </div>
    <div>
{
  data?.id && (
    <Card className="border border-destructive mt-10" >
      <CardHeader>
      <CardTitle className="text-destructive" > Danger Zone </CardTitle>
        <CardDescription>
              Deleting your company cannot be undone. 
            </CardDescription>
    </CardHeader>
    < CardFooter >
    <AlertDialogTrigger
              disabled={ isSubmitting || deletingAgency }
  asChild
    >
    <div className="flex justify-end w-full" >
      <Button
                  variant="destructive"
  disabled = { isSubmitting || deletingAgency
}
isLoading = { isSubmitting || deletingAgency}
                >
  Delete Company
    </Button>
    </div>
    </AlertDialogTrigger>

    < AlertDialogContent >
    <AlertDialogHeader>
    <AlertDialogTitle className="text-left" >
      Are you absolutely sure ?
        </AlertDialogTitle>
        < AlertDialogDescription className = "text-left" >
          This action cannot be undone.This will permanently delete the
                  company account and all related accounts.
                </AlertDialogDescription>
  </AlertDialogHeader>
  < AlertDialogFooter className = "flex items-center" >
    <AlertDialogCancel>Cancel </AlertDialogCancel>
    < AlertDialogAction
disabled = { deletingAgency }
className = "bg-destructive hover:bg-destructive"
onClick = { handleDeleteAgency }
  >
  Delete
  </AlertDialogAction>
  </AlertDialogFooter>
  </AlertDialogContent>
  </CardFooter>
  </Card>
      )}
</div>
  </div>
  </AlertDialog>
  );
};

export default CompanyDetails;
