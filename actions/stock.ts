"use server";

import { auth } from "@/app/auth";

export const fetchTyreStockData = async () => {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      throw new Error("Unauthorized");
    }

    // Testing page=2 to see if pagination works at all
    const url = `https://tire-backend-h8tz.onrender.com/api/stock/tires?page=2&t=${Date.now()}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch tyre stock data");
    }

    const allTyresRaw = await res.json();
    console.log("Raw response keys:", Object.keys(allTyresRaw));
    if (allTyresRaw.meta) console.log("Response meta:", allTyresRaw.meta);
    if (allTyresRaw.pagination) console.log("Response pagination:", allTyresRaw.pagination);
    if (allTyresRaw.total) console.log("Response total:", allTyresRaw.total);

    // Handle nested data if backend returns { data: [...] }
    const tyreArray = Array.isArray(allTyresRaw) ? allTyresRaw : (allTyresRaw.data || []);

    // Map snake_case to camelCase and ensure field compatibility
    const mappedTyres = tyreArray.map((t: any) => ({
      id: t.id,
      documentId: t.unique_tire_id, // Map unique_tire_id for reference
      serialNumber: t.serial_number || t.serialNumber,
      brand: t.brand,
      model: t.model,
      size: t.size,
      type: t.type,
      purchaseDate: t.purchase_date || t.purchaseDate,
      purchaseCost: Number(t.cost || t.purchaseCost || 0),
      status: t.status || 'instock',
      location: t.warehouse_id || t.location || 'N/A',
      remainingTreadMm: Number(t.remaining_tread_mm || 0),
      pressure: Number(t.pressure || 0),
      createdAt: t.created_at || t.createdAt,
      updatedAt: t.updated_at || t.updatedAt,
    }));

    console.log(`Fetched ${mappedTyres.length} tyres from backend`);
    if (mappedTyres.length > 0) {
      // Find the tyre with the highest ID (assuming it's newest) to verify submission
      const newest = [...mappedTyres].sort((a, b) => (b.id || 0) - (a.id || 0))[0];
      console.log("Newest tyre in list - ID:", newest.id, "Serial:", newest.serialNumber);
    }

    return {
      timestamp: new Date(),
      message: "Tyres fetched successfully",
      data: mappedTyres,
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

    const res = await fetch(`https://tire-backend-h8tz.onrender.com/api/stock/dashboard?t=${Date.now()}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch stock overview");
    }

    const overview = await res.json();

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

export const addTyreToStock = async (tyreData: {
  brand: string;
  model: string;
  size: string;
  serialNumber: string;
  cost?: number;
  vendor?: string;
  warehouseId?: string;
  purchaseDate?: string;
  tyreType?: string;
}) => {
  try {
    console.log("addTyreToStock called with:", tyreData);

    const session = await auth();
    if (!session?.accessToken) {
      console.error("No access token found");
      throw new Error("Unauthorized");
    }

    // Map frontend field names to backend API field names
    const payload = {
      brand: tyreData.brand,
      model: tyreData.model,
      size: tyreData.size,
      serial_number: tyreData.serialNumber,
      cost: tyreData.cost ? Number(tyreData.cost) : 0, // Ensure it's a number
      vendor: tyreData.vendor || "Unknown",
      warehouse_id: 1, // Temporarily trying a numeric ID
      purchase_date: tyreData.purchaseDate || new Date().toISOString().split('T')[0],
      type: tyreData.tyreType || "Truck",
    };

    console.log("Sending payload to backend:", payload);

    const res = await fetch("https://tire-backend-h8tz.onrender.com/api/stock/tires", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("Backend response status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Backend error:", errorData);
      throw new Error(errorData.message || "Failed to add tyre to stock");
    }

    const result = await res.json();
    console.log("Backend success response:", result);

    return {
      success: true,
      message: "Tyre added successfully",
      data: result,
    };
  } catch (error) {
    console.error("addTyreToStock error:", error);
    return {
      success: false,
      message: (error as Error).message || "An unexpected error occurred while adding tyre",
    };
  }
};
