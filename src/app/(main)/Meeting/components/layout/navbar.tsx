import Image from "next/image";
import Link from "next/link";
import React from "react";
import MobileNav from "./mobile-nav";
import { SignedIn, UserButton } from "@clerk/nextjs";

type Props = {};

const Navbar = (props: Props) => {
  return (
    <nav className="flex-between fixed z-50 w-full bg-dark-1 px-6 py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-1">
        
        <p className="text-[26px] font-extrabold dark:text-white max-sm:hidden">Workeloo</p>
      </Link>

      <div className="flex flex-row gap-5">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
