export interface SKU {
    id: number;
    skuCode: string;
    brand: string;
    model: string;
    size: string;
    plyRating?: string | null;
    patternType?: string | null;
    category?: string | null; // Steer / Drive / Trailer
    retreadable: boolean | null;
    maxRetreadCycles?: number | null;
    expectedMileage?: number | null;
    minTreadDepth?: number | null;

    // Inventory Rules
    reorderPoint?: number | null;
    minStockLevel?: number | null;
    preferredWarehouse?: string | null;
    leadTimeDays?: number | null;

    // Financial
    avgUnitCost?: number | null;
    budgetCategory?: string | null;

    status: string;
    isSafetyCritical?: boolean;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}

export interface InventorySummary {
    total: number;
    inInventory: number;
    onVehicles: number;
    underInspection: number;
    quarantined: number;
    scrapped: number;
}

export interface LocationGroup {
    locationName: string;
    available: number;
    inspection: number;
    quarantine: number;
    total: number;
}

export interface VehicleGroup {
    vehicleId: string;
    vehicleName: string;
    axlePosition: string;
    tireCount: number;
    avgTreadDepth: number;
    status: 'OK' | 'Attention' | 'Critical';
    isSteerAxle: boolean;
}

export interface SKUInventoryOverview extends SKU {
    totalQty: number;
    available: number;
    issued: number;
    inspection: number;
    quarantine: number;
    scrapped: number;
    inventorySummary?: InventorySummary;
    locations?: LocationGroup[];
    vehicles?: VehicleGroup[];
}
