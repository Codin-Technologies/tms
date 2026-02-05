// Client-side SKU actions - can access localStorage for authentication
import { SKU, SKUInventoryOverview } from "@/types/sku";
import api from "@/lib/api";

export const fetchSKUs = async () => {
    try {
        const response = await api.get('/api/sku/list?status=active');
        if (response.data && response.data.data) {
            const skus: SKU[] = response.data.data.map((item: any) => ({
                id: item.id || item.sku_code, // Use sku_code as fallback if id is missing, or rely on finding specific id
                skuCode: item.sku_code,
                brand: item.brand,
                model: item.model,
                size: item.size,
                plyRating: item.ply_rating,
                category: item.category,
                retreadable: item.retreadable ?? true,
                maxRetreadCycles: item.max_retread_cycles,
                expectedMileage: item.expected_mileage,
                minTreadDepth: item.min_tread_depth,
                reorderPoint: item.reorder_point,
                minStockLevel: item.min_stock_level,
                preferredWarehouse: item.preferred_warehouse,
                leadTimeDays: item.lead_time_days,
                avgUnitCost: item.cost_price,
                status: item.status, // "active", "inactive", etc.
                currentStock: item.current_stock, // Map from API
                createdAt: item.created_at ? new Date(item.created_at) : new Date(),
                updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
            }));
            return {
                success: true,
                data: skus,
            };
        }

        throw new Error("Invalid API response format");

    } catch (error: any) {
        console.error("fetchSKUs error:", error);
        return {
            success: false,
            message: error.message || "Failed to fetch SKUs",
            data: []
        };
    }
};

export const createSKU = async (data: Omit<SKU, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        const payload = {
            sku_code: data.skuCode,
            sku_name: `${data.brand} ${data.model} ${data.size}`,
            brand: data.brand,
            model: data.model,
            size: data.size,
            category: data.category,
            unit_price: data.avgUnitCost || 0,
            cost_price: data.avgUnitCost || 0,
            status: data.status,
            reorder_point: data.reorderPoint || 0,
            min_stock_level: data.minStockLevel || 0,
            // Map extra fields to metadata as they aren't in the root Swagger schema
            metadata: {
                ply_rating: data.plyRating,
                pattern_type: data.patternType,
                retreadable: data.retreadable,
                max_retread_cycles: data.maxRetreadCycles,
                expected_mileage: data.expectedMileage,
                min_tread_depth: data.minTreadDepth,
                preferred_warehouse: data.preferredWarehouse,
                lead_time_days: data.leadTimeDays,
                budget_category: data.budgetCategory
            }
        };

        const response = await api.post('/api/sku/create', payload);

        if (response.status === 201) {
            return {
                success: true,
                data: { ...data, id: response.data.id || Math.floor(Math.random() * 10000) } as SKU,
            };
        }
        throw new Error("Failed to create SKU");

    } catch (error: any) {
        console.error("createSKU error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to create SKU",
        };
    }
};

export const updateSKU = async (id: number, data: Partial<SKU>) => {
    try {
        if (!data.skuCode) {
            throw new Error("SKU Code is required for update");
        }

        const payload = {
            brand: data.brand,
            model: data.model,
            status: data.status,
            // ... map other fields
        };

        await api.put(`/api/sku/${data.skuCode}`, payload);

        return {
            success: true,
            data: { ...data } as SKU,
        };
    } catch (error: any) {
        console.error("updateSKU error:", error);
        return {
            success: false,
            message: error.message || "Failed to update SKU",
        };
    }
};

export const updateSKUThresholds = async (skuCode: string, reorderPoint: number, minStockLevel: number) => {
    try {
        const payload = {
            reorder_point: reorderPoint,
            min_stock_level: minStockLevel
        };

        const response = await api.put(`/api/sku/${skuCode}`, payload);

        if (response.status === 200) {
            return {
                success: true,
                message: "Thresholds updated successfully"
            };
        }
        throw new Error("Failed to update thresholds");
    } catch (error: any) {
        console.error("updateSKUThresholds error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to update thresholds",
        };
    }
};

export const fetchSKUInventory = async () => {
    // This seems to be duplicative of fetchSKUs but with inventory focus.
    // Reusing fetchSKUs logic but mapping to SKUInventoryOverview
    try {
        const response = await api.get('/api/sku/list?status=active');

        if (response.data && response.data.data) {
            const inventory: SKUInventoryOverview[] = response.data.data.map((item: any) => ({
                id: item.id || item.sku_code,
                skuCode: item.sku_code,
                brand: item.brand,
                model: item.model,
                size: item.size,
                plyRating: item.ply_rating,
                category: item.category,
                retreadable: item.retreadable ?? true,
                maxRetreadCycles: item.max_retread_cycles,
                expectedMileage: item.expected_mileage,
                minTreadDepth: item.min_tread_depth,
                reorderPoint: item.reorder_point,
                minStockLevel: item.min_stock_level,
                preferredWarehouse: item.preferred_warehouse,
                leadTimeDays: item.lead_time_days,
                avgUnitCost: item.cost_price,
                status: item.status,
                isSafetyCritical: item.is_safety_critical ?? false,
                createdAt: item.created_at ? new Date(item.created_at) : new Date(),
                updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),

                // Inventory specifics
                totalQty: item.current_stock || 0,
                available: item.current_stock || 0,
                issued: 0,
                inspection: 0,
                quarantine: 0,
                scrapped: 0,
                inventorySummary: {
                    total: item.current_stock || 0,
                    inInventory: item.current_stock || 0,
                    onVehicles: 0,
                    underInspection: 0,
                    quarantined: 0,
                    scrapped: 0
                },
                locations: [],
                vehicles: []
            }));

            return {
                success: true,
                data: inventory,
            };
        }

        throw new Error("Invalid API response format");

    } catch (error: any) {
        console.error("fetchSKUInventory error:", error);
        return {
            success: false,
            data: [], // Return empty array instead of mock
            message: error.message
        };
    }
};

export const receiveStock = async (data: {
    skuId: string | number; // ID or SKU Code depending on what the API needs
    warehouseId: string | number;
    supplierId: string | number;
    entryMode: "BULK" | "INDIVIDUAL";
    tires: {
        dotCode: string;
        manufactureWeek?: number;
        manufactureYear?: number;
        condition: string;
    }[];
}) => {
    try {
        // Construct payload for POST /api/inventory/receive
        const payload = {
            skuId: data.skuId,
            warehouseId: data.warehouseId,
            supplierId: data.supplierId,
            entryMode: data.entryMode,
            tires: data.tires.map(t => ({
                dotCode: t.dotCode,
                manufacturingWeek: t.manufactureWeek,
                manufacturingYear: t.manufactureYear,
                condition: t.condition
            }))
        };

        const response = await api.post('/api/inventory/receive', payload);

        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                message: `Successfully received ${data.tires.length} tires`,
            };
        }

        throw new Error("Failed to receive stock");
    } catch (error: any) {
        console.error("receiveStock error:", error);
        let message = error.response?.data?.message || error.message || "Failed to receive stock";

        // Handle Laravel-style validation errors
        if (error.response?.data?.errors) {
            const validationErrors = error.response.data.errors;
            const details = Object.entries(validationErrors)
                .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
                .join('; ');
            message = `${message} (${details})`;
        }

        return {
            success: false,
            message: message,
        };
    }
};

// New action to issue a specific tire (or multiple)
export const issueTireMovement = async (data: {
    tire_id: number;
    type: "issue"; // could be 'issue', 'rotate', 'scrap' etc
    vehicle_id: string;
    axle_position?: string;
    workshop_id?: string;
}) => {
    try {
        const response = await api.post('/api/stock/movements', data);
        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                message: "Stock movement recorded successfully",
            };
        }
        throw new Error("Failed to record stock movement");
    } catch (error: any) {
        console.error("issueTireMovement error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to issue tire",
        };
    }
};

export const fetchSKUDetails = async (skuCode: string) => {
    try {
        const response = await api.get(`/api/sku/${skuCode}`);
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error("fetchSKUDetails error:", error);
        return { success: false, message: error.message };
    }
};

export const fetchSKUTires = async (skuCode: string, status?: string, warehouseId?: number) => {
    try {
        let url = `/api/sku/${skuCode}/tires`;
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (warehouseId) params.append('warehouse_id', warehouseId.toString());

        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        const response = await api.get(url);
        // API often wraps in { success: true, data: [...] }
        const tires = response.data?.data || response.data || [];
        return { success: true, data: Array.isArray(tires) ? tires : [] };
    } catch (error: any) {
        console.error("fetchSKUTires error:", error);
        return { success: false, message: error.message, data: [] };
    }
};
export const deleteSKU = async (skuCode: string) => {
    try {
        const response = await api.delete(`/api/sku/${skuCode}`);
        if (response.status === 200 || response.status === 204) {
            return { success: true, message: "SKU deleted successfully" };
        }
        throw new Error("Failed to delete SKU");
    } catch (error: any) {
        console.error("deleteSKU error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to delete SKU"
        };
    }
};
