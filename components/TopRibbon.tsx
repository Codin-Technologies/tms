"use client";

import React, { useState } from "react";
import { useHeader } from "./HeaderContext";
import { Search, Bell, Plus } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

export default function TopRibbon() {
  const { header } = useHeader();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Sample unread count - in real app, this would come from notification data
  const unreadCount = 3;

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 leading-tight">{header.title}</div>
            {header.subtitle && <div className="text-sm text-gray-500 mt-1">{header.subtitle}</div>}
          </div>

          <div className="flex items-center gap-4">
            {header.searchPlaceholder && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={header.searchPlaceholder}
                  className="pl-10 pr-4 py-2.5 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
            )}

            {/* Notification Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
              />
            </div>

            {header.actions ? (
              header.actions
            ) : (
              <button className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm">
                <Plus size={20} />
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
