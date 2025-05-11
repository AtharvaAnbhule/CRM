import React from "react";
import { Move } from "lucide-react";

interface CirclePlaceholderProps {}

const CirclePlaceholder: React.FC<CirclePlaceholderProps> = () => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("componentType", "circle");
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="h-14 w-14 bg-muted rounded-full flex items-center justify-center cursor-grab"
    >
      <Move className="text-muted-foreground w-10 h-10" />
    </div>
  );
};

export default CirclePlaceholder;
