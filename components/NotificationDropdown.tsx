"use client";

import React, { useState } from "react";
import { X, AlertCircle, Info, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export interface Notification {
    id: string;
    type: "alert" | "info" | "warning" | "success";
    title: string;
    description: string;
    timestamp: Date;
    isRead: boolean;
}

// Sample notification data
const sampleNotifications: Notification[] = [
    {
        id: "1",
        type: "alert",
        title: "Critical Tire Pressure Alert",
        description: "Vehicle TRK-001 has critically low tire pressure on rear axle",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        isRead: false,
    },
    {
        id: "2",
        type: "warning",
        title: "Maintenance Due Soon",
        description: "3 vehicles require tire rotation within the next 7 days",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
    },
    {
        id: "3",
        type: "info",
        title: "New Inventory Received",
        description: "50 units of Michelin XZE tires added to stock",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        isRead: true,
    },
    {
        id: "4",
        type: "success",
        title: "Maintenance Completed",
        description: "Tire replacement completed for vehicle TRK-015",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true,
    },
    {
        id: "5",
        type: "warning",
        title: "Low Stock Alert",
        description: "Goodyear G159 stock below minimum threshold (5 units remaining)",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: false,
    },
    {
        id: "6",
        type: "info",
        title: "System Update",
        description: "Fleet management system updated to version 2.1.0",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: true,
    },
];

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleMarkAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const getRelativeTime = (date: Date) => {
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

    const getNotificationIcon = (type: Notification["type"]) => {
        switch (type) {
            case "alert":
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

    const getNotificationBgColor = (type: Notification["type"], isRead: boolean) => {
        if (isRead) return "bg-gray-50";

        switch (type) {
            case "alert":
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
            <div className="absolute right-0 mt-2 w-[420px] bg-white rounded-lg shadow-2xl border border-gray-200 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <p className="text-sm text-gray-500 mt-0.5">
                                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close notifications"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Mark all as read */}
                {unreadCount > 0 && (
                    <div className="px-5 py-2 border-b border-gray-100">
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="max-h-[500px] overflow-y-auto scrollbar-visible">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-5">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No notifications</p>
                            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className={`px-5 py-4 cursor-pointer transition-all hover:bg-gray-50 ${getNotificationBgColor(notification.type, notification.isRead)
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className={`text-sm font-semibold ${notification.isRead ? "text-gray-700" : "text-gray-900"
                                                    }`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full mt-1.5" />
                                                )}
                                            </div>
                                            <p className={`text-sm ${notification.isRead ? "text-gray-500" : "text-gray-600"
                                                } line-clamp-2`}>
                                                {notification.description}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{getRelativeTime(notification.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
                        <button className="w-full text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors py-1">
                            View all notifications
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
