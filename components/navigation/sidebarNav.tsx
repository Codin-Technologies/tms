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

  return (
    <div 
      className={`h-full transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      } bg-teal-800 text-white`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-teal-700">
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
      <div className="flex justify-end pt-4 pr-4 pb-2">
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

      {/* Navigation Items */}
      <nav
        className={`${isCollapsed ? "px-2" : "px-2"}`}
        style={{ rowGap: "24px", display: "flex", flexDirection: "column" }}
      >
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link href={item.href} key={index}>
              <div
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  isActive
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
      <div className="p-4 border-t border-teal-700">
        <div className={`flex items-center gap-3 px-3 py-2 hover:bg-teal-700 rounded-lg cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
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
      </div>
    </div>
  );
}