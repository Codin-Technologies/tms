import { db } from "@/app/db";
import { vehicles } from "@/app/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function postVehicle(request: NextRequest) {
  const date = new Date();
  try {
    const vehicle = await request.json();
    const addedVehicle = await db
      .insert(vehicles)
      .values(vehicle)
      .returning()
      .onConflictDoNothing();

    return NextResponse.json(
      {
        timestamp: date,
        message: "Vehicle Created Successfully",
        data: addedVehicle,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: date,
        message: "Error Creating Vehicle",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
