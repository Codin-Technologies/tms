export type AlertStatus = 'open' | 'resolved' | 'acknowledged';
export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface Alert {
    id: number;
    title: string;
    description: string;
    status: AlertStatus;
    severity: AlertSeverity;
    module?: string;
    entity_id?: string | number;
    meta_data?: any;
    resolved_at?: string;
    resolved_by?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface AlertListResponse {
    success: boolean;
    data: Alert[];
    message?: string;
}

export interface AlertResponse {
    success: boolean;
    data: Alert;
    message?: string;
}

export interface ResolveAlertRequest {
    notes?: string;
}
