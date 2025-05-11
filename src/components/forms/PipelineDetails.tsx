"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";

import { deletePipeline, upsertPipeline } from "@/queries/workflow";
import { saveActivityLogsNotification } from "@/queries/noti";

import { useModal } from "@/hooks/use-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pipeline } from "@prisma/client";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import {
  CreatePipelineValidator,
  type CreatePipelineSchema,
} from "@/lib/validators/create-pipeline";

interface PipelineDetailsProps {
  defaultData?: Pipeline;
  subAccountId: string;
  pipelineId: string;
}

const PipelineDetails: React.FC<PipelineDetailsProps> = ({
  defaultData,
  subAccountId,
  pipelineId,
}) => {
  const { setClose } = useModal();
  const router = useRouter();

  const form = useForm<CreatePipelineSchema>({
    mode: "onChange",
    resolver: zodResolver(CreatePipelineValidator),
    defaultValues: {
      name: defaultData?.name || "",
      email: defaultData?.email || "",
    },
  });

  React.useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || "",
        email: defaultData.email || "",
      });
    }
  }, [defaultData]);

  const isLoading = form.formState.isLoading;

  const handleDelete = async () => {
    try {
      const response = await deletePipeline(pipelineId);

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted Workflow | ${response?.name}`,
        subAccountId,
      });

      toast.success("Deleted", {
        description: "Workflow has been deleted",
      });
      router.push(`/account/${subAccountId}/workflow`);
    } catch (error) {
      toast.error("Oops!", {
        description: "Could not delete Workflow",
      });
    }
  };

  const onSubmit: SubmitHandler<CreatePipelineSchema> = async (values) => {
    if (!subAccountId) return;

    try {
      const response = await upsertPipeline({
        ...values,
        id: defaultData?.id,
        subAccountId: subAccountId,
      });

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated Workflow | ${response?.name}`,
        subAccountId,
      });

      toast.success("Success", {
        description: "Workflow details have been saved",
      });
      router.refresh();
    } catch (error) {
      toast.error("Oops!", {
        description: "Could not save Workflow details",
      });
    }

    setClose();
  };

  return (
    <Card className= "max-w-2xl w-full mx-auto dark:text-white shadow-lg rounded-lg p-6" >
    <CardHeader>
    <CardTitle className="text-xl font-semibold dark:text-white-800" >
      Workflow Details
        </CardTitle>
        </CardHeader>
        < CardContent >
        <Form { ...form } >
        <form onSubmit={ form.handleSubmit(onSubmit) } className = "flex flex-col gap-5" >
          <FormField
              disabled={ isLoading }
  control = { form.control }
  name = "name"
  render = {({ field }) => (
    <FormItem>
    <FormLabel className= "text-gray-600" > Workflow Name </FormLabel>
      < FormControl >
      <Input
                      className="border border-gray-300 focus:ring-2 focus:ring-green-400 rounded-md p-2 transition-all"
placeholder = "Enter workflow name"
{...field }
                    />
  </FormControl>
  < FormMessage />
  </FormItem>
              )}
            />

  < FormField
disabled = { isLoading }
control = { form.control }
name = "email"
render = {({ field }) => (
  <FormItem>
  <FormLabel className= "text-gray-600" > Workflow Email </FormLabel>
    < FormControl >
    <Input
                      className="border border-gray-300 focus:ring-2 focus:ring-blue-400 rounded-md p-2 transition-all"
placeholder = "Enter email"
{...field }
                    />
  </FormControl>
  < FormMessage />
  </FormItem>
              )}
            />

  < div className = "flex items-center justify-between mt-6" >
    <Button
                className="px-5 py-2 rounded-md bg-violet-700 text-white hover:bg-violet-500 transition-all"
disabled = { isLoading }
isLoading = { isLoading }
type = "submit"
  >
  Save Changes
    </Button>

{/* Alert Dialog for Deleting Pipeline */ }
<AlertDialog>
  <AlertDialogTrigger asChild >
  <Button className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-500 transition-all" >
    Delete Workflow
      </Button>
      </AlertDialogTrigger>
      < AlertDialogContent className = "rounded-lg p-6 bg-white shadow-lg" >
        <AlertDialogHeader>
        <AlertDialogTitle className="text-lg font-semibold text-red-600" >
          Are you absolutely sure ?
            </AlertDialogTitle>
            < AlertDialogDescription className = "text-gray-700" >
              This action cannot be undone.This will permanently delete
                this workflow and all related records.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  < AlertDialogFooter className = "flex justify-end mt-4" >
                    <AlertDialogCancel className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md" >
                      Cancel
                      </AlertDialogCancel>
                      < AlertDialogAction
className = "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-all"
onClick = { handleDelete }
  >
  Confirm Delete
    </AlertDialogAction>
    </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>
    </div>
    </form>
    </Form>
    </CardContent>
    </Card>
  );
};

export default PipelineDetails;
