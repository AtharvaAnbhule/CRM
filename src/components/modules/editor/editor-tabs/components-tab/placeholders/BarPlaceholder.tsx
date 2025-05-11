import React from "react";
import { BarChart } from "lucide-react";

interface BarGraphPlaceholderProps {}

const BarGraphPlaceholder: React.FC<BarGraphPlaceholderProps> = () => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("componentType", "barGraph");
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="h-14 w-14 bg-muted rounded-lg flex items-center justify-center cursor-grab"
    >
      <BarChart className="text-muted-foreground w-10 h-10" />
    </div>
  );
};

export default BarGraphPlaceholder;
