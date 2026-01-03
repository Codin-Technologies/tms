"use client";

import React, { useState } from "react";
import { sidebarItems } from "./sidebarItems";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SidebarNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const profileActive = pathname?.startsWith('/users');

  const handleLogout = async () => {
    const { signOut } = await import('@/app/auth');
    await signOut({ redirectTo: '/login' });
  };

  return (
    <div
      className={`h-full transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-54"
        } bg-teal-800 text-white flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-teal-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center font-bold text-lg">
            TM
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg">FleetCo</h1>
              <p className="text-xs text-teal-300">Tire Management System</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="flex justify-end pt-2 pr-2 pb-1 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="text-gray-600" width={20} height={20} />
          ) : (
            <ChevronLeft className="text-gray-600" width={20} height={20} />
          )}
        </button>
      </div>

      {/* Navigation Items - Scrollable */}
      <nav
        className={`flex-1 overflow-y-auto sidebar-scrollbar ${isCollapsed ? "px-2" : "px-2"} py-2`}
        style={{ rowGap: "12px", display: "flex", flexDirection: "column" }}
      >
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link href={item.href} key={index}>
              <div
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isActive
                  ? "bg-teal-700 text-white"
                  : "hover:bg-teal-700 hover:text-white text-teal-100"
                  } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.name : ""}
              >
                <Icon
                  className={isCollapsed ? "" : "mr-4"}
                  width={20}
                  height={20}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-sm">{item.name}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-teal-700 flex-shrink-0">
        <Link href="/users" aria-label="Open user management" title="User management">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''} ${profileActive ? 'bg-teal-700 text-white' : 'hover:bg-teal-700 hover:text-white text-teal-100'}`}>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-sm font-semibold">
              TU
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium">Test User</p>
                <p className="text-xs text-teal-300">Fleet Manager</p>
              </div>
            )}
          </div>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-red-600 text-teal-100 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? "Logout" : ""}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
}