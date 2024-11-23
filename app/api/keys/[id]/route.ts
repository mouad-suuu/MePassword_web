import { NextRequest, NextResponse } from "next/server";
import { readStorage, writeStorage } from "../../../../utils/storage";
import { EncryptedPassword } from "../../../../types";
import { validateAuthToken } from "../../../../middleware/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Validate authentication
  try {
    const authResult = await validateAuthToken(request);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to validate authentication" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const id = (await params).id;

    const storage = await readStorage();
    const passwordIndex = storage.keys.findIndex((p) => p.id === id);

    if (passwordIndex === -1) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    // Update metadata
    const updatedPassword: EncryptedPassword = {
      ...storage.keys[passwordIndex],
      password: body.password,
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: (storage.keys[passwordIndex].version || 0) + 1,
    };

    storage.keys[passwordIndex] = updatedPassword;
    await writeStorage(storage);

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
): Promise<NextResponse> {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    // Await params to access id
    const id = (await params).id;

    if (!id) {
      return NextResponse.json(
        { error: "Missing password ID" },
        { status: 400 }
      );
    }

    const storage = await readStorage();
    const passwordIndex = storage.keys.findIndex((p) => p.id === id);

    if (passwordIndex === -1) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    storage.keys.splice(passwordIndex, 1);
    await writeStorage(storage);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete password" },
      { status: 500 }
    );
  }
}
