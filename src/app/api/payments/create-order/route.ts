import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workshopId, seatsBooked } = await request.json();

    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          select: { seatsBooked: true },
        },
      },
    });

    if (!workshop) {
      return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
    }

    if (new Date(workshop.dateTime) < new Date()) {
      return NextResponse.json({ error: "Workshop has already ended" }, { status: 400 });
    }

    const bookedSeats = workshop.bookings.reduce((sum, b) => sum + b.seatsBooked, 0);
    const seatsLeft = workshop.maxSeats - bookedSeats;

    if (seatsBooked > seatsLeft) {
      return NextResponse.json({ error: `Only ${seatsLeft} seats available` }, { status: 400 });
    }

    const PLATFORM_FEE_PER_SEAT = 10;
    const workshopAmount = workshop.price * seatsBooked;
    const platformFee = workshop.price > 0 ? PLATFORM_FEE_PER_SEAT * seatsBooked : 0;
    const totalAmount = workshopAmount + platformFee;

    if (totalAmount === 0) {
      return NextResponse.json({ error: "No payment needed for free workshops" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // Razorpay expects paise
      currency: "INR",
      receipt: `bkng_${Date.now()}`,
      notes: {
        workshopId,
        userId: session.user.id,
        seatsBooked: String(seatsBooked),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: unknown) {
    console.error("Razorpay order error:", JSON.stringify(err, Object.getOwnPropertyNames(err as object)));
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "object" && err !== null) {
      message = JSON.stringify(err);
    } else {
      message = String(err);
    }
    return NextResponse.json({ error: "Failed to create order", details: message }, { status: 500 });
  }
}
