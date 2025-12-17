"use server";

export async function inspectionOverviewData() {
  try {
    const base = process.env.API_BASE_URL;
    if (!base) {
      console.warn("API_BASE_URL is not set; returning empty inspection overview for dev.");
      return {
        timestamp: new Date(),
        message: "API_BASE_URL not configured",
        data: {
          totalInspections: { value: 0, monthGrowth: 0 },
          failedInspections: { value: 0, change: 0, direction: "none" },
          passRate: { value: 0, change: 0, direction: "none" },
          pendingReviews: { value: "0", status: "ok" },
        },
      };
    }

    const response = await fetch(`${base}/inspection/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch inspection overview");
    }

    return data;
  } catch (error) {
    throw new Error(
      (error as Error).message ||
        "An unexpected error occurred while fetching inspection overview"
    );
  }
}

export async function inspectionData() {
  try {
    const base = process.env.API_BASE_URL;
    if (!base) {
      console.warn("API_BASE_URL is not set; returning empty inspection data for dev.");
      return { timestamp: new Date(), message: "API_BASE_URL not configured", data: [] };
    }

    const response = await fetch(`${base}/inspection`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch inspection data");
    }

    return data;
  } catch (error) {
    throw new Error(
      (error as Error).message ||
        "An unexpected error occurred while fetching inspection data"
    );
  }
}
