import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../utils/database";
import { EncryptedPassword } from "../../../types";
import { validateAuthToken } from "../../../middleware/auth";

export async function GET(request: NextRequest) {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const passwords = await Database.readPasswords();
    return NextResponse.json({ passwords });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch passwords" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body: EncryptedPassword = await request.json();

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

    await Database.writePassword(passwordEntry);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save password" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body: EncryptedPassword = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Missing password ID" },
        { status: 400 }
      );
    }

    const passwords = await Database.readPasswords();
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
    await Database.writePassword(passwords[passwordIndex]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing password ID" },
        { status: 400 }
      );
    }

    const passwords = await Database.readPasswords();
    const passwordIndex = passwords.findIndex((p) => p.id === id);

    if (passwordIndex === -1) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    await Database.writePassword(passwords[passwordIndex]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete password" },
      { status: 500 }
    );
  }
}
