"use client";
import Link from "next/link";
import { LockIcon } from "lucide-react";
import { UserProfileButton } from "./UserProfileButton";

export default function TopBar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <LockIcon className="h-6 w-6 text-black" />
          <span className="font-bold text-xl text-black">MePassword</span>
        </Link>
        <div className="flex-1 flex justify-end">
        <UserProfileButton />
        </div>
      </div>
    </div>
  );
}
