import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import Database from "../../../services/database";
import { headers } from "next/headers";


const webhookSecret = process.env.WEBHOOK_SECRET;

export async function POST(req: NextRequest) {

  try {
    // Ensure database is initialized with latest schema
    await Database.userService.ensureDatabaseInitialized();

    const headerPayload = await headers(); // Added await here
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");


    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("❌ Missing required Svix headers");
      return new NextResponse("Error occured -- no svix headers", {
        status: 400
      });
    }

    if (!webhookSecret) {
      console.error("❌ Missing Webhook Secret");
      return new NextResponse("Error occured -- no webhook secret", {
        status: 400
      });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("❌ Error verifying webhook:", err);
      return new NextResponse("Error occured", {
        status: 400
      });
    }

    // Type guard for user events
    if (!("email_addresses" in evt.data)) {
      return new NextResponse("Success", { status: 200 });
    }

    const eventType = evt.type;
    const userData = evt.data as {
      id: string;
      email_addresses: { email_address: string }[];
      first_name?: string;
      last_name?: string;
      username?: string;
      image_url?: string;
    };


    if (eventType === "user.created" || eventType === "user.updated") {
      const email = userData.email_addresses?.[0]?.email_address;
      if (!email) {
        console.error("❌ No email found in webhook payload");
        return new NextResponse("No email found in webhook payload", {
          status: 400
        });
      }

      await Database.userService.createUser(
        userData.id,
        email,
        true,
        userData.first_name ?? "",
        userData.last_name ?? "",
        userData.username ?? "",
        userData.image_url ?? ""
      );

      return new NextResponse("Success", { status: 200 });
    }

    if (eventType === "user.deleted") {
      await Database.userService.deleteUser(userData.id);
      return new NextResponse("Success", { status: 200 });
    }

    return new NextResponse("Unhandled webhook event type", { status: 400 });

  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return new NextResponse("Error occured", {
      status: 400
    });
  }
}