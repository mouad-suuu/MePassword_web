"use server"
import { NextRequest, NextResponse } from "next/server";
import  Database  from "../../../services/database";
import { EncryptedPassword } from "../../../types";
import { validateAuthToken } from "../../../middleware/auth";

export async function GET(request: NextRequest) {
  console.log('[GET] /api/passwords - Start');

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
    console.log('[GET] Auth validation result:', authResult);

    if ("error" in authResult) {
      console.log('[GET] Authentication failed');
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Read passwords
    const passwords = await Database.keyService.readKeys(userId);
    console.log('[GET] Successfully retrieved passwords, count:', passwords.length);

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
  console.log('[POST] /api/passwords - Start');
  console.log('[POST] Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Check for userId in both URL params and headers
    const url = new URL(request.url);
    console.log('[POST] Original URL:', url.toString());
    
    let userId = url.searchParams.get('userId');
    if (!userId) {
      userId = request.headers.get('x-user-id');
      console.log('[POST] UserId not found in URL params, checking headers. Found:', userId);
    }
    
    if (!userId) {
      console.log('[POST] Error: Missing userId in both URL params and headers');
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log('[POST] Using userId:', userId);

    // Validate authentication with userId
    console.log('[POST] Starting auth validation for userId:', userId);
    const authResult = await validateAuthToken(request, userId);
    console.log('[POST] Auth validation result:', authResult);

    if ("error" in authResult) {
      console.log('[POST] Authentication failed:', authResult);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    console.log('[POST] Authentication successful');

    const rawBody = await request.text();
    console.log('[POST] Raw request body:', rawBody);
    
    let body: EncryptedPassword;
    try {
      body = JSON.parse(rawBody);
      console.log('[POST] Parsed request body:', { ...body, password: '[REDACTED]' });
    } catch (parseError) {
      console.log('[POST] Error parsing request body:', parseError);
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }

    if (!body.id || !body) {
      console.log('[POST] Missing required fields in body:', { receivedFields: Object.keys(body) });
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

    console.log('[POST] Attempting to write password entry');
    await Database.keyService.writeKeys(userId, passwordEntry);
    console.log('[POST] Successfully added new password');

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
  console.log('[PUT] /api/passwords - Start');
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log('[PUT] User ID:', userId);

    // Validate authentication
    const authResult = await validateAuthToken(request);
    console.log('[PUT] Auth validation result:', authResult);

    if ("error" in authResult) {
      console.log('[PUT] Authentication failed');
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body: EncryptedPassword = await request.json();

    if (!body.id) {
      console.log('[PUT] Missing password ID');
      return NextResponse.json(
        { error: "Missing password ID" },
        { status: 400 }
      );
    }

    const passwords = await Database.keyService.readKeys(userId);
    const passwordIndex = passwords.findIndex((p) => p.id === body.id);

    if (passwordIndex === -1) {
      console.log('[PUT] Password not found');
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
    console.log('[PUT] Successfully updated password');

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
  console.log('[DELETE] /api/passwords - Start');
  console.log('[DELETE] Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Check for userId in both URL params and headers
    const url = new URL(request.url);
    console.log('[DELETE] Original URL:', url.toString());
    
    let userId = url.searchParams.get('userId');
    if (!userId) {
      userId = request.headers.get('x-user-id');
      console.log('[DELETE] UserId not found in URL params, checking headers. Found:', userId);
    }

    const passwordId = url.searchParams.get('id');
    console.log('[DELETE] Password ID from params:', passwordId);
    
    if (!userId || !passwordId) {
      console.log('[DELETE] Error: Missing required parameters', { userId, passwordId });
      return NextResponse.json(
        { error: "Both User ID and Password ID are required" },
        { status: 400 }
      );
    }

    // Validate authentication with userId
    console.log('[DELETE] Starting auth validation for userId:', userId);
    const authResult = await validateAuthToken(request, userId);
    console.log('[DELETE] Auth validation result:', authResult);

    if ("error" in authResult) {
      console.log('[DELETE] Authentication failed:', authResult);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Get all passwords for the user
    const passwords = await Database.keyService.readKeys(userId);
    console.log('[DELETE] Retrieved passwords count:', passwords.length);

    // Find the specific password
    const passwordToDelete = passwords.find(p => p.id === passwordId);
    if (!passwordToDelete) {
      console.log('[DELETE] Password not found:', passwordId);
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    // Delete the password
    await Database.keyService.deleteKey(userId, passwordId);
    console.log('[DELETE] Successfully deleted password:', passwordId);

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