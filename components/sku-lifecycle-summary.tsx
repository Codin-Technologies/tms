'use client';

import { Package, Truck, Wrench, RefreshCw, Trash2 } from "lucide-react";

interface SkuLifecycleSummaryProps {
    data: {
        inStock: number;
        inService: number;
        underRepair: number;
        retreaded: number;
        scrapped: number;
    };
}

export function SkuLifecycleSummary({ data }: SkuLifecycleSummaryProps) {
    const stages = [
        { label: 'In Stock', value: data.inStock, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'In Service', value: data.inService, icon: Truck, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Under Repair', value: data.underRepair, icon: Wrench, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Retreaded', value: data.retreaded, icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Scrapped', value: data.scrapped, icon: Trash2, color: 'text-gray-600', bg: 'bg-gray-50' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
            {stages.map((stage) => (
                <div key={stage.label} className="p-4 rounded-lg border bg-white shadow-sm flex flex-col items-center text-center transition-transform hover:scale-105">
                    <div className={`p-2 rounded-full ${stage.bg} mb-3`}>
                        <stage.icon className={`w-6 h-6 ${stage.color}`} />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stage.value}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">{stage.label}</span>
                </div>
            ))}
        </div>
    );
}
