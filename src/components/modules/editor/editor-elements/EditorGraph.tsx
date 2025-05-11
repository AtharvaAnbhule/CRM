"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEditor } from "@/hooks/use-editor";
import { EditorElement } from "@/lib/types/editor";

interface EditorGraphProps {
  element: EditorElement;
}

const EditorGraph: React.FC<EditorGraphProps> = ({ element }) => {
  const { dispatch } = useEditor();

  const [position, setPosition] = useState({
    left: parseInt(element.styles.left) || 100,
    top: parseInt(element.styles.top) || 100,
  });

  const [size, setSize] = useState({
    width: parseInt(element.styles.width) || 300,
    height: parseInt(element.styles.height) || 200,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const data = [
    { name: "A", value: 30 },
    { name: "B", value: 70 },
    { name: "C", value: 50 },
    { name: "D", value: 90 },
  ];

  useEffect(() => {
    if (!isDragging && !isResizing) {
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          elementDetails: {
            ...element,
            styles: {
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

  return (
    <div
      onMouseDown={handleMouseDownDrag}
      style={{
        position: "absolute",
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EditorGraph;
