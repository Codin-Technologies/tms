import { db } from "@/app/db";
import { tyres } from "@/app/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function postTyre(request: NextRequest) {
  const date = new Date();
  try {
    const tyre = await request.json();
        const addedTyre = await db
        .insert(tyres)
        .values(tyre)
        .returning()
        .onConflictDoNothing();

    return NextResponse.json(
      {
        timestamp: date,
        message: "Tyre Created Successfully",
        data: addedTyre,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: date,
        message: "Error Creating Tyre",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
