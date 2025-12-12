import { db } from "@/app/db";
import { tyres } from "@/app/db/schema";
import { NextResponse } from "next/server";

export async function getTyres() {
  const date = new Date();
  try {
    const allTyres = await db.select().from(tyres);
    if (allTyres.length === 0) {
      return NextResponse.json(
        { timestamp: date, message: "No Tyres Found" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        timestamp: date,
        message: "Tyres Fetched Successfully",
        data: allTyres,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: date,
        message: "Error Fetching Tyres",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
