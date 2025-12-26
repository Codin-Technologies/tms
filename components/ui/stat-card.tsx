"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  badge?: {
    label: string;
    variant: 'success' | 'warning' | 'error' | 'info';
  };
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  className,
  iconClassName
}: StatCardProps) {
  return (
    <div className={cn("bg-white text-black rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300", className)}>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
            {trend && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                trend.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {trend.value}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm border border-opacity-50",
            iconClassName || "bg-gray-50 text-gray-400 border-gray-100"
          )}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto">
        {subtitle && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{subtitle}</span>}
        {badge && (
          <div className={cn(
            "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1",
            badge.variant === 'success' && "bg-green-50 text-green-600 border border-green-100",
            badge.variant === 'warning' && "bg-orange-50 text-orange-600 border border-orange-100",
            badge.variant === 'error' && "bg-red-50 text-red-600 border border-red-100",
            badge.variant === 'info' && "bg-blue-50 text-blue-600 border border-blue-100",
          )}>
            {badge.variant === 'error' && <span className="w-1 h-1 bg-red-600 rounded-full animate-pulse" />}
            {badge.label}
          </div>
        )}
      </div>

      {/* Subtle bottom accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 h-1 transition-all duration-500 w-0 group-hover:w-full opacity-60",
        iconClassName?.includes('text-teal') ? "bg-teal-500" :
          iconClassName?.includes('text-blue') ? "bg-blue-500" :
            iconClassName?.includes('text-green') ? "bg-green-500" :
              iconClassName?.includes('text-orange') ? "bg-orange-500" :
                iconClassName?.includes('text-red') ? "bg-red-500" : "bg-gray-300"
      )} />
    </div>
  );
}

export default StatCard;
