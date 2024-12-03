"use server"
import { NextRequest, NextResponse } from "next/server";
import { readPasswords, writePassword } from "../../../utils/database";
import { EncryptedPassword } from "../../../types";
import { validateAuthToken } from "../../../middleware/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('[GET] /api/passwords - Start');

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

  try {
    const user_id = (await params).id
    console.log('[GET] User ID:', user_id);

    const passwords = await readPasswords(user_id);
    console.log('[GET] Successfully retrieved passwords, count:', passwords.length);

    return NextResponse.json({ passwords });
  } catch {
    console.error('[GET] Error occurred:');
    return NextResponse.json(
      { error: "Failed to fetch passwords" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('[POST] /api/passwords - Start');

  // Validate authentication
  const authResult = await validateAuthToken(request);
  console.log('[POST] Auth validation result:', authResult);

  if ("error" in authResult) {
    console.log('[POST] Authentication failed');
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const user_id = (await params).id
    console.log('[POST] User ID:', user_id);

    const body: EncryptedPassword = await request.json();
    console.log('[POST] Request body received:', { ...body, password: '[REDACTED]' });

    if (!body.id || !body) {
      console.log('[POST] Missing required fields');
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

    await writePassword(user_id, passwordEntry);
    console.log('[POST] Successfully added new password');

    return NextResponse.json({ success: true });
  } catch {
    console.error('[POST] Error occurred:');
    return NextResponse.json(
      { error: "Failed to save password" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user_id = (await params).id
  console.log('[PUT] User ID:', user_id);

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

  try {
    const body: EncryptedPassword = await request.json();

    if (!body.id) {
      console.log('[PUT] Missing password ID');
      return NextResponse.json(
        { error: "Missing password ID" },
        { status: 400 }
      );
    }

    const passwords = await readPasswords(user_id);
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
    await writePassword(user_id, passwords[passwordIndex]);
    console.log('[PUT] Successfully updated password');

    return NextResponse.json({ success: true });
  } catch {
    console.error('[PUT] Error occurred:');
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  console.log('[DELETE] Auth validation result:', authResult);

  if ("error" in authResult) {
    console.log('[DELETE] Authentication failed');
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const user_id = (await params).id
    console.log('[DELETE] User ID:', user_id);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      console.log('[DELETE] Missing password ID');
      return NextResponse.json(
        { error: "Missing password ID" },
        { status: 400 }
      );
    }

    const passwords = await readPasswords(user_id);
    const passwordIndex = passwords.findIndex((p) => p.id === id);

    if (passwordIndex === -1) {
      console.log('[DELETE] Password not found');
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    await writePassword(user_id, passwords[passwordIndex]);
    console.log('[DELETE] Successfully deleted password');

    return NextResponse.json({ success: true });
  } catch {
    console.error('[DELETE] Error occurred:');
    return NextResponse.json(
      { error: "Failed to delete password" },
      { status: 500 }
    );
  }
}
