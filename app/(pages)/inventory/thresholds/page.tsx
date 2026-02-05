"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useHeader } from "@/components/HeaderContext";
import { fetchSKUs, updateSKUThresholds } from "@/actions/sku";
import { SKU } from "@/types/sku";
import {
    Loader2,
    Search,
    AlertTriangle,
    Save,
    ArrowLeft,
    RefreshCcw,
    TrendingDown,
    ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ThresholdManagerPage() {
    const { setHeader } = useHeader();
    const [skus, setSkus] = useState<SKU[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [pendingChanges, setPendingChanges] = useState<Record<string, { reorderPoint: number; minStockLevel: number }>>({});

    useEffect(() => {
        setHeader({
            title: "Threshold Manager",
            subtitle: "Manage safety stock, reorder levels and critical triggers",
            backButton: (
                <Link href="/inventory" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
            )
        });
        loadData();
        return () => setHeader({});
    }, [setHeader]);

    const loadData = async () => {
        setLoading(true);
        const result = await fetchSKUs();
        if (result.success && result.data) {
            setSkus(result.data);
        } else {
            toast.error(result.message || "Failed to load SKUs");
        }
        setLoading(false);
    };

    const handleThresholdChange = (skuCode: string, field: 'reorderPoint' | 'minStockLevel', value: string) => {
        const numValue = parseInt(value) || 0;
        const currentSKU = skus.find(s => s.skuCode === skuCode);
        if (!currentSKU) return;

        setPendingChanges(prev => {
            const currentPending = prev[skuCode] || {
                reorderPoint: currentSKU.reorderPoint,
                minStockLevel: currentSKU.minStockLevel
            };

            return {
                ...prev,
                [skuCode]: {
                    ...currentPending,
                    [field]: numValue
                }
            };
        });
    };

    const handleSaveAll = async () => {
        const changes = Object.entries(pendingChanges);
        if (changes.length === 0) return;

        setSaving(true);
        let successCount = 0;
        let failCount = 0;

        // Process in small batches or sequentially to avoid overwhelming API
        for (const [skuCode, thresholds] of changes) {
            const result = await updateSKUThresholds(skuCode, thresholds.reorderPoint, thresholds.minStockLevel);
            if (result.success) {
                successCount++;
            } else {
                failCount++;
                console.error(`Failed to update ${skuCode}:`, result.message);
            }
        }

        if (successCount > 0) {
            toast.success(`Successfully updated ${successCount} SKUs`);
            setPendingChanges({});
            await loadData();
        }

        if (failCount > 0) {
            toast.error(`Failed to update ${failCount} SKUs. Check console for details.`);
        }

        setSaving(false);
    };

    const filteredSKUs = useMemo(() => {
        return skus.filter(s =>
            s.skuCode.toLowerCase().includes(search.toLowerCase()) ||
            s.brand.toLowerCase().includes(search.toLowerCase()) ||
            s.model.toLowerCase().includes(search.toLowerCase()) ||
            s.size.toLowerCase().includes(search.toLowerCase())
        );
    }, [skus, search]);

    const hasChanges = Object.keys(pendingChanges).length > 0;

    return (
        <div className="flex flex-col gap-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-[88px] z-10 backdrop-blur-md bg-white/90">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search SKUs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={loadData}
                        disabled={loading || saving}
                        className="flex-1 sm:flex-none p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {hasChanges && (
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 font-bold"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save {Object.keys(pendingChanges).length} Changes
                        </button>
                    )}
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU & Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Current Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-teal-600 uppercase tracking-wider">Reorder Point</th>
                                <th className="px-6 py-4 text-xs font-bold text-red-600 uppercase tracking-wider">Min Stock Level</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8 h-16 bg-gray-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredSKUs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                        No SKUs found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredSKUs.map((sku) => {
                                    const pending = pendingChanges[sku.skuCode];
                                    const reorderVal = pending ? pending.reorderPoint : sku.reorderPoint;
                                    const minVal = pending ? pending.minStockLevel : sku.minStockLevel;
                                    const isLow = (sku.currentStock || 0) <= (minVal ?? 0);
                                    const isAtReorder = (sku.currentStock || 0) <= (reorderVal ?? 0);

                                    return (
                                        <tr key={sku.skuCode} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors uppercase">{sku.skuCode}</span>
                                                    <span className="text-sm text-gray-500">{sku.brand} • {sku.model} • {sku.size}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-bold ${isLow ? 'text-red-600' : isAtReorder ? 'text-yellow-600' : 'text-gray-900'}`}>
                                                        {sku.currentStock || 0}
                                                    </span>
                                                    {isLow ? <ShieldAlert className="w-4 h-4 text-red-500" /> : isAtReorder ? <AlertTriangle className="w-4 h-4 text-yellow-500" /> : <TrendingDown className="w-4 h-4 text-gray-300" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative max-w-[120px]">
                                                    <input
                                                        type="number"
                                                        value={reorderVal ?? ''}
                                                        onChange={(e) => handleThresholdChange(sku.skuCode, 'reorderPoint', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm font-bold transition-all ${pending?.reorderPoint !== undefined ? 'border-teal-400 bg-teal-50 ring-2 ring-teal-500/10' : 'border-gray-200 bg-white hover:border-teal-300'}`}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative max-w-[120px]">
                                                    <input
                                                        type="number"
                                                        value={minVal ?? ''}
                                                        onChange={(e) => handleThresholdChange(sku.skuCode, 'minStockLevel', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm font-bold transition-all ${pending?.minStockLevel !== undefined ? 'border-red-400 bg-red-50 ring-2 ring-red-500/10' : 'border-gray-200 bg-white hover:border-red-300'}`}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isLow ? (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Critical</span>
                                                ) : isAtReorder ? (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded uppercase">Low Stock</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Healthy</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Help Card */}
            <div className="bg-teal-50 border border-teal-100 p-6 rounded-xl flex gap-4 items-start shadow-sm">
                <AlertCircle className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-teal-900 mb-1 text-base">Managing Safety Stock Rules</h4>
                    <p className="text-sm text-teal-800 leading-relaxed">
                        Adjusting these values updates the rules for automatic system alerts.
                        <strong> Reorder Point</strong> should be slightly higher than <strong>Min Stock Level</strong> to account for
                        supplier lead times and delivery schedules.
                    </p>
                </div>
            </div>
        </div>
    );
}

function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}
