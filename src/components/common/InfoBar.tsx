"use client";

import React from "react";
import { Role } from "@prisma/client";
import { UserButton } from "@clerk/nextjs";
import { Bell, Feather, FileText, X } from "lucide-react";
import { format } from "date-fns";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Noti from "./Noti";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ModeToggle } from "./ModeToggle";

import { cn } from "@/lib/utils";
import { type NotificationsWithUser } from "@/lib/types";
import { useRouter } from "next/navigation";

interface InfoBarProps {
  notifications: NotificationsWithUser;
  subAccountId: string;
  role?: Role;
  className?: string;
}

const InfoBar: React.FC<InfoBarProps> = ({
  notifications,
  subAccountId,
  className,
  role,
}) => {
  const [allNotifications, setAllNotifications] = React.useState<NotificationsWithUser>(notifications);
  const [isShowAll, setIsShowAll] = React.useState<boolean>(true);
  const [animatedListRef] = useAutoAnimate();
  const [dateFilter, setDateFilter] = React.useState<string>("");
  const [fadingNotifications, setFadingNotifications] = React.useState<string[]>([]);

  const handleSwitch = () => {
    if (!isShowAll) {
      setAllNotifications(notifications);
    } else {
      if (!!notifications?.length) {
        const filteredNotifications = notifications?.filter(
          (notif) => notif.subAccountId === subAccountId
        );
        setAllNotifications(filteredNotifications ?? []);
      }
    }
    setIsShowAll((prev) => !prev);
  };

  const handleDismiss = (id: string) => {
    setFadingNotifications((prev) => [...prev, id]);
    // setTimeout(() => {
    //   setAllNotifications((prev) => prev.filter((notif) => notif.id !== id));
    //   setFadingNotifications((prev) => prev.filter((notifId) => notifId !== id));
    // }, 500);
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  const filteredNotifications = allNotifications?.filter((notification) => {
    if (!dateFilter) return true;
    const notificationDate = format(new Date(notification.createdAt), "yyyy-MM-dd");
    return notificationDate === dateFilter;
  });
const router = useRouter() ; 
  return (
    <>
    <div className= { cn("fixed z-[20] md:left-[300px] left-0 right-0 top-0 p-4 bg-background/1000 backdrop-blur-md flex gap-4 items-center border-b-[1px]", className) } >
    <UserButton afterSignOutUrl="/" />
    <div className="flex items-center gap-2 ml-auto" >
      
        <Sheet>
        <Button size="icon" className = "rounded-full w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-80 transition" onClick={()=>router.push("/Extra")}>
        <FileText aria-label="Notifications" className = "w-4 h-4 text-white" />
          </Button>
        <SheetTrigger asChild >
      
        <Button size="icon" className = "rounded-full w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-80 transition" >
          <Bell aria-label="Notifications" className = "w-4 h-4 text-white" />
            </Button>
            </SheetTrigger>

            < SheetContent className = { cn("pr-4 flex flex-col border-l border-gray-200 dark:border-gray-700", "bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200", "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900") } showClose >
              <SheetHeader className="text-left" >
                <SheetTitle className="text-indigo-700 dark:text-indigo-300 font-semibold text-lg" >
                  Notifications
                  </SheetTitle>
                  <SheetDescription>
  {
    (role === Role.AGENCY_ADMIN || role === Role.AGENCY_OWNER) && (
      <Card className="flex items-center justify-between p-4 bg-indigo-100 dark:bg-gray-800 border-none rounded-md" >
        Current Account
          < Switch onCheckedChange = { handleSwitch } />
            </Card>
                  )}
<input type="date" value = { dateFilter } onChange = { handleDateFilterChange } className = "mt-2 p-2 border rounded" />
  </SheetDescription>
  </SheetHeader>

{
  !!filteredNotifications?.length && (
    <div ref={ animatedListRef } className = "flex flex-col gap-4 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-gray-700 scrollbar-thumb-rounded-full" >
      { filteredNotifications?.map((notification) => (
        <Card key= { notification.id } className = { cn("bg-white dark:bg-gray-800 border-none shadow-md rounded-lg transition", fadingNotifications.includes(notification.id) ? "opacity-50" : "opacity-100") } >
          <CardContent className="flex gap-4 p-4 items-center relative" >
            <Avatar className="border border-gray-300 dark:border-gray-700 shadow-sm" >
              <AvatarImage src={ notification.user.avatarUrl } alt = "Profile Picture" />
                <AvatarFallback className="bg-primary text-white" >
                  { notification.user.name.slice(0, 2).toUpperCase() }
                  </AvatarFallback>
                  </Avatar>
                  < div className = "flex flex-col gap-2" >
                    <p className="leading-tight text-sm" >
                      <span className="font-semibold text-indigo-700 dark:text-indigo-300" >
                        { notification.notification.split("|")[0] }
                        </span>{" "}
                        < span className = "text-gray-500 dark:text-gray-400" >
                          { notification.notification.split("|")[1] }
                          </span>{" "}
                          < span className = "font-semibold text-indigo-700 dark:text-indigo-300" >
                            { notification.notification.split("|")[2] }
                            </span>
                            </p>
                            < small className = "text-xs text-gray-400 dark:text-gray-500" >
                              { format(new Date(notification.createdAt), "dd.MM.yyyy hh:mm a")
}
</small>
  </div>
  < Button onClick = {() => handleDismiss(notification.id)} size = "icon" variant = "ghost" className = "absolute top-2 right-2" >
    <X className="w-4 h-4" />
      </Button>
      </CardContent>
      </Card>
                  ))}
</div>
              )}
{
  !filteredNotifications?.length && (
    <div className="flex items-center justify-center mb-4 text-sm text-muted-foreground" >
      You have no notifications.
                </div>
              )
}
</SheetContent>
  </Sheet>
  < ModeToggle />
  </div>
  </div>
  </>
  );
};

export default InfoBar;
