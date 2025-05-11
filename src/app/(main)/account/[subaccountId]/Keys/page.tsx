'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { useParams } from "next/navigation";

export default function CodePreview() {
  const [code, setCode] = useState(" ");
  const [language, setLanguage] = useState("rust");
  const [font, setFont] = useState("Anonymous Pro");
  const [fontSize, setFontSize] = useState(18);
  const [padding, setPadding] = useState(64);
  const [darkMode, setDarkMode] = useState(true);
  const [bgEnabled, setBgEnabled] = useState(true);

  const { subaccountId } = useParams() as { subaccountId: string };
  const handleSave = async () => {
    try {
      const res = await fetch(`/api/env?subaccountId=${subaccountId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          font,
          fontSize,
          padding,
          darkMode,
          bgEnabled
        })
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Saved successfully!");
    } catch (err) {
      toast.error("Error saving keys.");
    }
  };

  useEffect(() => {
    if (!subaccountId) return;
  
    fetch(`/api/env?subaccountId=${subaccountId}`)
      .then(res => res.json())
      .then((data) => {
        if (data.length > 0) {
          const latest = data[0]; // newest first
          setCode(latest.code);
          setLanguage(latest.language);
          setFont(latest.font);
          setFontSize(latest.fontSize);
          setPadding(latest.padding);
          setDarkMode(latest.darkMode);
          setBgEnabled(latest.bgEnabled);
        }
      })
      .catch(() => toast.error("Error loading saved keys"));
  }, [subaccountId]);

  return (
    <div
      className={clsx(
        "min-h-screen max-h-screen overflow-y-auto p-4 md:p-10",
        darkMode ? "bg-black text-white" : "bg-white text-black"
      )}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Code Preview Area */}
      <div
        className={clsx(
          "rounded-2xl shadow-lg flex justify-center transition-all",
          bgEnabled && "bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 mt-6"
        )}
        style={{ padding: `${padding}px` }}
      >
        <div
          className={clsx(
            "rounded-xl p-4 shadow-inner w-full max-w-[600px] font-mono",
            darkMode ? "bg-[#1e0d0d] text-white" : "bg-zinc-100 text-black"
          )}
          style={{ fontFamily: font, fontSize: `${fontSize}px` }}
        >
          {/* Top Bar */}
          <div className="flex space-x-2 mb-3 items-center">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-auto text-xs sm:text-sm text-gray-400 pr-2 truncate">Enter your Environment keys</span>
          </div>

          {/* Textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={6}
            className={clsx(
              "w-full outline-none resize-none bg-transparent",
              darkMode ? "text-white" : "text-black"
            )}
            style={{ fontFamily: font, fontSize: `${fontSize}px` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-10  dark:bg-zinc-900 p-6 rounded-xl flex flex-wrap gap-6 justify-center">
        

        <div className="flex flex-col space-y-1 min-w-[160px]">
          <Label className="dark:text-white">Font</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="bg-zinc-800 dark:text-white border-zinc-700">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 dark:text-white">
              <SelectItem value="Anonymous Pro">Anonymous Pro</SelectItem>
              <SelectItem value="Consolas">Consolas</SelectItem>
              <SelectItem value="monospace">Monospace</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1 min-w-[80px]">
          <Label className="dark:text-white">Font Size</Label>
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="bg-zinc-800 dark:text-white border-zinc-700"
          />
        </div>

        <div className="flex flex-col space-y-1 min-w-[80px]">
          <Label className="dark:text-white">Padding</Label>
          <Input
            type="number"
            value={padding}
            onChange={(e) => setPadding(parseInt(e.target.value))}
            className="bg-zinc-800 dark:text-white border-zinc-700"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label className="dark:text-white">Background</Label>
          <Switch checked={bgEnabled} onCheckedChange={setBgEnabled} />
        </div>

        <div className="flex items-center space-x-2">
          <Label className="dark:text-white">Dark Mode</Label>
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
        </div>

        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 dark:text-white w-full sm:w-auto">
          Save
        </Button>
      </div>
    </div>
  );
}
