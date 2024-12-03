// import { auth } from "@clerk/nextjs";
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function GET() {
//   try {
//     const { userId } = auth();
    
//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const devices = await prisma.device.findMany({
//       where: {
//         userId: userId
//       },
//       orderBy: {
//         lastActive: 'desc'
//       }
//     });

//     return NextResponse.json(devices);
//   } catch (error) {
//     console.error("[DEVICES_GET]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const { userId } = auth();
//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const body = await req.json();
//     const { browser, os, ip } = body;

//     if (!browser || !os || !ip) {
//       return new NextResponse("Missing required fields", { status: 400 });
//     }

//     const device = await prisma.device.create({
//       data: {
//         userId,
//         browser,
//         os,
//         ip,
//         lastActive: new Date(),
//       }
//     });

//     return NextResponse.json(device);
//   } catch (error) {
//     console.error("[DEVICES_POST]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }
