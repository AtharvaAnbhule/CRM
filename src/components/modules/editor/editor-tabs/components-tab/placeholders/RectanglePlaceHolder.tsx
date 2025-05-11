import React from "react";
import { RectangleHorizontal } from "lucide-react"; // Rectangle icon

const RectanglePlaceholder: React.FC = () => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("componentType", "rectangle");
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="w-14 h-14 bg-muted border border-gray-400 flex items-center justify-center cursor-grab"
    >
      <RectangleHorizontal className="text-muted-foreground w-10 h-6" />
    </div>
  );
};

export default RectanglePlaceholder;
