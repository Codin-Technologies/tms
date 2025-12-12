import { db } from "@/app/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function getTyreStockOverview() {
  const date = new Date();
  try {
    const overview = await db.execute(sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'assigned') AS inUse,
        COUNT(*) FILTER (WHERE status = 'instock') AS inStore,
        COUNT(*) FILTER (WHERE condition = 'worn') AS needsReplacement
      FROM tyres
    `);
    return NextResponse.json(
      {
        timestamp: date,
        message: "Overview data successfully retrieved",
        data: overview.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    NextResponse.json(
      {
        error:
          (error as Error).message || "Failed to fetch tyre stock overview",
      },
      { status: 500 }
    );
  }
}
