"use server"
import { NextRequest, NextResponse } from "next/server";

import { searchUsersByEmail } from "../../../../utils/database";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    const email = searchParams.get("email");
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const users = await searchUsersByEmail(email);
    
    // Don't return the current user in search results
    const filteredUsers = users.filter(user => user.id !== userId);

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error("[GET /api/users/search] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
