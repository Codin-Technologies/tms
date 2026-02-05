import api from "@/lib/api";
import {
    Alert,
    AlertListResponse,
    AlertResponse,
    ResolveAlertRequest
} from "@/types/alert";

/**
 * Fetch all alerts
 */
export const fetchAlerts = async (status?: string): Promise<{ success: boolean; data?: Alert[]; message?: string }> => {
    try {
        const queryParams = status ? `?status=${status}` : '';
        const response = await api.get<AlertListResponse | Alert[]>(`/api/alerts${queryParams}`);

        let alertsData: Alert[] | undefined;

        if (Array.isArray(response.data)) {
            alertsData = response.data;
        } else if (response.data && Array.isArray((response.data as any).data)) {
            alertsData = (response.data as any).data;
        }

        if (alertsData) {
            return {
                success: true,
                data: alertsData,
            };
        }

        throw new Error("Invalid API response format");
    } catch (error: any) {
        console.error("fetchAlerts error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to fetch alerts",
        };
    }
};

/**
 * Fetch a single alert by ID
 */
export const fetchAlertById = async (id: number): Promise<{ success: boolean; data?: Alert; message?: string }> => {
    try {
        const response = await api.get<AlertResponse>(`/api/alerts/${id}`);

        if (response.data && response.data.data) {
            return {
                success: true,
                data: response.data.data,
            };
        }

        throw new Error("Invalid API response format");
    } catch (error: any) {
        console.error("fetchAlertById error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to fetch alert",
        };
    }
};

/**
 * Resolve an alert
 */
export const resolveAlert = async (id: number, data: ResolveAlertRequest): Promise<{ success: boolean; data?: Alert; message?: string }> => {
    try {
        const response = await api.post<AlertResponse>(`/api/alerts/${id}/resolve`, data);

        if (response.status === 200 && response.data) {
            return {
                success: true,
                data: response.data.data,
                message: "Alert resolved successfully",
            };
        }

        throw new Error("Failed to resolve alert");
    } catch (error: any) {
        console.error("resolveAlert error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to resolve alert",
        };
    }
};
