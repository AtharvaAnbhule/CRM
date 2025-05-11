"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lane } from "@prisma/client";

import { getPipelineDetails } from "@/queries/workflow";
import { upsertLane } from "@/queries/lanes";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ColorPicker } from "../ui/color-picker";
import {
  type LaneDetailsSchema,
  LaneDetailsValidator,
} from "@/lib/validators/lane-details";

interface LaneDetailsProps {
  defaultData?: Lane;
  pipelineId: string;
}

const LaneDetails: React.FC<LaneDetailsProps> = ({
  defaultData,
  pipelineId,
}) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<LaneDetailsSchema>({
    mode: "onChange",
    resolver: zodResolver(LaneDetailsValidator),
    defaultValues: {
      name: defaultData?.name || "Untitled Workflow",
      color:
        defaultData?.color ||
        "linear-gradient(to right, #ff758c, #ff7eb3, #ffb199, #ffcaa6)",
    },
  });

  React.useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || "Default Workflow Name",
      });
    }
  }, [defaultData]);

  const onSubmit: SubmitHandler<LaneDetailsSchema> = async (values) => {
    if (!pipelineId) return;

    try {
      const response = await upsertLane({
        ...values,
        id: defaultData?.id,
        pipelineId: pipelineId,
        order: defaultData?.order,
      });

      const pipelineDetails = await getPipelineDetails(pipelineId);
      if (!pipelineDetails) return;

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a workflow | ${response?.name}`,
        subAccountId: pipelineDetails.subAccountId,
      });

      toast.success("Success!", {
        description: "Workflow details saved successfully.",
      });

      router.refresh();
    } catch (error) {
      toast.error("Oops!", {
        description: "Failed to save workflow details.",
      });
    }

    setClose();
  };

  const isLoading = form.formState.isLoading || form.formState.isSubmitting;

  return (
    <Card className= "w-full bg-gradient-to-r  dark:text-gray-200 border-gray-800" >
    <CardHeader>
    <CardTitle className="text-white-400" > Workflow Configuration </CardTitle>
      </CardHeader>
      < CardContent >
      <p className="text-sm text-gray-400 mb-4" >
        Customize your workflow settings below.Add a name, choose a color, and save!
          </p>
          < Form {...form }>
            <form onSubmit={ form.handleSubmit(onSubmit) } className = "space-y-5" >
              <FormField
              disabled={ isLoading }
  control = { form.control }
  name = "name"
  render = {({ field }) => (
    <FormItem>
    <FormLabel className= "text-white-400" > Workflow Name </FormLabel>
      < FormControl >
      <Input placeholder="Enter workflow name..." {...field } />
        </FormControl>
        < FormMessage />
        </FormItem>
              )}
            />

  < FormField
disabled = { isLoading }
control = { form.control }
name = "color"
render = {({ field }) => (
  <FormItem>
  <FormLabel className= "text-blue-400" > Choose Color Theme </FormLabel>
    < FormControl className = "flex justify-center" >
      <ColorPicker value={ field.value } onChange = { field.onChange } />
        </FormControl>
        < FormMessage />
        </FormItem>
              )}
            />

  < div className = "flex justify-end" >
    <Button
                disabled={ isLoading }
isLoading = { isLoading }
type = "submit"
className = "w-24 bg-indigo-600 hover:bg-indigo-400 text-white font-semibold"
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

export default LaneDetails;
