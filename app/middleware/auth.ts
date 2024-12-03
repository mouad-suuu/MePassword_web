"use client";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  // Optional: Add custom middleware logic here
  // For example, protecting specific routes
  
  if ( !(await auth()).userId) {
    return NextResponse.redirect(new URL("/(auth)/sign-in", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
