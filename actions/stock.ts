"use server";

export const fetchTyreStockData = async () => {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/tyres`, {
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
    const response = await fetch(
      `${process.env.API_BASE_URL}/tyres/overview`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
