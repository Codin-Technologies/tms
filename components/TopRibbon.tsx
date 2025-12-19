"use client";

import React from "react";
import { useHeader } from "./HeaderContext";
import { Search, Bell, Plus } from "lucide-react";

export default function TopRibbon() {
  const { header } = useHeader();

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{header.title}</h1>
            {header.subtitle && <p className="text-sm text-gray-500 mt-1">{header.subtitle}</p>}
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

            <button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

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
