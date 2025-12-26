"use server";

import { db } from "@/app/db";
import { skus, tyres } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";
import { SKU } from "@/types/sku";
import { mockSKUs, mockSKUInventory } from "@/data/skus";

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

export const receiveStock = async (data: {
    skuId: number;
    quantity: number;
    location: string;
    supplier: string;
    condition: string;
}) => {
    try {
        const sku = await db.query.skus.findFirst({
            where: eq(skus.id, data.skuId),
        });

        if (!sku) throw new Error("SKU not found");

        const tyresToCreate = Array.from({ length: data.quantity }).map((_, i) => ({
            skuId: data.skuId,
            serialNumber: `${sku.skuCode}-${Date.now()}-${i}`,
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
            message: `Successfully received ${data.quantity} tires`,
        };
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
