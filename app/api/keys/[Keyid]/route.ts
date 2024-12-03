"use server"
import { NextRequest, NextResponse } from "next/server";
import { EncryptedPassword } from "../../../../types";
import { validateAuthToken } from "../../../../middleware/auth";
import { readKeys, writeKeys } from "../../../../utils/database";

export async function PUT(
  request: NextRequest,
  { params }: { params: { Keyid: string } }
) {
  console.log('[PUT] /api/keys/[Keyid] - Start', { keyId: params.Keyid });

  try {
    const authHeader = request.headers.get("authorization");
    console.log('[PUT] Auth header present:', !!authHeader);

    const isValid = await validateAuthToken(authHeader as any);
    console.log('[PUT] Auth validation result:', isValid);

    if (!isValid) {
      console.log('[PUT] Authentication failed');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log('[PUT] Request body received:', { ...body, key: '[REDACTED]' });

    const passwords = await readKeys(params.Keyid);
    console.log('[PUT] Existing passwords read from database');

    const passwordIndex = passwords.findIndex((p) => p.id === params.Keyid);

    if (passwordIndex === -1) {
      console.log('[PUT] Password not found');
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    console.log('[PUT] Updating password with id:', params.Keyid);
    const updatedPassword: EncryptedPassword = {
      ...passwords[passwordIndex],
      password: body.password,
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: (passwords[passwordIndex].version || 0) + 1,
    };

    passwords[passwordIndex] = updatedPassword;
    await writeKeys(params.Keyid, passwords[passwordIndex]);
    console.log('[PUT] Password successfully updated');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUT] Error occurred:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   // Validate authentication
//   const authResult = await validateAuthToken(request);
//   if ("error" in authResult) {
//     return NextResponse.json(
//       { error: authResult.error },
//       { status: authResult.status }
//     );
//   }

//   try {
//     const id = (await params).id;

//     if (!id) {
//       return NextResponse.json({ error: "Missing key ID" }, { status: 400 });
//     }

//     // Check if the key exists
//     const existingKey = await getKeyById(id);
//     if (!existingKey) {
//       return NextResponse.json({ error: "Key not found" }, { status: 404 });
//     }

//     // Delete the key
//     await deleteKey(id);

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Failed to delete key:", error);
//     return NextResponse.json(
//       { error: "Failed to delete key" },
//       { status: 500 }
//     );
//   }
// }
