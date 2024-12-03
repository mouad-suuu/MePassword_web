// import { auth } from "@clerk/nextjs";
// import { NextResponse } from "next/server";


// export async function DELETE(
//   req: Request,
//   { params }: { params: { deviceId: string } }
// ) {
//   try {
//     const { userId } = auth();
    
//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     if (!params.deviceId) {
//       return new NextResponse("Device ID required", { status: 400 });
//     }

//     // First verify the device belongs to the user
//     const device = await prisma.device.findUnique({
//       where: {
//         id: params.deviceId,
//         userId: userId
//       }
//     });

//     if (!device) {
//       return new NextResponse("Device not found", { status: 404 });
//     }

//     // Delete the device
//     await prisma.device.delete({
//       where: {
//         id: params.deviceId
//       }
//     });

//     return new NextResponse(null, { status: 204 });
//   } catch (error) {
//     console.error("[DEVICE_DELETE]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }
