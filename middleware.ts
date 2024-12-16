import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  // Allow extension requests to bypass Clerk authentication
  if (req.headers.get('x-request-source') === 'extension') {
    return NextResponse.next();
  }

  // For web requests, enforce authentication
  if (!(await auth()).userId) {
    return NextResponse.redirect(new URL("/(auth)/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
