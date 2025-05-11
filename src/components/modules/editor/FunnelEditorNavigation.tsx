"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeftCircle,
  Clock,
  Eye,
  Laptop,
  Monitor,
  Redo,
  Redo2,
  Smartphone,
  SmartphoneIcon,
  SmartphoneNfc,
  Tablet,
  Undo,
  Undo2,
  ViewIcon,
} from "lucide-react";
import { type FunnelPage } from "@prisma/client";

import { upsertFunnelPage } from "@/queries/funnels";
import { saveActivityLogsNotification } from "@/queries/noti";

import { useEditor } from "@/hooks/use-editor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/common/ModeToggle";

import { cn } from "@/lib/utils";
import { type DeviceTypes } from "@/lib/types/editor";

interface FunnelEditorNavigationProps {
  funnelId: string;
  subAccountId: string;
  funnelPageDetails: FunnelPage;
}

const FunnelEditorNavigation: React.FC<FunnelEditorNavigationProps> = ({
  funnelId,
  funnelPageDetails,
  subAccountId,
}) => {
  const router = useRouter();
  const { editor, dispatch } = useEditor();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [customSize, setCustomSize] = React.useState({ width: "", height: "" });

  React.useEffect(() => {
    dispatch({
      type: "SET_FUNNELPAGE_ID",
      payload: {
        funnelPageId: funnelPageDetails.id,
      },
    });
  }, [funnelPageDetails]);

  const handleBlurTitleChange = async (
    event: React.FocusEvent<HTMLInputElement, Element>
  ) => {
    if (event.target.value === funnelPageDetails.name) return;

    if (event.target.value) {
      await upsertFunnelPage(subAccountId, funnelId, {
        id: funnelPageDetails.id,
        name: event.target.value,
        order: funnelPageDetails.order,
      });

      toast.success("Success", {
        description: "Saved Builder page title",
      });

      router.refresh();
    } else {
      toast.error("Oppse!", {
        description: "You need to have a title!",
      });
    }
  };

  const handlePreviewClick = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
    dispatch({ type: "TOGGLE_LIVE_MODE" });
  };

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
  };

  const handleSave = async () => {
    setIsLoading(true);
    const content = JSON.stringify(editor.editor.elements);

    try {
      const response = await upsertFunnelPage(subAccountId, funnelId, {
        ...funnelPageDetails,
        content,
      });

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a Builder page | ${response?.name}`,
        subAccountId,
      });

      dispatch({ type: "CLEAR_HISTORY" });

      toast.success("Success", {
        description: "Saved content",
      });

      router.refresh();
    } catch (error) {
      toast.error("Oopse!", {
        description: "Could not save content",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSave();
    } else if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleUndo();
    } else if (event.key === "y" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleRedo();
    } else if (event.key === "p" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handlePreviewClick();
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);


  const handleCustomSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomSize((prev) => ({ ...prev, [name]: value }));
  };

  const applyCustomSize = () => {
    if (customSize.width && customSize.height) {
      dispatch({
        type: "CHANGE_DEVICE",
        payload: {
          device: "Custom",
        },
      });
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
    <nav
      className={cn(
        "border-b flex items-center justify-between px-6 py-4 gap-2 transition-all",
        {
          "h-0 p-0 -mt-2 overflow-hidden": editor.editor.previewMode,
        }
      )}
    >
      {/* LEFT SIDE */}
      <aside className="flex items-center gap-4 max-w-[300px] w-full">
        <Link href={`/account/${subAccountId}/builder/${funnelId}`}>
          <ArrowLeftCircle className="w-6 h-6 text-gray-600 hover:text-gray-800 transition" aria-label="Back" />
        </Link>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2">
            <Input
              defaultValue={funnelPageDetails.name}
              onBlur={handleBlurTitleChange}
              className="border-none h-7 m-0 p-0 text-lg font-medium rounded-sm"
            />
            <Tooltip>
              <TooltipTrigger>
                <ModeToggle className="h-10 w-10 rounded-md" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Color Mode</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-sm text-muted-foreground">
            Path: /{funnelPageDetails.pathName}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Modify the details as needed to fit your workflow.
          </p>
          <p className="text-xs text-gray-400 italic">
            Last edited {funnelPageDetails.name}{" "}
            {format(new Date(funnelPageDetails.updatedAt), "dd/MM/yyyy")}
          </p>
        </div>
      </aside>
  
      {/* CENTER - Device Tabs */}
      <aside>
        <Tabs
          defaultValue="Desktop"
          className="w-fit"
          value={editor.editor.device}
          onValueChange={(value) => {
            dispatch({
              type: "CHANGE_DEVICE",
              payload: { device: value as DeviceTypes },
            });
          }}
        >
          <TabsList className="grid w-full grid-cols-5 gap-x-2 bg-transparent h-fit">
            {[
              { label: "Desktop", icon: Laptop },
              { label: "Tablet", icon: Tablet },
              { label: "Mobile", icon: Smartphone },
              { label: "Macbook Pro", icon: Monitor, value: "Macbook" },
              { label: "Oppo Model", icon: SmartphoneNfc, value: "Oppo" },
              { label: "Vivo Model", icon: SmartphoneIcon, value: "Vivo" },
            ].map(({ label, icon: Icon, value = label }) => (
              <Tooltip key={value}>
                <TooltipTrigger>
                  <TabsTrigger
                    value={value}
                    className="data-[state=active]:bg-muted w-10 h-10 p-0 border border-input bg-background"
                  >
                    <Icon className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TabsList>
        </Tabs>
      </aside>
  
      {/* RIGHT SIDE */}
      <aside className="flex items-center gap-2">
        {/* Preview */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviewClick}
              className="bg-violet-700 hover:bg-violet-500"
            >
              <ViewIcon className="w-5 h-5" aria-label="Preview" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="inline-flex items-center gap-2">
              View{" "}
              <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                <div className="text-xs">CTRL</div>P
              </kbd>
            </p>
          </TooltipContent>
        </Tooltip>
  
        {/* Undo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={editor.history.currentIndex <= 0}
              onClick={handleUndo}
              variant="outline"
              size="icon"
              className="bg-violet-700 hover:bg-violet-500"
            >
              <Undo className="w-5 h-5" aria-label="Undo" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="inline-flex items-center gap-2">
              Undo{" "}
              <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                <div className="text-xs">CTRL</div>Z
              </kbd>
            </p>
          </TooltipContent>
        </Tooltip>
  
        {/* Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={editor.history.currentIndex >= editor.history.history.length - 1}
              onClick={handleRedo}
              variant="outline"
              size="icon"
              className="bg-violet-700 hover:bg-violet-500"
            >
              <Redo className="w-5 h-5" aria-label="Redo" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="inline-flex items-center gap-2">
              Redo{" "}
              <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                <div className="text-xs">CTRL</div>Y
              </kbd>
            </p>
          </TooltipContent>
        </Tooltip>
  
        {/* Save */}
        <div className="flex flex-col gap-1 relative">
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-24 px-0 bg-violet-700 hover:bg-violet-500"
          >
            Save{" "}
            {editor.history.history.length > 1 &&
              `(${editor.history.history.length <= 50 ? editor.history.history.length : "50+"})`}
          </Button>
        </div>
      </aside>
    </nav>
  </TooltipProvider>
  
  );
};

export default FunnelEditorNavigation;
