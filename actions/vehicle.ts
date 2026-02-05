'use client';

import api from "@/lib/api";

export interface Vehicle {
    id: string;
    model: string;
    status: 'Active' | 'Service' | 'Inactive';
    tireCount: string;
    lastService: string;
    driver: string;
    hasIssues?: boolean;
    serviceOverdue?: boolean;
    needsAttention?: boolean;
}

export const fetchOperationsVehicles = async (): Promise<{ success: boolean; data: Vehicle[]; message?: string }> => {
    try {
        const response = await api.get('/api/operations/vehicles');

        // Handle successful API response
        if (response.data && response.data.data) {
            const vehicles: Vehicle[] = response.data.data.map((v: any) => ({
                id: v.vehicle_id || v.id || 'N/A',
                model: v.model || v.make_model || 'Unknown',
                status: v.status === 'active' ? 'Active' : v.status === 'service' ? 'Service' : 'Inactive',
                tireCount: v.tire_count_summary || '0/0',
                lastService: v.last_service_date || 'N/A',
                driver: v.current_driver || 'Unassigned',
                hasIssues: v.health_status === 'issue',
                serviceOverdue: v.is_service_overdue || false,
                needsAttention: v.health_status === 'warning'
            }));

            return {
                success: true,
                data: vehicles
            };
        }

        throw new Error("Invalid API response format");

    } catch (error: any) {
        console.error("fetchOperationsVehicles error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to fetch vehicles",
            data: []
        };
    }
}; export const createVehicle = async (data: any) => {
    try {
        const response = await api.post('/api/operations/vehicles', data);
        if (response.status === 201 || response.status === 200) {
            return { success: true, message: "Vehicle created successfully" };
        }
        throw new Error("Failed to create vehicle");
    } catch (error: any) {
        console.error("createVehicle error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to create vehicle"
        };
    }
}; export const fetchVehicleById = async (id: string): Promise<{ success: boolean; data: any; message?: string }> => {
    try {
        const response = await api.get(`/api/operations/vehicles/${id}`);
        if (response.data) {
            return {
                success: true,
                data: response.data
            };
        }
        throw new Error("Vehicle not found");
    } catch (error: any) {
        console.error("fetchVehicleById error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to fetch vehicle",
            data: null
        };
    }
};

export const updateVehicle = async (id: string, data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.put(`/api/operations/vehicles/${id}`, data);
        if (response.status === 200) {
            return { success: true, message: "Vehicle updated successfully" };
        }
        throw new Error("Failed to update vehicle");
    } catch (error: any) {
        console.error("updateVehicle error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to update vehicle"
        };
    }
};

export const fetchAxleConfiguration = async (id: string): Promise<{ success: boolean; data: any; message?: string }> => {
    try {
        const response = await api.get(`/api/operations/vehicles/${id}/axle-configuration`);
        if (response.data) {
            return {
                success: true,
                data: response.data
            };
        }
        throw new Error("Axle configuration not found");
    } catch (error: any) {
        console.error("fetchAxleConfiguration error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to fetch axle configuration",
            data: null
        };
    }
};



export const saveAxleConfiguration = async (id: string, data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.post(`/api/operations/vehicles/${id}/axle-configuration`, data);
        if (response.status === 200 || response.status === 201) {
            return { success: true, message: "Axle configuration saved successfully" };
        }
        throw new Error("Failed to save axle configuration");
    } catch (error: any) {
        if (error.response?.status === 422) {
            console.log('Validation Error Details:', JSON.stringify(error.response.data, null, 2));
        }
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to save axle configuration"
        };
    }
};

export const fetchVehicleTimeline = async (id: string): Promise<{ success: boolean; data: any; message?: string }> => {
    try {
        const response = await api.get(`/api/operations/vehicles/${id}/timeline`);
        if (response.data) {
            return {
                success: true,
                data: response.data
            };
        }
        throw new Error("Timeline not found");
    } catch (error: any) {
        console.error("fetchVehicleTimeline error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to fetch vehicle timeline",
            data: []
        };
    }
};

export const archiveVehicle = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete(`/api/operations/vehicles/${id}/archive`);
        if (response.status === 200) {
            return { success: true, message: "Vehicle archived successfully" };
        }
        throw new Error("Failed to archive vehicle");
    } catch (error: any) {
        console.error("archiveVehicle error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to archive vehicle"
        };
    }
};

export const retireVehicle = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.post(`/api/operations/vehicles/${id}/retire`);
        if (response.status === 200) {
            return { success: true, message: "Vehicle retired successfully" };
        }
        throw new Error("Failed to retire vehicle");
    } catch (error: any) {
        console.error("retireVehicle error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to retire vehicle"
        };
    }
};

export const fetchVehicleInspections = async (id: string): Promise<{ success: boolean; data: any; message?: string }> => {
    try {
        const response = await api.get(`/api/vehicles/${id}/inspections`);
        if (response.data) {
            return {
                success: true,
                data: response.data
            };
        }
        throw new Error("Inspections not found");
    } catch (error: any) {
        console.error("fetchVehicleInspections error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to fetch vehicle inspections",
            data: []
        };
    }
};
