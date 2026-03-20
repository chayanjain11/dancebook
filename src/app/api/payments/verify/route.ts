import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      workshopId,
      seatsBooked,
      guests,
    } = await request.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Check workshop availability again
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

    const bookedSeats = workshop.bookings.reduce((sum, b) => sum + b.seatsBooked, 0);
    const seatsLeft = workshop.maxSeats - bookedSeats;

    if (seatsBooked > seatsLeft) {
      return NextResponse.json({ error: `Only ${seatsLeft} seats available` }, { status: 400 });
    }

    const totalAmount = workshop.price * seatsBooked;

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        workshopId,
        seatsBooked,
        totalAmount,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        guests: {
          create: guests.map((g: { name: string; phone: string; whatsapp?: string }) => ({
            name: g.name,
            phone: g.phone,
            whatsapp: g.whatsapp || null,
          })),
        },
      },
      include: { guests: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err: unknown) {
    console.error("Payment verify error:", err);
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "object" && err !== null) {
      message = JSON.stringify(err);
    }
    return NextResponse.json({ error: "Something went wrong", details: message }, { status: 500 });
  }
}
