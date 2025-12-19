"use server";

import { auth } from "@/app/auth";

// Helper to get start/end dates
const getMonthBounds = (monthsAgo = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const filterByDateRange = (items: any[], start: Date, end: Date) => {
  return items.filter((item) => {
    const itemDate = new Date(item.createdAt || item.date); // Handle likely date fields
    return itemDate >= start && itemDate <= end; // Simplified upper bound check
  });
};

export async function inspectionOverviewData() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      throw new Error("Unauthorized");
    }

    const res = await fetch("https://tire-backend-h8tz.onrender.com/api/inspections", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch inspections");
    }

    const inspections: any[] = await res.json();

    // Time ranges
    const { start: thisMonthStart, end: thisMonthEnd } = getMonthBounds(0);
    const { start: lastMonthStart, end: lastMonthEnd } = getMonthBounds(1);

    // Filter data
    const thisMonthData = filterByDateRange(inspections, thisMonthStart, thisMonthEnd);
    const lastMonthData = filterByDateRange(inspections, lastMonthStart, lastMonthEnd); // Note: Original was < CURRENT_MONTH, so full last month

    // Stats: Totals
    const total = inspections.length;

    // Stats: This Month
    const thisTotal = thisMonthData.length;
    const thisPassed = thisMonthData.filter((i) => i.status === "passed").length;
    const thisFailed = thisMonthData.filter((i) => i.status === "failed").length;

    // Stats: Last Month
    const lastTotal = lastMonthData.length;
    const lastPassed = lastMonthData.filter((i) => i.status === "passed").length;
    const lastFailed = lastMonthData.filter((i) => i.status === "failed").length;

    // Stats: Pending
    const pending = inspections.filter((i) => i.status === "pending").length;

    // Calculations
    const passRate = thisTotal > 0 ? (thisPassed / thisTotal) * 100 : 0;
    const lastPassRate = lastTotal > 0 ? (lastPassed / lastTotal) * 100 : 0;
    const passRateChange = lastPassRate > 0 ? ((passRate - lastPassRate) / lastPassRate) * 100 : 0;

    const failedChange = lastFailed > 0 ? ((thisFailed - lastFailed) / lastFailed) * 100 : 0;

    // Month Growth (Total inspections this month vs last month)
    const monthGrowth = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : 0;

    return {
      timestamp: new Date(),
      message: "Inspection overview fetched successfully",
      data: {
        totalInspections: {
          value: total,
          monthGrowth: Number(monthGrowth.toFixed(2)),
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
          value: pending,
          status: pending > 0 ? "attention" : "clear",
        },
      },
    };
  } catch (error) {
    console.error("Error fetching inspection overview:", error);
    return {
      timestamp: new Date(),
      message: "Error fetching data",
      data: {
        totalInspections: { value: 0, monthGrowth: 0 },
        failedInspections: { value: 0, change: 0, direction: "down" },
        passRate: { value: 0, change: 0, direction: "down" },
        pendingReviews: { value: 0, status: "clear" },
      }
    };
  }
}

export async function inspectionData() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      throw new Error("Unauthorized");
    }

    const res = await fetch("https://tire-backend-h8tz.onrender.com/api/inspections", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error("Failed to fetch inspection data");
    }

    const allInspections = await res.json();

    return {
      timestamp: new Date(),
      message: "Inspection data fetched successfully",
      data: allInspections
    };
  } catch (error) {
    throw new Error(
      (error as Error).message ||
      "An unexpected error occurred while fetching inspection data"
    );
  }
}
