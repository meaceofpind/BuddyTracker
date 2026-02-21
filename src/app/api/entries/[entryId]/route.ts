import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { entrySchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ entryId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { entryId } = await params;
    const entry = await prisma.trackerEntry.findUnique({
      where: { id: parseInt(entryId) },
      include: {
        data: true,
        images: true,
        tracker: { include: { options: true } },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to fetch entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch entry" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { entryId } = await params;
    const id = parseInt(entryId);
    const body = await request.json();
    const validated = entrySchema.partial().parse(body);

    if (validated.data) {
      await prisma.trackerEntryData.deleteMany({ where: { entryId: id } });
      await prisma.trackerEntryData.createMany({
        data: validated.data.map((d) => ({
          fieldName: d.fieldName,
          fieldType: d.fieldType,
          fieldValue: d.fieldValue,
          entryId: id,
        })),
      });
    }

    const entry = await prisma.trackerEntry.findUnique({
      where: { id },
      include: { data: true, images: true },
    });

    return NextResponse.json(entry);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Failed to update entry:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { entryId } = await params;
    await prisma.trackerEntry.delete({
      where: { id: parseInt(entryId) },
    });

    return NextResponse.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
