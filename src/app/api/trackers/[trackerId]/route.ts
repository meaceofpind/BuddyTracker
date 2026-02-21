import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackerSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ trackerId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { trackerId } = await params;
    const tracker = await prisma.trackerList.findUnique({
      where: { id: parseInt(trackerId) },
      include: { options: true, pet: true },
    });

    if (!tracker) {
      return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
    }

    return NextResponse.json(tracker);
  } catch (error) {
    console.error("Failed to fetch tracker:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracker" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { trackerId } = await params;
    const id = parseInt(trackerId);
    const body = await request.json();
    const validated = trackerSchema.partial().parse(body);

    // Update tracker name if provided
    if (validated.name) {
      await prisma.trackerList.update({
        where: { id },
        data: { name: validated.name },
      });
    }

    // Replace options if provided
    if (validated.options) {
      await prisma.formOption.deleteMany({ where: { trackerId: id } });
      await prisma.formOption.createMany({
        data: validated.options.map((opt) => ({
          fieldName: opt.fieldName,
          fieldType: opt.fieldType,
          trackerId: id,
        })),
      });
    }

    const tracker = await prisma.trackerList.findUnique({
      where: { id },
      include: { options: true },
    });

    return NextResponse.json(tracker);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Failed to update tracker:", error);
    return NextResponse.json(
      { error: "Failed to update tracker" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { trackerId } = await params;
    await prisma.trackerList.delete({
      where: { id: parseInt(trackerId) },
    });

    return NextResponse.json({ message: "Tracker deleted successfully" });
  } catch (error) {
    console.error("Failed to delete tracker:", error);
    return NextResponse.json(
      { error: "Failed to delete tracker" },
      { status: 500 }
    );
  }
}
