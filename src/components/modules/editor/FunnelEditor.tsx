"use client";

import React from "react";
import { Ban, EyeOff } from "lucide-react";
import { type FunnelPage } from "@prisma/client";

import EditorRecursive from "./editor-elements/EditorRecursive";

import { useEditor } from "@/hooks/use-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import clsx from "clsx";

interface FunnelEditorProps {
  funnelPageId: string;
  liveMode?: boolean;
  funnelPageDetails: FunnelPage;
}

const FunnelEditor: React.FC<FunnelEditorProps> = ({
  funnelPageId,
  liveMode,
  funnelPageDetails,
}) => {
  const { editor, dispatch } = useEditor();

  const [customWidth, setCustomWidth] = React.useState("");
  const [customHeight, setCustomHeight] = React.useState("");

  React.useEffect(() => {
    if (liveMode) {
      dispatch({
        type: "TOGGLE_LIVE_MODE",
        payload: { value: true },
      });
    }
  }, [liveMode]);

  React.useEffect(() => {
    if (!funnelPageDetails) return undefined;

    dispatch({
      type: "LOAD_DATA",
      payload: {
        elements: funnelPageDetails.content
          ? JSON.parse(funnelPageDetails.content)
          : "",
        withLive: !!liveMode,
      },
    });
  }, [funnelPageId]);

  const handleClickElement = () => {
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {},
    });
  };

  const handlePreview = () => {
    dispatch({ type: "TOGGLE_LIVE_MODE" });
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
  };

  return (
    <> 
    <div className="flex gap-4 mb-4">
    <h1 className="justify-center flex align-center font-extrabold">Custom Size</h1>
    <input
      type="number"
      placeholder="Enter width (px)"
      value={customWidth}
      onChange={(e) => setCustomWidth(e.target.value)}
      className="border p-2 rounded"
    />
    <p>*</p>
    <input
      type="number"
      placeholder="Enter height (px)"
      value={customHeight}
      onChange={(e) => setCustomHeight(e.target.value)}
      className="border p-2 rounded"
    />
  </div>
    <div
      className={cn(
        "h-screen overflow-y-hidden overflow-x-hidden mr-[385px] z-[999999] bg-background scrollbar scrollbar-thumb-muted-foreground/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-medium",
        {
          "p-0 mr-0": editor.editor.previewMode || editor.editor.liveMode,
          [`!w-[${customWidth}px] mx-auto`]: editor.editor.device === "Custom",
          "!w-[850px] mx-auto": editor.editor.device === "Tablet",
          "!w-[1400px] mx-auto": editor.editor.device === "Macbook",
          "!w-[520px] mx-auto": editor.editor.device === "Oppo",
          "!w-[500px] mx-auto": editor.editor.device === "Vivo",
          "!w-[420px] mx-auto": editor.editor.device === "Mobile",
          "pb-[100px] use-automation-zoom-in transition-all": !editor.editor.previewMode && !editor.editor.liveMode, // for scroll
        }
      )} 
       
      style={{
        width: customWidth ? `${customWidth}px` : undefined,
        height: customHeight ? `${customHeight}px` : undefined,
        maxWidth: editor.editor.device === "Tablet" ? "850px" : editor.editor.device === "Mobile" ? "420px" : undefined,
      }}
      onClick={handleClickElement}
    >
      {editor.editor.previewMode && editor.editor.liveMode && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-[100]"
          onClick={handlePreview}
          title="Back to editor"
        >
          <Ban aria-label="Back to editor" className="w-4 h-4" />
        </Button>
      )}

      {Array.isArray(editor.editor.elements) &&
        editor.editor.elements.map((element) => (
          <EditorRecursive key={element.id} element={element} />
        ))}
    </div>
    </>
  );
};

export default FunnelEditor;
