"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Draggable } from "react-beautiful-dnd";
import { ArrowDownIcon, GridIcon } from "lucide-react";
import { type FunnelPage } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FunnelStepCardProps {
  funnelPage: FunnelPage;
  index: number;
  activePage: boolean;
  totalPages: number;
}

const FunnelStepCard: React.FC<FunnelStepCardProps> = ({
  activePage,
  funnelPage,
  index,
  totalPages,
}) => {
  let portal = document.getElementById("blur-page");

  return (
    <Draggable draggableId={funnelPage.id.toString()} index={index}>
      {(provided, snapshot) => {
        if (snapshot.isDragging) {
          const offset = { x: 300 };
          // @ts-ignore
          const x = provided.draggableProps.style?.left - offset.x;
          // @ts-ignore
          provided.draggableProps.style = {
            ...provided.draggableProps.style,
            left: x,
          };
        }

        const component = (
          <Card
            className={cn(
              "p-3 relative cursor-pointer my-3 rounded-lg shadow-lg border border-violet-700 bg-violet-800", 
              {
                "border-violet-900 bg-violet-900": activePage,
              }
            )}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <CardContent className="p-3 flex flex-col gap-3 bg-violet-700 rounded-lg">
              <p className="text-sm text-violet-300">
                This is a step in your Builder. Drag to rearrange the order and organize your workflow efficiently.
              </p>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-violet-600 rounded-lg flex items-center justify-center">
                  <GridIcon className="text-white" />
                </div>
                <span className="text-lg font-semibold text-white">{funnelPage.name}</span>
              </div>
            </CardContent>
            {funnelPage.order !== totalPages && (
              <ArrowDownIcon className="w-5 h-5 absolute -bottom-2 text-violet-500" />
            )}
            {funnelPage.order === 0 && (
              <Badge className="absolute top-2 right-2 bg-violet-500 text-white" variant="secondary">
                Default
              </Badge>
            )}
          </Card>
        );

        if (!portal) return component;
        if (snapshot.isDragging) {
          return createPortal(component, portal);
        }

        return component;
      }}
    </Draggable>
  );
};

export default FunnelStepCard;