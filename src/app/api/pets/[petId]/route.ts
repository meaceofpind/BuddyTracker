import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { petSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ petId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { petId } = await params;
    const pet = await prisma.pet.findUnique({
      where: { petId },
      include: {
        trackers: {
          include: { options: true },
        },
      },
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    return NextResponse.json(pet);
  } catch (error) {
    console.error("Failed to fetch pet:", error);
    return NextResponse.json(
      { error: "Failed to fetch pet" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { petId } = await params;
    const body = await request.json();
    const validated = petSchema.partial().parse(body);

    const pet = await prisma.pet.update({
      where: { petId },
      data: validated,
    });

    return NextResponse.json(pet);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Failed to update pet:", error);
    return NextResponse.json(
      { error: "Failed to update pet" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { petId } = await params;
    await prisma.pet.delete({
      where: { petId },
    });

    return NextResponse.json({ message: "Pet deleted successfully" });
  } catch (error) {
    console.error("Failed to delete pet:", error);
    return NextResponse.json(
      { error: "Failed to delete pet" },
      { status: 500 }
    );
  }
}
