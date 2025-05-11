"use client";

import { useEditor } from "@/hooks/use-editor";
import { EditorElement } from "@/lib/types/editor";
import { Trash } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface EditorRectangleProps {
  element: EditorElement;
}
//@ts-ignore
const EditorRectangle: React.FC<EditorRectangleProps> = ({ element }) => {
  const { dispatch } = useEditor();
  const rectRef = useRef<HTMLDivElement | null>(null);

  // State for position
  const [position, setPosition] = useState({
    left: parseInt(element.styles.left as string) || 100,
    top: parseInt(element.styles.top as string) || 100,
  });

  // State for size
  const [size, setSize] = useState({
    width: parseInt(element.styles.width as string) || 120,
    height: parseInt(element.styles.height as string) || 80,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isDragging && !isResizing) {
      // Save position & size when drag or resize is finished
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          elementDetails: {
            ...element,
            styles: {
              ...element.styles,
              left: `${position.left}px`,
              top: `${position.top}px`,
              width: `${size.width}px`,
              height: `${size.height}px`,
            },
          },
        },
      });
    }
  }, [isDragging, isResizing]);

  // 🟢 DRAG HANDLING
  const handleMouseDownDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = position.left;
    const startTop = position.top;

    const onMouseMove = (event: MouseEvent) => {
      setPosition({
        left: startLeft + (event.clientX - startX),
        top: startTop + (event.clientY - startY),
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // 🔵 RESIZE HANDLING
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const onMouseMove = (event: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (event.clientX - startX));
      const newHeight = Math.max(30, startHeight + (event.clientY - startY));
      setSize({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={rectRef}
      onMouseDown={handleMouseDownDrag}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >
      {/* Rectangle Shape */}
      <div
        className="relative border-2 border-black flex items-center justify-center"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          backgroundColor: "transparent",
        }}
      >
        {/* Resize Handle (Bottom-Right) */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-gray-600 cursor-nwse-resize"
          onMouseDown={handleMouseDownResize}
        ></div>
      </div>

      {/* Delete Button */}
      <div
        className="absolute bg-primary px-2 py-1 text-xs font-bold -top-[25px] -right-[1px] rounded-none rounded-t-lg text-white"
        onClick={() =>
          dispatch({ type: "DELETE_ELEMENT", payload: { elementDetails: element } })
        }
      >
        <Trash className="cursor-pointer w-4 h-4" />
      </div>
    </div>
  );
};

export default EditorRectangle;
