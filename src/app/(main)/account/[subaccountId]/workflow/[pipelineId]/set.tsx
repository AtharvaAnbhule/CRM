"use client";

import { useState } from "react";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet"; // Import Sheet from ShadCN
import PipelineSettings from "@/components/forms/PipelineSettings";

const YourComponent = ({ pipelineId, allPipelines, subaccountId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Button to Open Modal */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            className="px-4 py-2 bg-violet-700 hover:bg-violet-500 text-white rounded-md"
            onClick={() => setIsModalOpen(true)}
          >
            Settings
          </button>
        </SheetTrigger>

        {/* Sheet Modal */}
        <SheetContent
          side="bottom" // Ensures the modal slides up from the bottom
          className="w-full max-w-lg bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
        >
          {/* Close Button */}
          <SheetClose asChild>
            <button className="absolute top-2 right-4 text-gray-600 dark:text-gray-400">
              ✖
            </button>
          </SheetClose>

          {/* PipelineSettings Component Inside Modal */}
          <PipelineSettings
            pipelineId={pipelineId}
            pipelines={allPipelines}
            subaccountId={subaccountId}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default YourComponent;
