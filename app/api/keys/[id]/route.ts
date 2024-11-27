import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../utils/database";
import { EncryptedPassword } from "../../../../types";
import { validateAuthToken } from "../../../../middleware/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const id = (await params).id;

    const passwords = await Database.readKeys();
    const passwordIndex = passwords.findIndex((p) => p.id === id);

    if (passwordIndex === -1) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    // Update metadata
    const updatedPassword: EncryptedPassword = {
      ...passwords[passwordIndex],
      password: body.password,
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: (passwords[passwordIndex].version || 0) + 1,
    };

    passwords[passwordIndex] = updatedPassword;
    await Database.writekeys(passwords[passwordIndex]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const id = (await params).id;

    if (!id) {
      return NextResponse.json({ error: "Missing key ID" }, { status: 400 });
    }

    // Check if the key exists
    const existingKey = await Database.getKeyById(id);
    if (!existingKey) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    // Delete the key
    await Database.deleteKey(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete key:", error);
    return NextResponse.json(
      { error: "Failed to delete key" },
      { status: 500 }
    );
  }
}
