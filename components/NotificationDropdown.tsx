"use client";

import React, { useState } from "react";
import { X, AlertCircle, Info, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Alert, AlertStatus, AlertSeverity } from "@/types/alert";
import { resolveAlert } from "@/actions/alert";
import { toast } from "sonner";

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    alerts: Alert[];
    onRefresh: () => void;
    loading?: boolean;
}

export default function NotificationDropdown({ isOpen, onClose, alerts, onRefresh, loading }: NotificationDropdownProps) {
    const [resolvingId, setResolvingId] = useState<number | null>(null);

    const openAlerts = alerts.filter(a => a.status === 'open');
    const unreadCount = openAlerts.length;

    const handleResolve = async (id: number) => {
        setResolvingId(id);
        const result = await resolveAlert(id, { notes: "Resolved from notification dropdown" });
        if (result.success) {
            toast.success("Alert resolved");
            onRefresh();
        } else {
            toast.error(result.message || "Failed to resolve alert");
        }
        setResolvingId(null);
    };

    const getRelativeTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    const getSeverityIcon = (severity: AlertSeverity) => {
        switch (severity) {
            case "critical":
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "info":
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getSeverityBgColor = (severity: AlertSeverity, status: AlertStatus) => {
        if (status !== 'open') return "bg-gray-50 opacity-60";

        switch (severity) {
            case "critical":
                return "bg-red-50";
            case "warning":
                return "bg-yellow-50";
            case "success":
                return "bg-green-50";
            case "info":
            default:
                return "bg-blue-50";
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-30"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Dropdown Panel */}
            <div className="absolute right-0 mt-2 w-[420px] bg-white rounded-lg shadow-2xl border border-gray-200 z-40 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                        {unreadCount > 0 && (
                            <p className="text-sm text-gray-500 mt-0.5">
                                {unreadCount} active alert{unreadCount !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin text-teal-600" />}
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Close notifications"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[500px] overflow-y-auto scrollbar-visible bg-gray-50/30">
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-5">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No alerts found</p>
                            <p className="text-sm text-gray-400 mt-1">System is healthy!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`px-5 py-4 transition-all hover:bg-gray-50 ${getSeverityBgColor(alert.severity, alert.status)}`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getSeverityIcon(alert.severity)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className={`text-sm font-semibold text-gray-900`}>
                                                    {alert.title}
                                                </h4>
                                                {alert.status === 'open' && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-1.5" />
                                                )}
                                            </div>
                                            <p className={`text-sm text-gray-600 mb-2`}>
                                                {alert.description}
                                            </p>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{getRelativeTime(alert.created_at)}</span>
                                                    {alert.module && (
                                                        <>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                            <span className="uppercase tracking-wider font-medium">{alert.module}</span>
                                                        </>
                                                    )}
                                                </div>

                                                {alert.status === 'open' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleResolve(alert.id);
                                                        }}
                                                        disabled={resolvingId === alert.id}
                                                        className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-white border border-teal-100 px-3 py-1 rounded-full shadow-sm hover:shadow transition-all disabled:opacity-50"
                                                    >
                                                        {resolvingId === alert.id ? "Resolving..." : "Resolve"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {alerts.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onRefresh}
                            className="w-full text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors py-1 flex items-center justify-center gap-2"
                        >
                            Refresh System Alerts
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
