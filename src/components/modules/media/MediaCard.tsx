"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Copy, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { type Media } from "@prisma/client";

import { deleteMedia } from "@/queries/images";
import { saveActivityLogsNotification } from "@/queries/noti";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

import { useModal } from "@/hooks/use-modal";

interface MediaCardProps {
  file: Media;
}

const MediaCard: React.FC<MediaCardProps> = ({ file }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { setClose } = useModal();

  const handleDelete = async () => {
    setIsLoading(true);

    const response = await deleteMedia(file.id);

    await saveActivityLogsNotification({
      agencyId: undefined,
      description: `Deleted a media file | ${response?.name}`,
      subAccountId: response.subAccountId,
    });

    toast.success("Deleted File", {
      description: "Successfully deleted the file",
    });

    setIsLoading(false);
    setClose();
    router.refresh();
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <article className="border shadow-sm w-full rounded-xl bg-white dark:bg-zinc-900 overflow-hidden transition-transform hover:scale-[1.01] duration-150 ease-in-out">
          <div className="relative w-full h-44 bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={file.link}
              alt="preview"
              fill
              className="object-cover"
            />
          </div>

          <div className="px-4 pt-3 pb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Uploaded: {format(new Date(file.createdAt), "PPP p")}
            </p>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">
              {file.name}
            </p>
          </div>

          <div className="absolute top-2 right-2">
            <DropdownMenuTrigger className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 transition">
              <MoreHorizontal size={18} />
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent side="bottom" align="end" className="w-48">
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(file.link);
                toast.success("Copied to clipboard");
              }}
              className="flex items-center gap-2 text-sm"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex items-center gap-2 text-red-600 dark:text-red-500">
                <Trash className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </article>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Confirm Deletion
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action is irreversible. Deleting this file will remove access from
            all associated subaccounts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MediaCard;
