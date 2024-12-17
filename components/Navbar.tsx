import { UserButton } from "@clerk/nextjs";
import { Logo } from "./Logo";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full h-14 px-4 border-b shadow-sm bg-white flex items-center">
      <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
        <Logo />
        <div className="flex items-center gap-x-4">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-[32px] w-[32px]"
              }
            }}
          />
        </div>
      </div>
    </nav>
  );
}
