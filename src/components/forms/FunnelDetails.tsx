"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { v4 } from "uuid";
import { type Funnel } from "@prisma/client";

import { saveActivityLogsNotification } from "@/queries/noti";
import { upsertFunnel } from "@/queries/funnels";

import { useModal } from "@/hooks/use-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import FileUpload from "../common/FileUpload";

import {
  type FunnelDetailsSchema,
  FunnelDetailsValidator,
} from "@/lib/validators/funnel-details";

interface FunnelDetailsProps {
  defaultData?: Funnel;
  subAccountId: string;
}

const FunnelDetails: React.FC<FunnelDetailsProps> = ({
  defaultData,
  subAccountId,
}) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<FunnelDetailsSchema>({
    mode: "onChange",
    resolver: zodResolver(FunnelDetailsValidator),
    defaultValues: {
      name: defaultData?.name || "",
      email: defaultData?.email || "",
      description: defaultData?.description || "",
      favicon: defaultData?.favicon || "",
      subDomainName: defaultData?.subDomainName || "",
    },
  });

  React.useEffect(() => {
    if (defaultData) {
      form.reset({
        description: defaultData.description || "",
        favicon: defaultData.favicon || "",
        name: defaultData.name || "",
        email: "",
        subDomainName: defaultData.subDomainName || "",
      });
    }
  }, [defaultData]);

  const onSubmit = async (values: FunnelDetailsSchema) => {
    if (!subAccountId) return;

    const response = await upsertFunnel(
      subAccountId,
      { ...values, liveProducts: defaultData?.liveProducts || "[]" },
      defaultData?.id || v4()
    );

    await saveActivityLogsNotification({
      agencyId: undefined,
      description: `Update builder | ${response.name}`,
      subAccountId,
    });

    if (response) {
      toast.success("Success", {
        description: "Saved builder details",
      });
    } else {
      toast.error("Oops!", {
        description: "Could not save builder details",
      });
    }

    setClose();
    router.refresh();
  };

  const isLoading = form.formState.isLoading || form.formState.isSubmitting;

  return (
    <Card className= "flex-1 w-full dark:bg-gray-950 shadow-md rounded-lg p-6" >
    <CardHeader>
    <CardTitle className="text-lg font-semibold text-white-800" >
      Builder Details
        </CardTitle>
        </CardHeader>
        < CardContent >
        <Form { ...form } >
        <form
            onSubmit={ form.handleSubmit(onSubmit) }
  className = "grid gap-6 md:grid-cols-2"
    >
    <FormField
              disabled={ isLoading }
  control = { form.control }
  name = "email"
  render = {({ field }) => (
    <FormItem className= "flex flex-col" >
    <FormLabel className="font-medium text-gray-600" >
      Builder Owner Email
        </FormLabel>
        < FormControl >
        <Input
                      placeholder="Enter builder owner's email"
{...field }
className = "border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md p-2"
  />
  </FormControl>
  </FormItem>
              )}
            />
  < FormField
disabled = { isLoading }
control = { form.control }
name = "name"
render = {({ field }) => (
  <FormItem className= "flex flex-col" >
  <FormLabel className="font-medium text-gray-600" >
    Builder Name
      </FormLabel>
      < FormControl >
      <Input
                      placeholder="Enter builder name"
{...field }
className = "border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md p-2"
  />
  </FormControl>
  </FormItem>
              )}
            />
  < FormField
disabled = { isLoading }
control = { form.control }
name = "description"
render = {({ field }) => (
  <FormItem className= "flex flex-col col-span-2" >
  <FormLabel className="font-medium text-gray-600" >
    Builder Description
      </FormLabel>
      < FormControl >
      <Textarea
                      placeholder="Tell us more about the builder..."
{...field }
className = "border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md p-2"
  />
  </FormControl>
  </FormItem>
              )}
            />
  < FormField
disabled = { isLoading }
control = { form.control }
name = "subDomainName"
render = {({ field }) => (
  <FormItem className= "flex flex-col" >
  <FormLabel className="font-medium text-gray-600" >
    Domain
    </FormLabel>
    < FormControl >
    <Input
                      placeholder="Enter builder's domain"
{...field }
className = "border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md p-2"
  />
  </FormControl>
  </FormItem>
              )}
            />
  < FormField
disabled = { isLoading }
control = { form.control }
name = "favicon"
render = {({ field }) => (
  <FormItem className= "flex flex-col col-span-2" >
  <FormLabel className="font-medium text-gray-600" >
    Image
    </FormLabel>
    < FormControl >
    <FileUpload
                      endpoint="subAccountLogo"
value = { field.value as string }
onChange = { field.onChange }
  />
  </FormControl>
  < FormMessage />
  </FormItem>
              )}
            />
  < div className = "col-span-2 flex justify-end" >
    <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
disabled = { isLoading }
isLoading = { isLoading }
type = "submit"
  >
  Save
  </Button>
  </div>
  </form>
  </Form>
  </CardContent>
  </Card>
  );
};

export default FunnelDetails;
