import { db } from "@/app/db";
import { vehicles } from "@/app/db/schema";
import { NextResponse } from "next/server";

export async function getVehicles() {
  const date = new Date();
  try {
    const allVehicles = await db.select().from(vehicles);
    if (allVehicles.length === 0) {
      return NextResponse.json(
        { timestamp: date, message: "No Vehicles Found" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        timestamp: date,
        message: "Vehicles Fetched Successfully",
        data: allVehicles,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: date,
        message: "Error Fetching Vehicles",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
