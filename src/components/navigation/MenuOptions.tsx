
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type User,
  type AgencySidebarOption,
  type SubAccount,
  type SubAccountSidebarOption,
  type Agency,
  type Permissions,
  Role,
} from "@prisma/client";

import { ChevronsUpDown, Compass, FerrisWheel, LogOut, Menu, MessageSquareQuote, PlaneIcon, PlusCircle, Receipt, SendIcon, User2, UserCircle, X } from "lucide-react";

import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { AspectRatio } from "../ui/aspect-ratio";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { ScrollArea } from "../ui/scroll-area";
import CustomModal from "../common/CustomModal";
import SubAccountDetails from "../forms/SubAccountDetails";

import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal";
import { Separator } from "../ui/separator";
import { icons } from "../ui/icons";
import { SignOutButton, useClerk } from "@clerk/nextjs";


interface MenuOptionsProps {
  id: string;
  defaultOpen?: boolean;
  sideBarLogo: string;
  subAccount: SubAccount[];
  sideBarOptions: AgencySidebarOption[] | SubAccountSidebarOption[];
  details: Agency | SubAccount;
  user: {
    agency: Agency | null;
    permissions: Permissions[];
  } & User;
}

const MenuOptions: React.FC<MenuOptionsProps> = ({
  details,
  id,
  sideBarLogo,
  sideBarOptions,
  subAccount,
  user,
  defaultOpen,
}) => {
    const router = useRouter();
  const [isMounted, setIsMounted] = React.useState<boolean>(false);
  const { setOpen } = useModal();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const agencyId = searchParams.get("agencyId");


  const { signOut } = useClerk();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const isOwnerOrAdmin =
    user.role === Role.AGENCY_ADMIN || user.role === Role.AGENCY_OWNER;


  return (
    <Sheet modal= {false} open = {defaultOpen? true: undefined}  >
      <SheetTrigger
        asChild
  className = "relative left-4 top-4 z-[100] md:hidden flex "
    >
    <Button size="icon" variant = "outline" >
      <Menu aria-label="Open Menu" />
        </Button>
        </SheetTrigger>
        < SheetContent
  showClose = {!defaultOpen
}
side = "left"
className = {
  cn(
          "bg-background/80 backdrop-blur-xl fixed top-0 border-r p-6 overflow-y-auto w-[500px] ",
    {
      "hidden md:inline-block z-0 w-[300px]": defaultOpen,
      "inline-block md:hidden z-[100] w-full": !defaultOpen,
          }
        )}
      >
  <div className="" >
    <AspectRatio ratio={ 16 / 5 }>
      <Image
              src={ sideBarLogo }
alt = "Sidebar logo"
fill
className = "rounded-md object-contain"
  />
  </AspectRatio>

  < Popover >
  <PopoverTrigger asChild >
  <Button
                className="w-full my-4 flex items-center justify-between py-8"
variant = "ghost"
  >
  <div className="flex items-center text-left gap-2" >
    <User2 />
    < div className = "flex flex-col" >
      { details.name }
      < span className = "text-muted-foreground" >
        { details.address }
        </span>
        </div>
        </div>
        < ChevronsUpDown className = "h-4 w-4 text-muted-foreground" />
          </Button>
          </PopoverTrigger>
          <Sheet>
{/* Button to open the bottom sheet */ }
<SheetTrigger asChild >
  <Button className="w-full flex items-center gap-2 bg-violet-600 hover:bg-violet-500 rounded-lg shadow-md" >
    <PlusCircle className="w-4 h-4" />
      Switch Accounts
        </Button>
        </SheetTrigger>

{/* Styled Bottom Sheet */ }
<SheetContent 
              side="bottom"
className = "h-[80vh] rounded-t-2xl shadow-lg p-6 ml-100 w-500 overflow-y-auto scrollbar-hide z-[200]"
  >
  {/* Close Button */ }
  < div className = "flex justify-between items-center mb-4" >
    <h2 className="text-lg font-semibold" > Select an Account </h2>
      < SheetClose asChild >
        <button className="p-2 text-gray-500 dark:hover:text-gray-900" >
          <X className="w-5 h-5" />
            </button>
            </SheetClose>
            </div>

{/* Search Input */ }
<Command>
  <CommandInput placeholder="Search Accounts..." className = "w-full rounded-lg border p-2" />
    <ScrollArea className="rounded-md mt-4" >
      <CommandList className="pb-16 space-y-2" >
        <CommandEmpty>No results found.</CommandEmpty>

{/* Agency Section */ }
{
  isOwnerOrAdmin && user.agency && (
    <CommandGroup heading="Agency" >
      <CommandItem className="bg-transparent my-2 border border-gray-200 p-3 rounded-lg dark:hover:bg-gray-900 transition" >
        <SheetClose asChild >
        <Link href={ `/company/${user.agency.id}` } className = "flex gap-4 w-full" >
          <div className="relative w-10 h-10" >
            <Image
                                  src={ user.agency.agencyLogo }
  alt = "Agency Logo"
  fill
  className = "rounded-md object-contain"
    />
    </div>
    < div className = "flex flex-col flex-1" >
      <span className="font-medium" > { user.agency.name } </span>
        < span className = "text-gray-500 text-sm" > { user.agency.address } </span>
          </div>
          </Link>
          </SheetClose>
          </CommandItem>
          </CommandGroup>
                    )
}

{/* Sub Accounts Section */ }
<CommandGroup heading="Accounts" >
  {!!subAccount.length ? (
    subAccount.map((sub) => (
      <CommandItem key= { sub.id } className = "border border-gray-200 p-3 rounded-lg dark:hover:bg-gray-900 gap-5 flex  transition" >
      <SheetClose asChild >
      <Link href={`/account/${sub.id}`} className = "flex gap-4 w-full" >
      <div className="relative w-10 h-10" >
    <Image
                                    src={sub.subAccountLogo}
                                    alt = "Subaccount Logo"
                                    fill
                                    className = "rounded-md object-contain"
      />
      </div>
      < div className = "flex flex-col flex-1" >
      <span className="font-medium" > { sub.name } </span>
    < span className = "text-gray-500 text-sm" > { sub.address } </span>
    </div>
    </Link>
    </SheetClose>
    </CommandItem>
    ))
                      ) : (
  <div className= "text-gray-500 text-sm text-center w-full mt-2" >
  No accounts found.
                        </div>
                      )}
</CommandGroup>
  </CommandList>
  </ScrollArea>

{/* Create Account Button */ }
{
  isOwnerOrAdmin && (
    <SheetClose asChild >
    <Button
                      onClick={
    () =>
      setOpen(
        <CustomModal
                            title="Create Account"
                            subTitle = "You can switch between your company account and the account from the sidebar"
        >
        <SubAccountDetails
                              agencyDetails={ user.agency! }
                              userId = { user.id }
                              userName = { user.name }
        />
        </CustomModal>
      )
  }
  className = "w-full flex items-center gap-2 mt-6 bg-violet-600 hover:bg-violet-500 text-white font-medium py-2 rounded-lg transition"
    >
    <PlusCircle className="w-5 h-5" />
      Create Account
        </Button>
        </SheetClose>
                )
}
</Command>
  </SheetContent>
  </Sheet>

  </Popover>
  < p className = "text-muted-foreground text-xs mb-2" > </p>
    < Separator className = "mb-4" />
      <nav className="relative" >
        <Command className="bg-transparent" >
          <CommandInput
                placeholder="Search..."
wrapperClassName = "bg-muted border-none rounded-md"
  />
  <CommandList>
  <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup>
{
  sideBarOptions.map((option) => {
    let value;
    const Result = icons.find(
      (icon) => icon.value === option.icon
    );

    if (Result) {
      value = <Result.path />;
    }
    return (
      <CommandItem
                        key= { option.id }
    className = {
      cn("w-full transition-all aria-selected:bg-inherit", {
        "bg-primary text-white font-bold":
        pathname === option.link,
                        })
}
                      >
  <Link
                          href={ option.link }
className = "flex items-center gap-2 rounded-md w-full"
  >
  { value }
  < span > { option.name } </span>
  </Link>

  </CommandItem>
                    );
                  })}
</CommandGroup>
  </CommandList>
  </Command>
  </nav>
  < Separator />
  {/* Logout Button at Bottom */ }
  < div className = "mt-auto pt-4" >
    <Separator className="mb-4 border-gray-300 dark:border-gray-600" />
      <Button
                         variant="ghost"
                         //@ts-ignore
onClick = {() => signOut({ redirectUrl: '/' })}
className = "w-full flex items-center justify-start gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 py-3"
  >
  <LogOut />
  < span > Logout </span>
  </Button>
{
  !window.location.pathname.includes("account") && (<><Button onClick={
    () => {
      const pathname = window.location.pathname;
      const pathSegments = pathname.split("/");
      const agencyIndex = pathSegments.indexOf("company");

      if (agencyIndex !== -1 && pathSegments.length > agencyIndex + 1) {
        const agencyId = pathSegments[agencyIndex + 1];
        router.push(`/company/${agencyId}/feedback`);
      }
    }
  }
  variant = "ghost"
  className = "w-full flex items-center justify-start gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 py-3"
    >
    <MessageSquareQuote />
    < span > Feedback </span>
    </Button>
    
  </> )} 
  {
  !window.location.pathname.includes("account") && (<><Button onClick={
    () => {
      const pathname = window.location.pathname;
      const pathSegments = pathname.split("/");
      const agencyIndex = pathSegments.indexOf("company");

      if (agencyIndex !== -1 && pathSegments.length > agencyIndex + 1) {
        const agencyId = pathSegments[agencyIndex + 1];
        router.push(`/company/${agencyId}/email-marketing`);
      }
    }
  }
  variant = "ghost"
  className = "w-full flex items-center justify-start gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 py-3"
    >
    <SendIcon/>
    < span > Email-marketing </span>
    </Button>
    
  </> )} 
  {
  !window.location.pathname.includes("account") && (<><Button onClick={
    () => {
      const pathname = window.location.pathname;
      const pathSegments = pathname.split("/");
      const agencyIndex = pathSegments.indexOf("company");

      if (agencyIndex !== -1 && pathSegments.length > agencyIndex + 1) {
        const agencyId = pathSegments[agencyIndex + 1];
        router.push(`/company/${agencyId}/Event`);
      }
    }
  }
  variant = "ghost"
  className = "w-full flex items-center justify-start gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 py-3"
    >
    <FerrisWheel/>
    < span > Organize Events </span>
    </Button>
    
  </> )} 

  {
  !window.location.pathname.includes("account") && (<><Button onClick={
    () => {
      const pathname = window.location.pathname;
      const pathSegments = pathname.split("/");
      const agencyIndex = pathSegments.indexOf("company");

      if (agencyIndex !== -1 && pathSegments.length > agencyIndex + 1) {
        const agencyId = pathSegments[agencyIndex + 1];
        router.push(`/company/${agencyId}/invoices`);
      }
    }
  }
  variant = "ghost"
  className = "w-full flex items-center justify-start gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 py-3"
    >
    <Receipt/>
    < span > Generate Invoices</span>
    </Button>
    
  </> )}
<div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r bottom-3 from-pink-400 to-purple-600 rounded-2xl shadow-lg text-white mx-auto" >
  <h2 className="text-lg font-semibold text-center" >
    Upgrade to < span className = "font-bold" > PRO </span> to get access to all Features!
      </h2>
      < button className = "mt-4 px-6 py-3 bg-white text-purple-700 font-semibold rounded-full shadow-md hover:bg-gray-100 transition duration-300" >
        Get Pro Now!
          </button>
          </div>

          </div>

          </div>
          </SheetContent>
          </Sheet>
  );
};

export default MenuOptions;