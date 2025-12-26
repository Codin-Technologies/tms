"use client";

import { useState, useEffect } from "react";
import { useHeader } from '@/components/HeaderContext';
import { Button } from "@/components/ui/button";
import { useSKUsQuery } from "../query";
import { useSKUInventoryQuery } from "../../inventory/query";
import { useParams } from "next/navigation";
import {
    Package, MapPin, List, History, Activity,
    AlertCircle, ShieldCheck, Truck, Wrench,
    RefreshCw, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SkuInventoryByLocation } from "@/components/sku-inventory-by-location";
import { SkuInstalledOnVehicles } from "@/components/sku-installed-on-vehicles";
import { SkuConditionSummary } from "@/components/sku-condition-summary";
import { SkuLifecycleSummary } from "@/components/sku-lifecycle-summary";

export default function SKUDetailPage() {
    const { id } = useParams();
    const { data: skus } = useSKUsQuery();
    const { data: inventory } = useSKUInventoryQuery();
    const sku = skus?.find(s => s.id === Number(id));
    const inventoryItem = inventory?.find(i => i.id === Number(id));
    const { setHeader } = useHeader();
    const [activeTab, setActiveTab] = useState<'location' | 'vehicles' | 'tires' | 'history'>('location');

    useEffect(() => {
        if (sku) {
            setHeader({
                title: (
                    <div className="flex items-center gap-3">
                        {sku.brand} {sku.model}
                        {sku.isSafetyCritical && (
                            <Badge className="bg-red-50 text-red-700 border-red-200 shadow-sm animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Safety-Critical
                            </Badge>
                        )}
                    </div>
                ),
                subtitle: (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md border text-gray-700">SKU: <span className="font-bold">{sku.skuCode}</span></span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">Size: <span className="font-bold text-gray-700">{sku.size}</span></span>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize font-bold border-teal-200 text-teal-700 bg-teal-50/30">{sku.category}</Badge>
                            <Badge variant="outline" className="font-bold border-blue-200 text-blue-700 bg-blue-50/30">{sku.retreadable ? 'Retreadable' : 'Non-Retreadable'}</Badge>
                        </div>
                    </div>
                ),
                actions: (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="font-bold shadow-sm">Receive</Button>
                        <Button variant="outline" size="sm" className="font-bold shadow-sm">Transfer</Button>
                        <Button size="sm" className="font-bold shadow-sm bg-teal-600 hover:bg-teal-700 text-white">Issue</Button>
                        <Button size="sm" variant="danger" className="font-bold shadow-sm">Reorder</Button>
                    </div>
                )
            });
        }
        return () => setHeader({});
    }, [setHeader, sku]);

    if (!sku) return <div className="p-8 text-center text-gray-500 font-medium">Loading SKU details...</div>;

    const tabs: { id: 'location' | 'vehicles' | 'tires' | 'history'; label: string; icon: any }[] = [
        { id: 'location', label: 'By Location', icon: MapPin },
        { id: 'vehicles', label: 'By Vehicle', icon: Truck },
        { id: 'tires', label: 'Individual Tires', icon: List },
        { id: 'history', label: 'Movement History', icon: History },
    ];

    return (
        <div className="mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Tires', value: inventoryItem?.inventorySummary?.total || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'In Inventory', value: inventoryItem?.inventorySummary?.inInventory || 0, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                    { label: 'On Vehicles', value: inventoryItem?.inventorySummary?.onVehicles || 0, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                    { label: 'Inspection', value: inventoryItem?.inventorySummary?.underInspection || 0, icon: Wrench, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
                    { label: 'Quarantined', value: inventoryItem?.inventorySummary?.quarantined || 0, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                ].map((kpi) => (
                    <div key={kpi.label} className={`bg-white p-5 rounded-2xl shadow-sm border ${kpi.border} hover:shadow-md transition-all duration-300 cursor-pointer group`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-xl ${kpi.bg} group-hover:scale-110 transition-transform`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            </div>
                            <span className="text-3xl font-black text-gray-900 tabular-nums tracking-tighter">{kpi.value}</span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Condition Summary */}
                <div className="lg:col-span-1">
                    <SkuConditionSummary data={{ good: 85, warning: 10, critical: 5 }} />
                </div>
                {/* Lifecycle Stage */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-widest">Lifecycle Stage Breakdown</h3>
                    <div className="w-full">
                        <SkuLifecycleSummary data={{ inStock: 70, inService: 30, underRepair: 5, retreaded: 10, scrapped: 5 }} />
                    </div>
                </div>
            </div>

            {/* Main Tabs Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                <div className="flex border-b border-gray-100 bg-gray-50/40 p-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-8 py-4 text-sm font-bold transition-all rounded-t-2xl m-1 ${activeTab === tab.id
                                ? 'bg-white text-teal-600 shadow-sm ring-1 ring-gray-100 -mb-[5px] pb-5'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-teal-500' : 'text-gray-300'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-8 flex-1">
                    {activeTab === 'location' && (
                        <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2.5 text-gray-800">
                                    <div className="p-2 bg-teal-50 rounded-lg"><MapPin className="w-5 h-5 text-teal-600" /></div>
                                    Distribution by Location
                                </h3>
                                <Badge variant="outline" className="font-bold text-gray-400">Stock Integrity: 100%</Badge>
                            </div>
                            <SkuInventoryByLocation locations={inventoryItem?.locations || []} />
                        </div>
                    )}

                    {activeTab === 'vehicles' && (
                        <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2.5 text-gray-800">
                                    <div className="p-2 bg-indigo-50 rounded-lg"><Truck className="w-5 h-5 text-indigo-600" /></div>
                                    Operational Usage (Fleet)
                                </h3>
                                <div className="flex gap-2">
                                    <Badge className="bg-purple-50 text-purple-600 border-purple-100 font-bold">3 Steer Positions</Badge>
                                </div>
                            </div>
                            <SkuInstalledOnVehicles vehicles={inventoryItem?.vehicles || []} />
                        </div>
                    )}

                    {activeTab === 'tires' && (
                        <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold flex items-center gap-2.5 text-gray-800">
                                    <div className="p-2 bg-blue-50 rounded-lg"><List className="w-5 h-5 text-blue-600" /></div>
                                    Individual Tire Registry
                                </h3>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold px-3">
                                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Auditor Restricted Access
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="border border-gray-100 rounded-2xl p-5 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer group bg-white relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-1 h-full ${i % 3 === 0 ? 'bg-indigo-400' : 'bg-green-400'}`}></div>
                                        <div className="flex justify-between mb-4">
                                            <span className="font-mono text-[10px] font-bold text-gray-300 tracking-wider">UNIT: {sku.skuCode.split('-')[0]}-{1000 + i}</span>
                                            <Badge className={`text-[10px] font-bold px-2 py-0 ${i % 3 === 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                                {i % 3 === 0 ? 'Assigned' : 'In Stock'}
                                            </Badge>
                                        </div>
                                        <div className="mb-4">
                                            <h4 className="text-base font-black text-gray-800 tracking-tight">SN: {sku.skuCode.slice(0, 3)}-{2025000 + i}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">PURCHASED: JAN 2025</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Last Insp.</span>
                                                <span className="text-[11px] font-bold text-gray-600">{i} days ago</span>
                                            </div>
                                            <span className="text-[10px] font-black text-teal-600 group-hover:translate-x-1 transition-transform uppercase tracking-tighter">Drill-Down →</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
                            <div className="p-6 bg-gray-50 rounded-full mb-6">
                                <History className="w-16 h-16 text-gray-200" />
                            </div>
                            <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase">Audit Logs & Movement</h4>
                            <p className="text-gray-400 max-w-sm mt-3 text-sm font-medium">Detailed chronological inventory transaction logs for this SKU will populate as movements occur in the system.</p>
                            <Button variant="outline" className="mt-8 font-bold border-2">Generate Report (CSV)</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
