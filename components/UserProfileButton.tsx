"use client"
import { UserButton, useUser } from "@clerk/nextjs";
import { getAvatarUrl } from "../lib/utils/avatar";
import Image from "next/image";

export function UserProfileButton() {
  const { user } = useUser();
  
  if (!user) return null;

  const customAvatarUrl = getAvatarUrl(`${user.firstName || ''} ${user.lastName || ''}`, user.emailAddresses[0]?.emailAddress);

  return (
    <div className="h-8 w-8 relative">
      {!user.imageUrl && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Image
            src={customAvatarUrl}
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
      )}
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            rootBox: "h-8 w-8",
            userButtonAvatarBox: `h-8 w-8 ${!user.imageUrl ? 'opacity-0' : ''}`,
            userButtonTrigger: "h-8 w-8",
            userButtonPopoverCard: "right-0 top-full",
            userPreviewMainIdentifier: "font-normal",
            userPreviewSecondaryIdentifier: "font-normal",
            avatarImage: "!h-8 !w-8 !rounded-full",
            avatarBox: "!h-8 !w-8"
          }
        }}
      />
    </div>
  );
}
