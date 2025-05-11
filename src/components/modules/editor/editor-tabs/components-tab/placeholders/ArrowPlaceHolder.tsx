import React from "react";
import { ArrowRight } from "lucide-react";

const ArrowPlaceholder: React.FC = () => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("componentType", "arrow");
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="w-14 h-14 flex items-center justify-center cursor-grab border border-gray-400 bg-muted"
    >
      <ArrowRight className="text-muted-foreground w-10 h-10" />
    </div>
  );
};

export default ArrowPlaceholder;
