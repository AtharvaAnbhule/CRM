"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Copy, Info, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { type FunnelPage } from "@prisma/client";

import { saveActivityLogsNotification } from "@/queries/noti";
import { upsertFunnelPage, getFunnels, deleteFunnelPage } from "@/queries/funnels";

import { useModal } from "@/hooks/use-modal";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

import { type FunnelPageDetailsSchema, FunnelPageDetailsValidator } from "@/lib/validators/funnel-page-details";

interface FunnelPageDetailsProps {
  defaultData?: FunnelPage;
  funnelId: string;
  order: number;
  subAccountId: string;
}

const FunnelPageDetails: React.FC<FunnelPageDetailsProps> = ({ funnelId, order, subAccountId, defaultData }) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<FunnelPageDetailsSchema>({
    resolver: zodResolver(FunnelPageDetailsValidator),
    mode: "onChange",
    defaultValues: { name: "", pathName: "" },
  });

  React.useEffect(() => {
    if (defaultData) {
      form.reset({ name: defaultData.name, pathName: defaultData.pathName });
    }
  }, [defaultData]);

  const onSubmit: SubmitHandler<FunnelPageDetailsSchema> = async (values) => {
    if (order !== 0 && !values.pathName) {
      return form.setError("pathName", { message: "Pages after the first require a path name." });
    }

    try {
      const response = await upsertFunnelPage(subAccountId, funnelId, {
        ...values,
        id: defaultData?.id || uuidv4(),
        order: defaultData?.order || order,
        pathName: values.pathName || "",
      });

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated Builder page | ${response?.name}`,
        subAccountId,
      });

      toast.success("Page Saved", { description: "Builder page details updated successfully." });
      setClose();
      router.refresh();
    } catch {
      toast.error("Error", { description: "Failed to save Builder page details." });
    }
  };

  const handleDeleteFunnelPage = async () => {
    if (!defaultData?.id) return;

    await deleteFunnelPage(defaultData.id);
    await saveActivityLogsNotification({
      agencyId: undefined,
      description: `Deleted funnel page | ${defaultData.name}`,
      subAccountId,
    });

    toast.success("Page Deleted", { description: "Builder page removed successfully." });
    router.refresh();
  };

  const handleCopyFunnelPage = async () => {
    const response = await getFunnels(subAccountId);
    const lastFunnelPage = response.find((funnel) => funnel.id === funnelId)?.funnelPages.length;

    await upsertFunnelPage(subAccountId, funnelId, {
      ...defaultData,
      id: uuidv4(),
      order: lastFunnelPage || 0,
      visits: 0,
      name: `${defaultData?.name} Copy`,
      pathName: `${defaultData?.pathName}-copy`,
      content: defaultData?.content,
    });

    toast.success("Page Duplicated", { description: "Builder page copied successfully." });
    router.refresh();
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <TooltipProvider>
    <Card className= "shadow-lg rounded-lg p-6 bg-white dark:bg-gray-900" >
    <CardHeader>
    <CardTitle className="text-lg font-semibold" > Builder Page </CardTitle>
      </CardHeader>
      < CardContent >
      <Form { ...form } >
      <form onSubmit={ form.handleSubmit(onSubmit) } className = "flex flex-col gap-4" >
        <FormField
                control={ form.control }
  name = "name"
  render = {({ field }) => (
    <FormItem>
    <FormLabel className= "text-sm font-medium" > Page Name </FormLabel>
      < FormControl >
      <Input placeholder="Enter page name" {...field } />
        </FormControl>
        < FormMessage />
        </FormItem>
                )}
              />
  < FormField
control = { form.control }
name = "pathName"
render = {({ field }) => (
  <FormItem>
  <FormLabel className= "text-sm font-medium flex items-center gap-2" >
  Page Path
{
  order === 0 && (
    <Badge className="text-xs" > Default </Badge>
                      )
}
</FormLabel>
  < FormControl >
  <Input placeholder="Enter path name" {...field } />
    </FormControl>
    < FormMessage />
    </FormItem>
                )}
              />
  < div className = "flex justify-end gap-3 mt-4" >
    { defaultData?.id && (
      <>
      <Tooltip>
      <TooltipTrigger asChild >
      <Button
                          variant="ghost"
className = "text-red-600 "
onClick = { handleDeleteFunnelPage }
  >
  <Trash2 className="w-5 h-5" />
    </Button>
    </TooltipTrigger>
    < TooltipContent > Delete Page </TooltipContent>
      </Tooltip>
      < Tooltip >
      <TooltipTrigger asChild >
      <Button
                          variant="ghost"
className = "text-gray-600"
onClick = { handleCopyFunnelPage }
  >
  <Copy className="w-5 h-5" />
    </Button>
    </TooltipTrigger>
    < TooltipContent > Make a copy of Page </TooltipContent>
      </Tooltip>
      </>
                )}
<Button type="submit" className = "bg-violet-700 text-white hover:bg-violet-500" >
  { isLoading?<Loader2 className = "w-4 h-4 animate-spin" /> : "Save Page"}
</Button>
  </div>
  </form>
  </Form>
  </CardContent>
  </Card>
  </TooltipProvider>
  );
};

export default FunnelPageDetails;
