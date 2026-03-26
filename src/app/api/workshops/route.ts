import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { workshopSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Only organizers can create workshops" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = workshopSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const organizer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { studioName: true, studioAddress: true, city: true, mapUrl: true },
    });

    const { imageUrl, ...rest } = parsed.data;

    const workshop = await prisma.workshop.create({
      data: {
        ...rest,
        imageUrl: imageUrl || null,
        studioName: organizer?.studioName || "",
        studioAddress: organizer?.studioAddress || "",
        city: organizer?.city || "",
        mapUrl: organizer?.mapUrl || null,
        dateTime: new Date(rest.dateTime),
        organizerId: session.user.id,
      },
    });

    return NextResponse.json(workshop, { status: 201 });
  } catch (err) {
    console.error("Workshop create error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
