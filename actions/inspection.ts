"use server";

export async function inspectionOverviewData() {
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL}/inspection/overview`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
    const response = await fetch(`${process.env.API_BASE_URL}/inspection`, {
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
