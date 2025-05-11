type TSidebarLinks = {
  label: string;
  route: string;
  imgUrl: string;
};

export const sidebarLinks: TSidebarLinks[] = [
  {
    label: "Home",
    route: "/Meeting",
    imgUrl: "/icons/Home.svg",
  },

  {
    label: "Upcoming",
    route: "/Meeting/upcoming",
    imgUrl: "/icons/upcoming.svg",
  },
  {
    label: "Previous",
    route: "/Meeting/previous",
    imgUrl: "/icons/previous.svg",
  },
  {
    label: "Recordings",
    route: "/Meeting/recordings",
    imgUrl: "/icons/Video.svg",
  },
  {
    label: "Personal Room",
    route: "/Meeting/personal-room",
    imgUrl: "/icons/add-personal.svg",
  },
];

export const avatarImages: string[] = [
  "/images/avatar-1.jpeg",
  "/images/avatar-2.jpeg",
  "/images/avatar-3.png",
  "/images/avatar-4.png",
  "/images/avatar-5.png",
];
