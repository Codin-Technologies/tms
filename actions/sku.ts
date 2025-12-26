"use server";

import { db } from "@/app/db";
import { skus, tyres } from "@/app/db/schema";
import { eq, desc, or, inArray } from "drizzle-orm";
import { SKU } from "@/types/sku";
import { mockSKUs, mockSKUInventory } from "@/data/skus";

/**
 * Generate a unique serial number from tire information
 * Format: SKUCODE-DOTCODE-MFGWEEK-MFGYEAR-SEQ
 * Example: MIC-295-80R22.5-DOTABCD1234-15-2024-001
 */
function generateSerialNumber(
    skuCode: string,
    dotCode: string,
    manufacturingWeek?: number,
    manufacturingYear?: number,
    sequence?: number
): string {
    // Clean and format inputs
    const cleanSkuCode = skuCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const cleanDotCode = dotCode.replace(/\s+/g, '').toUpperCase();
    
    const parts = [cleanSkuCode, cleanDotCode];
    
    if (manufacturingWeek) {
        parts.push(String(manufacturingWeek).padStart(2, '0'));
    }
    
    if (manufacturingYear) {
        const year = manufacturingYear > 100 ? String(manufacturingYear) : String(manufacturingYear).padStart(2, '0');
        parts.push(year);
    }
    
    if (sequence !== undefined) {
        parts.push(String(sequence).padStart(3, '0'));
    }
    
    return parts.join('-');
}

export const fetchSKUs = async () => {
    try {
        // Return mock data for presentation
        return {
            success: true,
            data: mockSKUs as SKU[],
        };

        /* Original Drizzle logic
        const allSkus = await db.query.skus.findMany({
            orderBy: [desc(skus.createdAt)],
        });
        return {
            success: true,
            data: allSkus as SKU[],
        };
        */
    } catch (error) {
        console.error("fetchSKUs error:", error);
        return {
            success: false,
            message: (error as Error).message || "Failed to fetch SKUs",
        };
    }
};

export const createSKU = async (data: Omit<SKU, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        const result = await db.insert(skus).values(data).returning();
        return {
            success: true,
            data: result[0],
        };
    } catch (error) {
        console.error("createSKU error:", error);
        return {
            success: false,
            message: (error as Error).message || "Failed to create SKU",
        };
    }
};

export const updateSKU = async (id: number, data: Partial<SKU>) => {
    try {
        const result = await db.update(skus).set({ ...data, updatedAt: new Date() }).where(eq(skus.id, id)).returning();
        return {
            success: true,
            data: result[0],
        };
    } catch (error) {
        console.error("updateSKU error:", error);
        return {
            success: false,
            message: (error as Error).message || "Failed to update SKU",
        };
    }
};

export const fetchSKUInventory = async () => {
    try {
        // Return mock data for presentation
        return {
            success: true,
            data: mockSKUInventory,
        };

        /* Original Drizzle logic
        const allSkus = await db.query.skus.findMany({
            with: {
                tyres: true,
            }
        });

        const inventory = allSkus.map(sku => {
            const tyres = (sku as any).tyres || [];
            return {
                ...sku,
                totalQty: tyres.length,
                available: tyres.filter((t: any) => t.status === 'instock').length,
                issued: tyres.filter((t: any) => t.status === 'issued' || t.status === 'assigned').length,
                inspection: tyres.filter((t: any) => t.status === 'inspection').length,
                quarantine: tyres.filter((t: any) => t.status === 'quarantine').length,
                scrapped: tyres.filter((t: any) => t.status === 'scrapped' || t.status === 'disposed').length,
            };
        });

        return {
            success: true,
            data: inventory,
        };
        */
    } catch (error) {
        console.error("fetchSKUInventory error:", error);
        return {
            success: false,
            message: (error as Error).message || "Failed to fetch SKU inventory",
        };
    }
};

interface TireDetail {
    dotCode: string;
    manufacturingWeek?: number;
    manufacturingYear?: number;
}

export const receiveStock = async (data: {
    skuId: number;
    quantity: number;
    location: string;
    supplier: string;
    condition: string;
    tireDetails?: TireDetail[]; // Array of tire details for serial number generation
    serialNumbers?: string[]; // Optional array of pre-generated serial numbers (legacy)
}) => {
    try {
        const sku = await db.query.skus.findFirst({
            where: eq(skus.id, data.skuId),
        });

        if (!sku) throw new Error("SKU not found");

        // Priority 1: Generate serial numbers from tire details (DOT codes)
        if (data.tireDetails && data.tireDetails.length > 0) {
            // Validate that all tire details are provided
            if (data.tireDetails.length !== data.quantity) {
                throw new Error(`Number of tire details (${data.tireDetails.length}) must match quantity (${data.quantity})`);
            }

            // Validate DOT codes are provided
            const missingDotCodes = data.tireDetails.some(td => !td.dotCode || !td.dotCode.trim());
            if (missingDotCodes) {
                throw new Error("All tires must have a DOT code");
            }

            // Generate serial numbers from tire details
            const generatedSerials: string[] = [];
            const dotCodeGroups = new Map<string, number>(); // Track sequence numbers per DOT code

            for (const tireDetail of data.tireDetails) {
                const dotCode = tireDetail.dotCode.trim().toUpperCase();
                
                // Get or increment sequence number for this DOT code
                const currentSeq = dotCodeGroups.get(dotCode) || 0;
                dotCodeGroups.set(dotCode, currentSeq + 1);

                const serialNumber = generateSerialNumber(
                    sku.skuCode,
                    dotCode,
                    tireDetail.manufacturingWeek,
                    tireDetail.manufacturingYear,
                    currentSeq + 1
                );

                generatedSerials.push(serialNumber);
            }

            // Check for duplicate generated serial numbers
            const uniqueSerials = new Set(generatedSerials);
            if (uniqueSerials.size !== generatedSerials.length) {
                throw new Error("Generated serial numbers contain duplicates. Please check DOT codes and manufacturing information.");
            }

            // Check if any generated serial numbers already exist in the database
            const existingTyres = await db.query.tyres.findMany({
                where: (tyres, { inArray: inArrayFn }) => inArrayFn(tyres.serialNumber, generatedSerials),
            });

            if (existingTyres.length > 0) {
                const existingSerials = existingTyres.map(t => t.serialNumber).join(", ");
                throw new Error(`The following serial numbers already exist: ${existingSerials}`);
            }

            // Create tires with generated serial numbers
            const tyresToCreate = data.tireDetails.map((tireDetail, i) => ({
                skuId: data.skuId,
                serialNumber: generatedSerials[i],
                dotCode: tireDetail.dotCode.trim().toUpperCase(),
                manufacturingWeek: tireDetail.manufacturingWeek || null,
                manufacturingYear: tireDetail.manufacturingYear || null,
                brand: sku.brand,
                model: sku.model,
                size: sku.size,
                status: 'instock',
                condition: data.condition,
                currentWarehouse: data.location,
            }));

            await db.insert(tyres).values(tyresToCreate);

            return {
                success: true,
                message: `Successfully received ${data.quantity} tires with auto-generated serial numbers from tire details`,
            };
        }

        // Priority 2: Use provided serial numbers (legacy support)
        if (data.serialNumbers && data.serialNumbers.length > 0) {
            // Validate that all serial numbers are provided and unique
            if (data.serialNumbers.length !== data.quantity) {
                throw new Error(`Number of serial numbers (${data.serialNumbers.length}) must match quantity (${data.quantity})`);
            }

            // Check for duplicate serial numbers in the input
            const uniqueSerials = new Set(data.serialNumbers);
            if (uniqueSerials.size !== data.serialNumbers.length) {
                throw new Error("Duplicate serial numbers found. Each tire must have a unique serial number.");
            }

            // Check if any serial numbers already exist in the database
            const existingTyres = await db.query.tyres.findMany({
                where: (tyres, { inArray: inArrayFn }) => inArrayFn(tyres.serialNumber, data.serialNumbers),
            });

            if (existingTyres.length > 0) {
                const existingSerials = existingTyres.map(t => t.serialNumber).join(", ");
                throw new Error(`The following serial numbers already exist: ${existingSerials}`);
            }

            // Create tires with provided serial numbers
            const tyresToCreate = data.serialNumbers.map((serialNumber) => ({
                skuId: data.skuId,
                serialNumber: serialNumber.trim(),
                brand: sku.brand,
                model: sku.model,
                size: sku.size,
                status: 'instock',
                condition: data.condition,
                currentWarehouse: data.location,
            }));

            await db.insert(tyres).values(tyresToCreate);

            return {
                success: true,
                message: `Successfully received ${data.quantity} tires with individual tracking`,
            };
        } else {
            // No tire details or serial numbers provided - require tire details
            throw new Error("Tire details (including DOT code) are required to generate unique serial numbers. Please provide DOT codes for each tire.");
        }
    } catch (error) {
        console.error("receiveStock error:", error);
        return {
            success: false,
            message: (error as Error).message || "Failed to receive stock",
        };
    }
};

export const issueTires = async (data: {
    skuId: number;
    quantity: number;
    destination: string;
}) => {
    try {
        const availableTyres = await db.query.tyres.findMany({
            where: (tyres, { eq, and }) => and(eq(tyres.skuId, data.skuId), eq(tyres.status, 'instock')),
            orderBy: [desc(tyres.createdAt)],
            limit: data.quantity,
        });

        if (availableTyres.length < data.quantity) {
            throw new Error(`Insufficient stock. Only ${availableTyres.length} tires available.`);
        }

        for (const t of availableTyres) {
            await db.update(tyres)
                .set({ status: 'issued', updatedAt: new Date() })
                .where(eq(tyres.id, t.id));
        }

        return {
            success: true,
            message: `Successfully issued ${data.quantity} tires to ${data.destination}`,
        };
    } catch (error) {
        console.error("issueTires error:", error);
        return {
            success: false,
            message: (error as Error).message || "Failed to issue tires",
        };
    }
};
