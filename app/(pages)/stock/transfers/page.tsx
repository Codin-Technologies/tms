'use client';

import { useState, useEffect } from "react";
import { useHeader } from '@/components/HeaderContext';
import { useSKUsQuery } from "../skus/query";
import { useSKUInventoryQuery } from "../inventory/query";
import { mockLocations, mockDealers, mockTransferHistory } from "@/data/inventory";
import { TransferType } from "@/types/inventory";
import {
    ArrowRightLeft,
    Warehouse,
    Truck,
    RefreshCw,
    Package,
    AlertCircle,
    CheckCircle2,
    Search,
    History,
    Plus,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import ManageLocationsDrawer from "@/components/manage-locations-drawer";
import ManageDealersDrawer from "@/components/manage-dealers-drawer";
import { StockTransferHistoryTable } from "@/components/stock-transfer-history-table";

export default function StockTransfersPage() {
    const { setHeader } = useHeader();
    const { data: skus } = useSKUsQuery();
    const { data: inventory } = useSKUInventoryQuery();

    // In-Page Tabs
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

    // State for New Transfer
    const [transferType, setTransferType] = useState<TransferType>('Internal Transfer');
    const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
    const [fromLocationId, setFromLocationId] = useState<string>("");
    const [toLocationId, setToLocationId] = useState<string>("");
    const [selectedDealerId, setSelectedDealerId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(0);
    const [reason, setReason] = useState("");

    // Drawers
    const [showManageLocations, setShowManageLocations] = useState(false);
    const [showManageDealers, setShowManageDealers] = useState(false);

    // Derived
    const selectedSku = skus?.find(s => s.id === selectedSkuId);
    const skuInventory = inventory?.find(i => i.id === selectedSkuId);
    const fromLocation = mockLocations.find(l => l.id === fromLocationId);
    const toLocation = mockLocations.find(l => l.id === toLocationId);
    const selectedDealer = mockDealers.find(d => d.id === selectedDealerId);
    const currentLocStock = skuInventory?.locations?.find(l => l.locationName === fromLocation?.name)?.available || 0;

    // Global Header Integration
    useEffect(() => {
        setHeader({
            title: 'Stock Transfers',
            subtitle: 'Orchestrate inventory movements across internal and external nodes',
        });
        return () => setHeader({});
    }, [setHeader]);

    const handleConfirm = () => {
        alert("Transfer initiated successfully! Transaction ID: TR-" + Math.floor(Math.random() * 100000));
        setQuantity(0);
        setSelectedSkuId(null);
    };

    return (
        <div className="mx-auto flex flex-col gap-6 w-full max-w-none pb-4 px-2">
            {/* KPI Stat Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Transfers"
                    value={mockTransferHistory.length}
                    trend={{ value: "+12%", isPositive: true }}
                    icon={<ArrowRightLeft className="w-5 h-5" />}
                    iconClassName="bg-blue-50 text-blue-600 border-blue-100"
                />
                <StatCard
                    title="Pending Approvals"
                    value="3"
                    badge={{ label: "Alert", variant: 'error' }}
                    icon={<AlertCircle className="w-5 h-5" />}
                    iconClassName="bg-red-50 text-red-600 border-red-100"
                />
                <StatCard
                    title="Available Stock"
                    value="5,128"
                    badge={{ label: "Active", variant: 'success' }}
                    icon={<CheckCircle className="w-5 h-5" />}
                    iconClassName="bg-green-50 text-green-600 border-green-100"
                />
                <StatCard
                    title="Low Stock SKUs"
                    value="23"
                    badge={{ label: "Monitor", variant: 'warning' }}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    iconClassName="bg-orange-50 text-orange-600 border-orange-100"
                />
                <StatCard
                    title="Safety Critical"
                    value="42"
                    badge={{ label: "Watch", variant: 'info' }}
                    icon={<ShieldCheck className="w-5 h-5" />}
                    iconClassName="bg-teal-50 text-teal-600 border-teal-100"
                />
            </div>

            {/* Main Workspace */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative min-h-[70vh]">
                {/* Tab Navigation & Toolbar */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${activeTab === 'new' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
                        >
                            <Plus className="w-3 h-3" /> New Transfer
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${activeTab === 'history' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
                        >
                            <History className="w-3 h-3" /> History
                        </button>
                    </div>

                    {activeTab === 'history' && (
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 group-focus-within:text-teal-600 transition-colors" />
                                <Input
                                    placeholder="Search transfers..."
                                    className="pl-9 h-10 w-64 bg-white border-gray-200 rounded-xl text-xs font-bold focus-visible:ring-teal-500"
                                />
                            </div>
                            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
                                <select className="bg-transparent text-[10px] font-black uppercase px-2 py-1 outline-none text-gray-500">
                                    <option>All Brands</option>
                                </select>
                                <div className="w-px h-4 bg-gray-200 my-auto" />
                                <select className="bg-transparent text-[10px] font-black uppercase px-2 py-1 outline-none text-gray-500">
                                    <option>All Sizes</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'new' ? (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
                                <div className="lg:col-span-8 space-y-8">
                                    {/* Section 1: Context */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-[0.2em] text-[10px]">
                                                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-[10px]">01</span>
                                                Transfer Context
                                            </h3>
                                            <Badge variant="outline" className="text-[9px] font-black uppercase bg-teal-50/50 text-teal-600 border-teal-100 tracking-tighter">Step 1 of 3</Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            <div className="space-y-3 font-bold">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Movement Type</label>
                                                <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5">
                                                    {[
                                                        { id: 'Internal Transfer', label: 'Internal', icon: Warehouse },
                                                        { id: 'Issue to Vehicle', label: 'Vehicle', icon: Truck },
                                                        { id: 'Send to Dealer', label: 'Dealer Out', icon: RefreshCw },
                                                        { id: 'Receive from Dealer', label: 'Dealer In', icon: Package },
                                                    ].map((t) => (
                                                        <button
                                                            key={t.id}
                                                            onClick={() => setTransferType(t.id as TransferType)}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${transferType === t.id ? 'bg-white border-teal-500 text-teal-600 shadow-sm ring-1 ring-teal-500' : 'bg-white border-transparent text-gray-400 hover:border-gray-200 hover:text-gray-600'}`}
                                                        >
                                                            <t.icon className="w-3.5 h-3.5" /> {t.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="md:col-span-3 space-y-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between px-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">From Location</label>
                                                        <button onClick={() => setShowManageLocations(true)} className="text-[10px] text-teal-600 font-extrabold hover:underline uppercase tracking-tight">Manage</button>
                                                    </div>
                                                    <select
                                                        className="w-full p-4 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none ring-teal-500 focus:ring-2"
                                                        value={fromLocationId}
                                                        onChange={(e) => setFromLocationId(e.target.value)}
                                                    >
                                                        <option value="">Select source...</option>
                                                        {mockLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between px-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To Destination</label>
                                                        {transferType.includes('Dealer') && <button onClick={() => setShowManageDealers(true)} className="text-[10px] text-teal-600 font-extrabold hover:underline uppercase tracking-tight">Manage</button>}
                                                    </div>
                                                    {transferType.includes('Dealer') ? (
                                                        <select
                                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none ring-teal-500 focus:ring-2"
                                                            value={selectedDealerId}
                                                            onChange={(e) => setSelectedDealerId(e.target.value)}
                                                        >
                                                            <option value="">Select partner dealer...</option>
                                                            {mockDealers.map(dlr => <option key={dlr.id} value={dlr.id}>{dlr.name} ({dlr.category})</option>)}
                                                        </select>
                                                    ) : (
                                                        <select
                                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none ring-teal-500 focus:ring-2"
                                                            value={toLocationId}
                                                            onChange={(e) => setToLocationId(e.target.value)}
                                                        >
                                                            <option value="">Select destination...</option>
                                                            {mockLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>)}
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: SKU */}
                                    <div className="space-y-4">
                                        <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-[0.2em] text-[10px]">
                                            <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-[10px]">02</span>
                                            SKU Selection
                                        </h3>
                                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-6">
                                            <select
                                                className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                                                value={selectedSkuId || ""}
                                                onChange={(e) => setSelectedSkuId(Number(e.target.value))}
                                            >
                                                <option value="">Select SKU Model...</option>
                                                {skus?.map(sku => <option key={sku.id} value={sku.id}>{sku.brand} {sku.model} - {sku.size}</option>)}
                                            </select>

                                            {selectedSku && (
                                                <div className="p-5 rounded-2xl bg-white border border-teal-100 shadow-sm flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                                                            <Package className="w-6 h-6" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Asset Details</p>
                                                            <p className="font-black text-gray-900 text-sm tracking-tight">{selectedSku.brand} {selectedSku.model}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{selectedSku.size}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock @ Source</p>
                                                        <p className="text-3xl font-black text-gray-900 tracking-tighter">{currentLocStock}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section 3: Quantity */}
                                    <div className="space-y-4">
                                        <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-[0.2em] text-[10px]">
                                            <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-[10px]">03</span>
                                            Quantity & Notes
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Units to Move</label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="text-3xl font-black h-16 rounded-2xl border-gray-200 focus:ring-teal-500 bg-white"
                                                        value={quantity === 0 ? "" : quantity}
                                                        onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-wider">Units</span>
                                                </div>
                                                {quantity > currentLocStock && (
                                                    <p className="text-[10px] text-red-500 font-black flex items-center gap-1.5 pl-1 uppercase italic">
                                                        <AlertCircle className="w-3 h-3" /> Insufficient stock
                                                    </p>
                                                )}
                                            </div>
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Audit Note</label>
                                                <textarea
                                                    rows={3}
                                                    className="w-full p-4 rounded-2xl bg-white border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none resize-none placeholder:text-gray-300"
                                                    placeholder="Reason for transfer..."
                                                    value={reason}
                                                    onChange={(e) => setReason(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 lg:sticky lg:top-6 lg:h-fit">
                                    <div className="space-y-6">
                                        <Card className="p-0 overflow-hidden shadow-xl border border-gray-100 rounded-2xl">
                                            <div className="bg-teal-600 p-6 text-white relative overflow-hidden">
                                                <div className="relative z-10 flex items-center justify-between">
                                                    <h4 className="font-black uppercase tracking-[0.2em] text-[10px]">Summary</h4>
                                                    <TrendingUp className="w-4 h-4 opacity-50" />
                                                </div>
                                                <div className="absolute top-0 right-0 p-4 opacity-10 scale-150">
                                                    <ArrowRightLeft className="w-24 h-24" />
                                                </div>
                                            </div>
                                            <div className="p-5 space-y-5">
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Payload</p>
                                                            <p className="text-lg font-black text-gray-900 tracking-tight">{quantity} Unit(s)</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight max-w-[150px] truncate">{selectedSku ? `${selectedSku.brand} ${selectedSku.model}` : 'No SKU Selected'}</p>
                                                        </div>
                                                        <Badge variant="outline" className="text-[8px] font-black uppercase text-teal-600 bg-teal-50/30 border-teal-100 tracking-tighter px-2">{transferType}</Badge>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Routing Path</p>
                                                        <div className="space-y-1.5">
                                                            <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 text-[11px] font-black text-gray-600 border border-gray-100">
                                                                <div className="w-5 h-5 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[9px] text-gray-400">A</div>
                                                                <span className="truncate">{fromLocation?.name || '---'}</span>
                                                            </div>
                                                            <div className="flex justify-center -my-2 relative z-10">
                                                                <div className="bg-white p-1 rounded-full border border-gray-100 shadow-sm">
                                                                    <ArrowRightLeft className="w-2 h-2 text-teal-500" />
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 text-[11px] font-black text-gray-600 border border-gray-100">
                                                                <div className="w-5 h-5 rounded-lg bg-teal-600 text-white flex items-center justify-center text-[9px]">B</div>
                                                                <span className="truncate">{transferType.includes('Dealer') ? selectedDealer?.name : toLocation?.name || '---'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 pt-6 border-t border-gray-50">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs font-bold">
                                                            <span className="text-gray-400 font-black uppercase tracking-tighter">Current</span>
                                                            <span className="text-gray-900">{currentLocStock}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs font-bold">
                                                            <span className="text-gray-400 font-black uppercase tracking-tighter">Impact</span>
                                                            <span className="text-red-500 font-black">-{quantity}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-3 mt-1 border-t border-dashed border-gray-100">
                                                            <span className="text-[10px] font-black text-teal-600 uppercase tracking-tighter">Proj. Bal.</span>
                                                            <span className="text-xl font-black text-teal-700 tracking-tighter">{currentLocStock - quantity}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {quantity > 0 && quantity <= currentLocStock && (
                                                    <div className="p-3 bg-teal-50/50 rounded-xl flex items-start gap-2 border border-teal-100">
                                                        <CheckCircle2 className="w-3 h-3 text-teal-600 mt-0.5 flex-shrink-0" />
                                                        <p className="text-[9px] font-bold text-teal-800 leading-tight uppercase tracking-tight">Operation valid.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <StockTransferHistoryTable history={mockTransferHistory} />
                        </div>
                    )}
                </div>

                {/* Integrated Sticky Footer - Only for 'new' tab */}
                {activeTab === 'new' && (
                    <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 px-8 flex flex-wrap gap-4 justify-between items-center z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] transition-all">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-0.5">Configuration</span>
                                <span className="text-xs font-black text-gray-900 uppercase tracking-wider">{quantity} unit move configured</span>
                            </div>
                            <div className="hidden sm:flex -space-x-1.5">
                                <div className="w-5 h-5 rounded-full bg-teal-500 border border-white flex items-center justify-center text-[9px] text-white font-black shadow-sm">1</div>
                                <div className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-black shadow-sm ${selectedSkuId ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
                                <div className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-black shadow-sm ${quantity > 0 ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => { setSelectedSkuId(null); setQuantity(0); }} className="text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-xl">
                                Discard
                            </Button>
                            <Button
                                disabled={!selectedSkuId || (!toLocationId && !selectedDealerId) || quantity === 0 || quantity > currentLocStock}
                                onClick={handleConfirm}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-10 h-10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
                            >
                                Execute Transfer
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {showManageLocations && <ManageLocationsDrawer onClose={() => setShowManageLocations(false)} />}
            {showManageDealers && <ManageDealersDrawer onClose={() => setShowManageDealers(false)} />}
        </div>
    );
}
