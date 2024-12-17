"use server"
import { NextRequest, NextResponse } from "next/server";
import  Database  from "../../../services/database";
import { EncryptedPassword } from "../../../types";
import { validateAuthToken } from "../../../middleware/auth";

export async function GET(request: NextRequest) {

  try {
    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate authentication
    const authResult = await validateAuthToken(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Read passwords
    const passwords = await Database.keyService.readKeys(userId);

    return NextResponse.json({ passwords });
  } catch (error) {
    console.error('[GET] Error occurred:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch passwords",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  
  try {
    // Check for userId in both URL params and headers
    const url = new URL(request.url);
    
    let userId = url.searchParams.get('userId');
    if (!userId) {
      userId = request.headers.get('x-user-id');
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate authentication with userId
    const authResult = await validateAuthToken(request, userId);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const rawBody = await request.text();
    
    let body: EncryptedPassword;
    try {
      body = JSON.parse(rawBody);
    } catch  {
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }

    if (!body.id || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const passwordEntry: EncryptedPassword = {
      ...body,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: 1,
    };

    await Database.keyService.writeKeys(userId, passwordEntry);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST] Error occurred:', error);
    return NextResponse.json(
      { error: "Failed to save password" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate authentication
    const authResult = await validateAuthToken(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body: EncryptedPassword = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Missing password ID" },
        { status: 400 }
      );
    }

    const passwords = await Database.keyService.readKeys(userId);
    const passwordIndex = passwords.findIndex((p) => p.id === body.id);

    if (passwordIndex === -1) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    // Update metadata
    const updatedPassword: EncryptedPassword = {
      ...passwords[passwordIndex],
      ...body,
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: (passwords[passwordIndex].version || 0) + 1,
    };

    passwords[passwordIndex] = updatedPassword;
    await Database.keyService.writeKeys(userId, passwords[passwordIndex]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUT] Error occurred:', error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  
  try {
    // Check for userId in both URL params and headers
    const url = new URL(request.url);
    
    let userId = url.searchParams.get('userId');
    if (!userId) {
      userId = request.headers.get('x-user-id');
    }

    const passwordId = url.searchParams.get('id');
    
    if (!userId || !passwordId) {
      return NextResponse.json(
        { error: "Both User ID and Password ID are required" },
        { status: 400 }
      );
    }

    // Validate authentication with userId
    const authResult = await validateAuthToken(request, userId);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Get all passwords for the user
    const passwords = await Database.keyService.readKeys(userId);

    // Find the specific password
    const passwordToDelete = passwords.find(p => p.id === passwordId);
    if (!passwordToDelete) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    // Delete the password
    await Database.keyService.deleteKey(userId, passwordId);

    return NextResponse.json({ 
      success: true,
      message: "Password successfully deleted"
    });
  } catch (error) {
    console.error('[DELETE] Error occurred:', error);
    return NextResponse.json(
      { 
        error: "Failed to delete password",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}