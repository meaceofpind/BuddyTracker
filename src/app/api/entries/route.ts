import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { entrySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackerId = searchParams.get("trackerId");

    const entries = await prisma.trackerEntry.findMany({
      where: trackerId ? { trackerId: parseInt(trackerId) } : undefined,
      include: {
        data: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = entrySchema.parse(body);

    const entry = await prisma.trackerEntry.create({
      data: {
        trackerId: validated.trackerId,
        petId: validated.petId,
        data: {
          create: validated.data.map((d) => ({
            fieldName: d.fieldName,
            fieldType: d.fieldType,
            fieldValue: d.fieldValue,
          })),
        },
      },
      include: {
        data: true,
        images: true,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Failed to create entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}
