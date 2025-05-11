import React from "react";
import { Circle } from "lucide-react"; // Using Circle as Ellipse (Lucide-react doesn't have an ellipse icon)

const EllipsePlaceholder: React.FC = () => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("componentType", "ellipse");
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="w-14 h-14 bg-muted border border-gray-400 rounded-full flex items-center justify-center cursor-grab"
    >
      <Circle className="text-muted-foreground w-10 h-6" /> {/* Simulating an ellipse */}
    </div>
  );
};

export default EllipsePlaceholder;
