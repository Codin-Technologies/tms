"use client";

import { useEffect } from "react";
import { SKUInventoryTable } from "@/components/sku-inventory-table";
import { StatCard } from "@/components/ui/stat-card";
import { useHeader } from '@/components/HeaderContext';
import { useSKUInventoryQuery } from "./query";
import { Layers, CheckCircle2, AlertTriangle, ShieldCheck, Box } from "lucide-react";

export default function SKUInventoryPage() {
    const { data: inventory } = useSKUInventoryQuery();
    const { setHeader } = useHeader();

    const totalSKUs = inventory?.length || 0;
    const totalTires = inventory?.reduce((acc, curr) => acc + curr.totalQty, 0) || 0;
    const availableTires = inventory?.reduce((acc, curr) => acc + curr.available, 0) || 0;
    const lowStockSKUs = inventory?.filter(sku => sku.available <= (sku.minStockLevel || 0)).length || 0;

    useEffect(() => {
        setHeader({
            title: 'Inventory by SKU',
            subtitle: 'Day-to-day tire operations and stock levels',
            searchPlaceholder: 'Search SKUs, model...',
        });
        return () => setHeader({});
    }, [setHeader]);

    return (
        <div className="mx-auto flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total SKUs"
                    value={totalSKUs}
                    icon={<Layers className="text-blue-600" />}
                />
                <StatCard
                    title="Total Tires"
                    value={totalTires}
                    icon={<Box className="text-teal-600" />}
                />
                <StatCard
                    title="Available"
                    value={availableTires}
                    icon={<CheckCircle2 className="text-green-600" />}
                />
                <StatCard
                    title="Low Stock SKUs"
                    value={lowStockSKUs}
                    icon={<AlertTriangle className="text-orange-600" />}
                />
                <StatCard
                    title="Safety Alerts"
                    value={0}
                    icon={<ShieldCheck className="text-red-600" />}
                />
            </div>

            <div className="bg-white text-black rounded-lg shadow-md p-6 space-y-6">
                <SKUInventoryTable />
            </div>
        </div>
    );
}
