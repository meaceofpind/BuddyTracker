import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { petSchema } from "@/lib/validations";

export async function GET() {
  try {
    const pets = await prisma.pet.findMany({
      orderBy: { lastModified: "desc" },
    });
    return NextResponse.json(pets);
  } catch (error) {
    console.error("Failed to fetch pets:", error);
    return NextResponse.json(
      { error: "Failed to fetch pets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = petSchema.parse(body);

    const pet = await prisma.pet.create({
      data: validated,
    });

    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Failed to create pet:", error);
    return NextResponse.json(
      { error: "Failed to create pet" },
      { status: 500 }
    );
  }
}
