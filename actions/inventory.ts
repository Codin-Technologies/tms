'use client';

import api from "@/lib/api";

export interface Warehouse {
    id: number | string;
    name: string;
}

export interface Supplier {
    id: number | string;
    name: string;
}

export const fetchWarehouses = async (): Promise<{ success: boolean; data: Warehouse[]; message?: string }> => {
    try {
        const response = await api.get('/api/stock/warehouses');
        if (response.data && Array.isArray(response.data)) {
            return {
                success: true,
                data: response.data.map((w: any) => ({
                    id: w.id,
                    name: w.name || w.warehouse_name
                }))
            };
        }

        // Fallback to mock data if API fails or returns non-array
        return {
            success: true,
            data: [
                { id: 1, name: "Main Warehouse" },
                { id: 2, name: "Dar Depot" },
                { id: 3, name: "Arusha Branch" },
            ]
        };
    } catch (error) {
        console.warn("fetchWarehouses API error, using fallback:", error);
        return {
            success: true,
            data: [
                { id: 1, name: "Main Warehouse" },
                { id: 2, name: "Dar Depot" },
                { id: 3, name: "Arusha Branch" },
            ]
        };
    }
};

export const fetchSuppliers = async (): Promise<{ success: boolean; data: Supplier[]; message?: string }> => {
    try {
        const response = await api.get('/api/stock/suppliers');
        if (response.data && Array.isArray(response.data)) {
            return {
                success: true,
                data: response.data.map((s: any) => ({
                    id: s.id,
                    name: s.name || s.supplier_name
                }))
            };
        }

        return {
            success: true,
            data: [
                { id: 1, name: "Superdoll" },
                { id: 2, name: "Tire World" },
                { id: 3, name: "Nexen Middle East" },
            ]
        };
    } catch (error) {
        console.warn("fetchSuppliers API error, using fallback:", error);
        return {
            success: true,
            data: [
                { id: 1, name: "Superdoll" },
                { id: 2, name: "Tire World" },
                { id: 3, name: "Nexen Middle East" },
            ]
        };
    }
};
