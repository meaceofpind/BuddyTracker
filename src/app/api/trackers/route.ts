import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackerSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    const trackers = await prisma.trackerList.findMany({
      where: petId ? { petId } : undefined,
      include: { options: true },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(trackers);
  } catch (error) {
    console.error("Failed to fetch trackers:", error);
    return NextResponse.json(
      { error: "Failed to fetch trackers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = trackerSchema.parse(body);

    const tracker = await prisma.trackerList.create({
      data: {
        name: validated.name,
        petId: validated.petId,
        options: {
          create: validated.options.map((opt) => ({
            fieldName: opt.fieldName,
            fieldType: opt.fieldType,
          })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json(tracker, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Failed to create tracker:", error);
    return NextResponse.json(
      { error: "Failed to create tracker" },
      { status: 500 }
    );
  }
}
