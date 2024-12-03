"use client";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { LockIcon } from "lucide-react";

export default function TopBar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <LockIcon className="h-6 w-6 text-black" />
          <span className="font-bold text-xl text-black">MePassword</span>
        </Link>
        <div className="flex-1 flex justify-end">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </div>
  );
}
