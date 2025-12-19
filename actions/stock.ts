"use server";

import { auth } from "@/app/auth";

export const fetchTyreStockData = async () => {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      throw new Error("Unauthorized");
    }

    const res = await fetch("https://tire-backend-h8tz.onrender.com/api/stock/tires", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch tyre stock data");
    }

    const allTyres = await res.json();

    return {
      timestamp: new Date(),
      message: "Tyres fetched successfully",
      data: allTyres,
    };
  } catch (error) {
    throw new Error(
      (error as Error).message ||
      "An unexpected error occurred while fetching tyre stock data"
    );
  }
};

export const overviewTyreStockData = async () => {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      throw new Error("Unauthorized");
    }

    const res = await fetch("https://tire-backend-h8tz.onrender.com/api/stock/dashboard", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch stock overview");
    }

    const overview = await res.json();

    // Map API response to UI expected format if needed
    // Assuming API returns { totalTires, inUse, inStock, needsReplacement } or similar
    // The previous code expected: { total, inuse, instore, needsreplacement }
    // I will try to support likely casing from API or default to 0

    const data = {
      total: Number(overview.total || overview.totalTires || 0),
      inuse: Number(overview.inUse || overview.inuse || 0),
      instore: Number(overview.inStore || overview.instock || overview.inStock || 0),
      needsreplacement: Number(overview.needsReplacement || overview.needsreplacement || 0),
    };

    return {
      timestamp: new Date(),
      message: "Overview fetched successfully",
      data: data,
    };
  } catch (error) {
    throw new Error(
      (error as Error).message ||
      "An unexpected error occurred while fetching tyre stock overview"
    );
  }
};
