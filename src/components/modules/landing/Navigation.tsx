 

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { UserButton, currentUser } from "@clerk/nextjs";
import { ModeToggle } from "@/components/common/ModeToggle";

import logoImage from "../../../../public/assets/plura-logo.svg";
import { Button } from "@/components/ui/button";
import { Code2Icon, Feather, FileText } from "lucide-react";
import { redirect, useRouter } from "next/navigation";

const Navigation = async () => {
  const user = await currentUser();
  

  return (
    <>
      {/* Top Navbar with Logo */}
      <header className="sticky top-0 left-0 right-0 z-20  shadow-md backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src={require("../../../../public/assets/fire.png")} width={60} height={60} alt="Workeloo Logo" />
            
          </Link> 
          <div className="flex gap-2"> 
        
          <Link className = "rounded-full w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-80 transition justify-center align-middle m-auto" href="/Extra">
                  <FileText aria-label="Notifications" className = "w-8 h-8 text-white" />
                    </Link>
                    
                    
        {user && <UserButton afterSignOutUrl="/" />}
        <ModeToggle /> 
        </div> 
        </div>
      </header>

      {/* Sticky Floating Chips on Right */}
      <aside className="fixed right-0 top-1/2 transform -translate-y-1/2 flex flex-col gap-10 z-30">
      <Link
          href="/company"
          className="px-4 py-2 z-[100] bg-[#6B46C1] text-white text-sm font-medium rounded-sm shadow-md hover:bg-teal-700 transition-all"
        >
          Dashboard
        </Link> 
        <Link
          href="/About"
          className="px-4 py-2 z-[100] bg-[#6B46C1] text-white text-sm font-medium rounded-sm shadow-md hover:bg-teal-700 transition-all"
        >
          About
        </Link>
        
        <Link
          href="/Features"
          className="px-4 py-2 z-[100] bg-[#6B46C1] text-white text-sm font-medium rounded-sm shadow-md hover:bg-teal-700 transition-all"
        >
          Features
        </Link> 
        <Link
          href="/leads"
          className="px-4 py-2 z-[100] bg-[#6B46C1] text-white text-sm font-medium rounded-sm shadow-md hover:bg-teal-700 transition-all"
        >
          Submit Info
        </Link> 
        <Link
          href="/Services"
          className="px-4 py-2 z-[100] bg-[#6B46C1] text-white text-sm font-medium rounded-sm shadow-md hover:bg-teal-700 transition-all"
        >
          Services 
        </Link> 
        <Link
          href="/Meeting"
          className="px-4 py-2 z-[100] bg-[#6B46C1] text-white text-sm font-medium rounded-sm shadow-md hover:bg-teal-700 transition-all"
        >
          Meeting
        </Link> 
        
      </aside>
    </>
  );
};

export default Navigation;
