"use client";

import React from "react";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  type DropResult,
} from "react-beautiful-dnd";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  LucideEdit,
  Package,
  PackageSearch,
  Pencil,
  PlusCircle,
} from "lucide-react";
import { type FunnelPage } from "@prisma/client";

import { upsertFunnelPage } from "@/queries/funnels";

import { useModal } from "@/hooks/use-modal";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/common/CustomModal";
import FunnelPageDetails from "@/components/forms/FunnelPageDetails";
import FunnelPagePlaceholder from "@/components/ui/icons/funnel-page-placeholder";
import FunnelStepCard from "./FunnelStepCard";

import { type FunnelsForSubAccount } from "@/lib/types";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FunnelStepsProps {
  funnel: FunnelsForSubAccount;
  initialPages: FunnelPage[];
  subAccountId: string;
  funnelId: string;
}

const FunnelSteps: React.FC<FunnelStepsProps> = ({
  funnel,
  funnelId,
  initialPages,
  subAccountId,
}) => {
  const { setOpen } = useModal();
  const [clickedPage, setClickedPage] = React.useState<FunnelPage | undefined>(
    initialPages[0]
  );
  const [currentPages, setCurrentPages] =
    React.useState<FunnelPage[]>(initialPages);

  const onDragEnd = (dropResult: DropResult) => {
    const { destination, source } = dropResult;

    // checks if the destination is invalid or if the element was dropped back to its original position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return null;
    }

    // update funnel position during drag & drop
    const newPagesOrder = [...currentPages]
      .toSpliced(source.index, 1)
      .toSpliced(destination.index, 0, currentPages[source.index])
      .map((page, index) => ({
        ...page,
        order: index,
      }));

    setCurrentPages(newPagesOrder);

    newPagesOrder.forEach(async (page, index) => {
      try {
        await upsertFunnelPage(subAccountId, funnelId, {
          id: page.id,
          order: index,
          name: page.name,
        });
      } catch (error) {
        toast.error("Failed", {
          description: "Could not save page order",
        });
      }
    });
  };

  const externalLink = `${process.env.NEXT_PUBLIC_SCHEME}${funnel.subDomainName}.${process.env.NEXT_PUBLIC_DOMAIN}/${clickedPage?.pathName}`;

  return (
    <AlertDialog>
      <div className="flex lg:flex-row flex-col">
        <aside className="lg:flex-[0.3] bg-background rounded-ss-md rounded-se-md lg:rounded-se-none lg:rounded-es-md p-6 flex flex-col justify-between">
          <ScrollArea className="h-full ">
            <div className="flex gap-2 text-lg font-semibold items-center mb-4">
              <Package />
              Builder Page
            </div>
            {currentPages.length ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                  droppableId="funnels"
                  direction="vertical"
                  key="funnels"
                >
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {currentPages.map((page, index) => (
                        <div
                          className="relative"
                          key={page.id}
                          onClick={() => setClickedPage(page)}
                        >
                          <FunnelStepCard
                            funnelPage={page}
                            index={index}
                            totalPages={currentPages.length - 1}
                            activePage={page.id === clickedPage?.id}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                No pages found.
              </div>
            )}
          </ScrollArea>
          <Button
            className="mt-4 w-full inline-flex gap-2 items-center bg-violet-700 hover:bg-violet-500"
            onClick={() => {
              setOpen(
                <CustomModal
                  title="Create or Update a Builder Page"
                  subTitle="Step by Step process..."
                  scrollShadow={false}
                >
                  <FunnelPageDetails
                    subAccountId={subAccountId}
                    funnelId={funnelId}
                    order={currentPages.length}
                  />
                </CustomModal>
              );
            }}
          >
            <PlusCircle className="w-4 h-4" />
            Create New Paths
          </Button>
        </aside>
        <aside className="lg:flex-[0.7] bg-muted lg:rounded-se-md rounded-ee-md rounded-es-md lg:rounded-es-none p-4">
        {currentPages.length ? (
          <Card className="h-full flex justify-between flex-col ">
            <CardHeader className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Page Details</p>
                <CardTitle>{clickedPage?.name || "Untitled Page"}</CardTitle>
              </div>
              <CardDescription className="flex flex-col gap-4 mt-4">
                <div className="border-2 border-violet-300 rounded-lg sm:w-80 w-full overflow-clip">
                  <Link
            
                    href={`/account/${subAccountId}/builder/${funnelId}/editor/${clickedPage?.id}`}
                  >
                    <div className="cursor-pointer group-hover:opacity-30 w-full">
                      <FunnelPagePlaceholder />
                    </div>
                    <Pencil
                      className="w-12 h-12 text-muted-foreground absolute top-1/2 left-1/2 opacity-0 
                      transform -translate-x-1/2 -translate-y-1/2 group-hover:opacity-100 transition-all duration-100"
                    />
                  </Link>
                  <Link
                    href={externalLink}
                    target="_blank"
                    className="group flex items-center justify-center p-2 gap-2 text-violet-700 hover:text-violet-500 transition-colors duration-200"
                  >
                    <Globe className="w-5 h-5" />
                    <div className="w-64 overflow-hidden overflow-ellipsis">
                      {externalLink}
                    </div>
                  </Link>
                </div>
                <p className="text-sm text-gray-500">Accessing the Builder Page is available in Dekstop version only.Here you can configure the selected builder page settings.</p>
                <FunnelPageDetails
                  subAccountId={subAccountId}
                  defaultData={clickedPage}
                  funnelId={funnelId}
                  order={clickedPage?.order || 0}
                />
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            <PackageSearch className="w-8 h-8 text-violet-700" />
            <span className="ml-2">Create a page to view page settings.</span>
          </div>
        )}
        </aside>
      </div>
    </AlertDialog>
  );
};

export default FunnelSteps;
