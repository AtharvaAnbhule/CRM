"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";

interface ColorPickerProps {
  id?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({
  id,
  value,
  onChange,
  className,
}: ColorPickerProps) {
  const solids = [
    "#000000", "#333333", "#ffffff", "#ff0000", "#ff8800", "#ffee00", "#33ff00",
    "#00ff88", "#00aaff", "#0033ff", "#8800ff", "#ff00ff", "#ff5588", "#ff99aa",
    "#55ffaa", "#99ff55", "#aaffff", "#ffaa55", "#ffcc00", "#ee44ff", "#ff4499",
    "#dd4444", "#77ff77", "#99aaff", "#4444ff", "#aa77ff", "#ff4488", "#ff5555"
  ];

  const gradients = [
    "linear-gradient(to right, #ff7e5f, #feb47b)",
    "linear-gradient(to right, #ff6a00, #ee0979)",
    "linear-gradient(to right, #00c6ff, #0072ff)",
    "linear-gradient(to right, #F00000, #DC281E)",
    "linear-gradient(to right, #12c2e9, #c471ed, #f64f59)",
    "linear-gradient(to right, #00b09b, #96c93d)",
    "linear-gradient(to right, #ff9a9e, #fad0c4)",
    "linear-gradient(to right, #a18cd1, #fbc2eb)",
    "linear-gradient(to right, #ffecd2, #fcb69f)",
    "linear-gradient(to right, #4facfe, #00f2fe)",
    "linear-gradient(to right, #3b82f6, #9333ea)",
    "linear-gradient(to right, #f953c6, #b91d73)",
    "linear-gradient(to right, #ff00cc, #333399)",
    "linear-gradient(to right, #fc466b, #3f5efb)",
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left truncate font-medium shadow-lg border border-gray-300 dark:border-gray-700",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex w-full items-center gap-2 truncate">
            {value ? (
              <div
                className="h-5 w-5 rounded-full border border-gray-400 shadow-md"
                style={{ background: value }}
              />
            ) : (
              <Paintbrush className="h-5 w-5 text-gray-500" />
            )}
            <div className="flex-1 truncate text-sm">
              {value ? value : "Pick a color"}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 shadow-xl rounded-lg">
        <Tabs defaultValue="solid" className="w-full">
          <TabsList className="mb-4 w-full bg-gray-200 dark:bg-gray-800 rounded-md">
            <TabsTrigger className="flex-1" value="solid">
              Solid
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="gradient">
              Gradient
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solid" className="flex flex-wrap gap-2 p-2">
            {solids.map((color) => (
              <div
                key={color}
                style={{ background: color }}
                className="h-7 w-7 rounded-full cursor-pointer border border-gray-400 shadow-md transition-transform hover:scale-110 active:scale-95"
                onClick={() => onChange(color)}
              />
            ))}
          </TabsContent>

          <TabsContent value="gradient" className="p-2">
            <div className="grid grid-cols-3 gap-2">
              {gradients.map((gradient) => (
                <div
                  key={gradient}
                  style={{ background: gradient }}
                  className="h-10 w-full rounded-md cursor-pointer border border-gray-400 shadow-md transition-transform hover:scale-105 active:scale-95"
                  onClick={() => onChange(gradient)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <Input
            id={id}
            value={value}
            placeholder="Enter custom color..."
            className="h-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-md text-center"
            onChange={(e) => onChange(e.currentTarget.value)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
