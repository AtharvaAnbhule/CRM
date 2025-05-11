import React, { useState } from "react";
import { format } from "date-fns";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const NotificationHandler = ({ notifications }) => {
  const [filteredNotifications, setFilteredNotifications] = useState(notifications);
  const [animatedListRef] = useAutoAnimate();

  const handleSwipe = (id) => {
    setFilteredNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleDateFilter = (date) => {
    const selectedDate = new Date(date);
    const filtered = notifications.filter((notif) => {
      const notifDate = new Date(notif.createdAt);
      return notifDate.toDateString() === selectedDate.toDateString();
    });
    setFilteredNotifications(filtered);
  };

  return (
    <div>
      <input
        type="date"
        onChange={(e) => handleDateFilter(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      <div ref={animatedListRef} className="flex flex-col gap-4">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className="bg-white dark:bg-gray-800 border-none shadow-md rounded-lg transition-transform transform active:translate-x-[-100%]"
            onTouchEnd={() => handleSwipe(notification.id)}
          >
            <CardContent className="flex gap-4 p-4 items-center">
              <Avatar>
                <AvatarImage src={notification.user.avatarUrl} alt="Profile Picture" />
                <AvatarFallback>{notification.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <p className="leading-tight text-sm">{notification.notification}</p>
                <small className="text-xs text-gray-400">{format(new Date(notification.createdAt), "dd.MM.yyyy hh:mm a")}</small>
              </div>
              <Button onClick={() => handleSwipe(notification.id)} className="ml-auto">Dismiss</Button>
            </CardContent>
          </Card>
        ))}
        {!filteredNotifications.length && <p>No notifications available.</p>}
      </div>
    </div>
  );
};

export default NotificationHandler;
