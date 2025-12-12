// app/api/inspections/overview/route.ts

import { db } from "@/app/db";
import { tireInspections } from "@/app/db/schema";
import { eq, sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/gel-core";
import { NextResponse } from "next/server";

const CURRENT_MONTH = sql`DATE_TRUNC('month', NOW())`;
const LAST_MONTH = sql`DATE_TRUNC('month', NOW() - INTERVAL '1 month')`;

export async function GET() {
  try {
    // Total counts
    const totalCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tireInspections);

    // Current month inspections
    const thisMonth = await db
      .select({
        total: sql<number>`COUNT(*)`,
        passed: sql<number>`SUM(CASE WHEN status='passed' THEN 1 ELSE 0 END)`,
        failed: sql<number>`SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END)`,
      })
      .from(tireInspections)
      .where(sql`tire_inspections.date >= ${CURRENT_MONTH}`);

    // Last month inspections
    const lastMonth = await db
      .select({
        total: sql<number>`COUNT(*)`,
        passed: sql<number>`SUM(CASE WHEN status='passed' THEN 1 ELSE 0 END)`,
        failed: sql<number>`SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END)`,
      })
      .from(tireInspections)
      .where(
        sql`tire_inspections.date >= ${LAST_MONTH} 
         AND tire_inspections.date < ${CURRENT_MONTH}`
      );

    const pending = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tireInspections)
      .where(eq(tireInspections.status, "pending"));
    // Extract values
    const total = Number(totalCount[0].count);

    const thisTotal = Number(thisMonth[0].total);
    const thisPassed = Number(thisMonth[0].passed);
    const thisFailed = Number(thisMonth[0].failed);

    const lastTotal = Number(lastMonth[0].total);
    const lastPassed = Number(lastMonth[0].passed);
    const lastFailed = Number(lastMonth[0].failed);

    // Pass Rate % Now & Last Month
    const passRate = thisTotal > 0 ? (thisPassed / thisTotal) * 100 : 0;
    const lastPassRate = lastTotal > 0 ? (lastPassed / lastTotal) * 100 : 0;

    const passRateChange =
      lastPassRate > 0 ? ((passRate - lastPassRate) / lastPassRate) * 100 : 0;

    // Failed Change %
    const failedChange =
      lastFailed > 0 ? ((thisFailed - lastFailed) / lastFailed) * 100 : 0;

    return NextResponse.json({
      timestamp: new Date(),
      message: "Inspection overview data successfully retrieved",
      data: {
        totalInspections: {
          value: total,
          monthGrowth: Number(
            (((thisTotal - lastTotal) / (lastTotal || 1)) * 100).toFixed(2)
          ),
        },
        failedInspections: {
          value: thisFailed,
          change: Number(failedChange.toFixed(2)),
          direction: failedChange >= 0 ? "up" : "down",
        },
        passRate: {
          value: Number(passRate.toFixed(2)),
          change: Number(passRateChange.toFixed(2)),
          direction: passRateChange >= 0 ? "up" : "down",
        },
        pendingReviews: {
          // Optional: you can compute same breakdown by status like before
          value: pending[0].count,
          status: pending[0].count > 0 ? "attention" : "clear",
        },
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load inspection metrics" },
      { status: 500 }
    );
  }
}
