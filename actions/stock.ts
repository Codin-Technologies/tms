"use server";

export const fetchTyreStockData = async () => {
  try {
    const base = process.env.API_BASE_URL;
    if (!base) {
      // Dev-friendly fallback: return an empty TyreStock-shaped object so pages can render
      console.warn("API_BASE_URL is not set; returning empty tyre stock data for dev.");
      return {
        timestamp: new Date(),
        message: "API_BASE_URL not configured",
        data: [] as any[],
      };
    }

    const response = await fetch(`${base}/tyres`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch tyre stock data");
    }

    return data;
  } catch (error) {
    throw new Error(
      (error as Error).message ||
        "An unexpected error occurred while fetching tyre stock data"
    );
  }
};

export const overviewTyreStockData = async () => {
  try {
    const base = process.env.API_BASE_URL;
    if (!base) {
      console.warn("API_BASE_URL is not set; returning empty tyre stock overview for dev.");
      return {
        timestamp: new Date(),
        message: "API_BASE_URL not configured",
        data: { total: "0", inuse: "0", instore: "0", needsreplacement: "0" },
      };
    }

    const response = await fetch(`${base}/tyres/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch tyre stock overview");
    }

    return data;
  } catch (error) {
    throw new Error(
      (error as Error).message ||
        "An unexpected error occurred while fetching tyre stock overview"
    );
  }
};
