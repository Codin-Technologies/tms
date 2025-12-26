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
    MapPin,
    Building2,
    ArrowUpRight,
    ArrowDownLeft,
    X,
    Info,
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
        setFromLocationId("");
        setToLocationId("");
        setSelectedDealerId("");
        setReason("");
    };

    const handleReset = () => {
        setSelectedSkuId(null);
        setQuantity(0);
        setFromLocationId("");
        setToLocationId("");
        setSelectedDealerId("");
        setReason("");
    };

    const transferTypes = [
        { id: 'Internal Transfer', label: 'Internal Transfer', icon: Warehouse, description: 'Move between locations', color: 'bg-blue-500' },
        { id: 'Issue to Vehicle', label: 'Issue to Vehicle', icon: Truck, description: 'Assign to vehicle', color: 'bg-green-500' },
        { id: 'Send to Dealer', label: 'Send to Dealer', icon: ArrowUpRight, description: 'Outbound to dealer', color: 'bg-orange-500' },
        { id: 'Receive from Dealer', label: 'Receive from Dealer', icon: ArrowDownLeft, description: 'Inbound from dealer', color: 'bg-purple-500' },
    ];

    const isFormValid = selectedSkuId && fromLocationId && (toLocationId || selectedDealerId) && quantity > 0 && quantity <= currentLocStock;

    // Get recent transfers for sidebar
    const recentTransfers = mockTransferHistory.slice(0, 3);
    const pendingTransfers = mockTransferHistory.filter(t => t.status === 'pending').length;
    const completedToday = mockTransferHistory.filter(t => {
        const today = new Date();
        const transferDate = new Date(t.createdAt);
        return transferDate.toDateString() === today.toDateString() && t.status === 'completed';
    }).length;

    return (
        <div className="mx-auto flex flex-col gap-6">
            {/* Main Workspace */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setActiveTab('new')}
                                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-md transition-all ${
                                    activeTab === 'new' 
                                        ? 'bg-teal-600 text-white shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <Plus className="w-4 h-4" />
                                New Transfer
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-md transition-all ${
                                    activeTab === 'history' 
                                        ? 'bg-teal-600 text-white shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <History className="w-4 h-4" />
                                History
                            </button>
                        </div>

                        {activeTab === 'history' && (
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search transfers..."
                                        className="pl-10 h-10 w-64 bg-white border-gray-200 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'new' ? (
                        <div className="p-6 lg:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Form Section */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Step 1: Transfer Type */}
                                    <Card className="p-6 border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                                                1
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Transfer Type</h3>
                                                <p className="text-sm text-gray-500">Select the type of movement</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {transferTypes.map((type) => {
                                                const Icon = type.icon;
                                                const isSelected = transferType === type.id;
                                                return (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => setTransferType(type.id as TransferType)}
                                                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                            isSelected
                                                                ? 'border-teal-500 bg-teal-50 shadow-sm'
                                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-10 h-10 rounded-lg ${type.color} text-white flex items-center justify-center flex-shrink-0`}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-semibold text-sm ${isSelected ? 'text-teal-900' : 'text-gray-900'}`}>
                                                                    {type.label}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                                                            </div>
                                                            {isSelected && (
                                                                <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </Card>

                                    {/* Step 2: Locations */}
                                    <Card className="p-6 border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                                fromLocationId ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                                2
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Locations</h3>
                                                <p className="text-sm text-gray-500">Select source and destination</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium text-gray-700">From Location</label>
                                                    <button 
                                                        onClick={() => setShowManageLocations(true)} 
                                                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                                    >
                                                        Manage Locations
                                                    </button>
                                                </div>
                                                <select
                                                    className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                                    value={fromLocationId}
                                                    onChange={(e) => setFromLocationId(e.target.value)}
                                                >
                                                    <option value="">Select source location...</option>
                                                    {mockLocations.map(loc => (
                                                        <option key={loc.id} value={loc.id}>
                                                            {loc.name} ({loc.type})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex justify-center py-2">
                                                <div className="w-10 h-10 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center">
                                                    <ArrowRightLeft className="w-5 h-5 text-teal-600" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        {transferType.includes('Dealer') ? 'To Dealer' : 'To Location'}
                                                    </label>
                                                    {transferType.includes('Dealer') && (
                                                        <button 
                                                            onClick={() => setShowManageDealers(true)} 
                                                            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                                        >
                                                            Manage Dealers
                                                        </button>
                                                    )}
                                                </div>
                                                {transferType.includes('Dealer') ? (
                                                    <select
                                                        className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                                        value={selectedDealerId}
                                                        onChange={(e) => setSelectedDealerId(e.target.value)}
                                                    >
                                                        <option value="">Select dealer...</option>
                                                        {mockDealers.map(dlr => (
                                                            <option key={dlr.id} value={dlr.id}>
                                                                {dlr.name} ({dlr.category})
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <select
                                                        className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                                        value={toLocationId}
                                                        onChange={(e) => setToLocationId(e.target.value)}
                                                    >
                                                        <option value="">Select destination...</option>
                                                        {mockLocations.map(loc => (
                                                            <option key={loc.id} value={loc.id}>
                                                                {loc.name} ({loc.type})
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Step 3: SKU Selection */}
                                    <Card className="p-6 border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                                selectedSkuId ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                                3
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">SKU Selection</h3>
                                                <p className="text-sm text-gray-500">Choose the product to transfer</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <select
                                                className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                                value={selectedSkuId || ""}
                                                onChange={(e) => setSelectedSkuId(Number(e.target.value))}
                                            >
                                                <option value="">Select SKU...</option>
                                                {skus?.map(sku => (
                                                    <option key={sku.id} value={sku.id}>
                                                        {sku.brand} {sku.model} - {sku.size}
                                                    </option>
                                                ))}
                                            </select>

                                            {selectedSku && (
                                                <div className="p-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg border border-teal-100">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                                <Package className="w-6 h-6 text-teal-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{selectedSku.brand} {selectedSku.model}</p>
                                                                <p className="text-sm text-gray-600">{selectedSku.size}</p>
                                                                <p className="text-xs text-gray-500 mt-1">SKU: {selectedSku.skuCode}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500 font-medium mb-1">Available Stock</p>
                                                            <p className="text-2xl font-bold text-teal-600">{currentLocStock}</p>
                                                            <p className="text-xs text-gray-400">units</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>

                                    {/* Step 4: Quantity & Notes */}
                                    <Card className="p-6 border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                                quantity > 0 && quantity <= currentLocStock ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                                4
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Quantity & Notes</h3>
                                                <p className="text-sm text-gray-500">Specify amount and reason</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Quantity</label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="h-14 text-2xl font-bold text-center pr-12 border-gray-300 focus:ring-2 focus:ring-teal-500"
                                                        value={quantity === 0 ? "" : quantity}
                                                        onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                                        placeholder="0"
                                                        min="0"
                                                        max={currentLocStock}
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                                                        units
                                                    </span>
                                                </div>
                                                {quantity > currentLocStock && (
                                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span>Insufficient stock available</span>
                                                    </div>
                                                )}
                                                {quantity > 0 && quantity <= currentLocStock && (
                                                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Stock available</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Reason / Notes</label>
                                                <textarea
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none placeholder:text-gray-400"
                                                    placeholder="Enter reason for transfer..."
                                                    value={reason}
                                                    onChange={(e) => setReason(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Summary Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="lg:sticky lg:top-6 space-y-6">
                                        {/* Transfer Summary Card */}
                                        <Card className="p-6 border-gray-200 shadow-lg bg-gradient-to-br from-teal-50 to-white">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="font-semibold text-gray-900">Transfer Summary</h4>
                                                <TrendingUp className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <div className="space-y-6">
                                                {/* Transfer Details */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium mb-2">TRANSFER TYPE</p>
                                                        <Badge variant="outline" className="bg-white text-teal-700 border-teal-200">
                                                            {transferType}
                                                        </Badge>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium mb-2">QUANTITY</p>
                                                        <p className="text-2xl font-bold text-gray-900">{quantity || 0}</p>
                                                        {selectedSku && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {selectedSku.brand} {selectedSku.model}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Routing Path */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium mb-3">ROUTING PATH</p>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                                    A
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700 flex-1">
                                                                    {fromLocation?.name || 'Not selected'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-center">
                                                                <ArrowRightLeft className="w-5 h-5 text-teal-600" />
                                                            </div>
                                                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                                                                    B
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700 flex-1">
                                                                    {transferType.includes('Dealer') 
                                                                        ? (selectedDealer?.name || 'Not selected')
                                                                        : (toLocation?.name || 'Not selected')
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stock Impact */}
                                                {selectedSkuId && fromLocationId && (
                                                    <div className="pt-6 border-t border-gray-200 space-y-3">
                                                        <p className="text-xs text-gray-500 font-medium">STOCK IMPACT</p>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Current Stock</span>
                                                                <span className="font-semibold text-gray-900">{currentLocStock}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Transfer Out</span>
                                                                <span className="font-semibold text-red-600">-{quantity}</span>
                                                            </div>
                                                            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                                                                <span className="text-sm font-medium text-teal-700">Projected Balance</span>
                                                                <span className="text-xl font-bold text-teal-600">
                                                                    {Math.max(0, currentLocStock - quantity)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Validation Status */}
                                                {isFormValid && (
                                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-green-900">Ready to Transfer</p>
                                                            <p className="text-xs text-green-700 mt-0.5">All requirements met</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>

                                        {/* Quick Stats Card */}
                                        <Card className="p-6 border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-900">Quick Stats</h4>
                                                <History className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                                        <span className="text-sm text-gray-600">Pending</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{pendingTransfers}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                        <span className="text-sm text-gray-600">Completed Today</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{completedToday}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                        <span className="text-sm text-gray-600">Total Transfers</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{mockTransferHistory.length}</span>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Recent Transfers Card */}
                                        <Card className="p-6 border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-900">Recent Transfers</h4>
                                                <button 
                                                    onClick={() => setActiveTab('history')}
                                                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                                >
                                                    View All
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {recentTransfers.length > 0 ? (
                                                    recentTransfers.map((transfer, index) => {
                                                        const sku = skus?.find((s: any) => s.id === transfer.skuId);
                                                        return (
                                                            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                                            {sku ? `${sku.brand} ${sku.model}` : 'Unknown SKU'}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                                            {transfer.quantity} units • {transfer.type}
                                                                        </p>
                                                                    </div>
                                                                    <Badge 
                                                                        variant="outline"
                                                                        className={`text-xs ${
                                                                            transfer.status === 'completed' 
                                                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                                                : transfer.status === 'pending'
                                                                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                                                                : 'bg-red-50 text-red-700 border-red-200'
                                                                        }`}
                                                                    >
                                                                        {transfer.status}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-sm text-gray-500 text-center py-4">No recent transfers</p>
                                                )}
                                            </div>
                                        </Card>

                                        {/* Help/Info Card */}
                                        <Card className="p-6 border-gray-200 shadow-sm bg-blue-50/50">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <Info className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-2">Transfer Tips</h4>
                                                    <ul className="space-y-1.5 text-xs text-gray-600">
                                                        <li className="flex items-start gap-2">
                                                            <span className="text-blue-600 mt-0.5">•</span>
                                                            <span>Verify stock availability before transfer</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="text-blue-600 mt-0.5">•</span>
                                                            <span>Add notes for audit trail</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="text-blue-600 mt-0.5">•</span>
                                                            <span>Check destination capacity</span>
                                                        </li>
                                                    </ul>
                                                </div>
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

                {/* Sticky Footer - Only for 'new' tab */}
                {activeTab === 'new' && (
                    <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-6 py-4 flex flex-wrap gap-4 justify-between items-center shadow-lg">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium">Status</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {isFormValid ? 'Ready to transfer' : 'Complete all steps'}
                                </span>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                {[1, 2, 3, 4].map((step) => {
                                    const isComplete = 
                                        (step === 1) ||
                                        (step === 2 && fromLocationId && (toLocationId || selectedDealerId)) ||
                                        (step === 3 && selectedSkuId) ||
                                        (step === 4 && quantity > 0 && quantity <= currentLocStock);
                                    return (
                                        <div
                                            key={step}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                isComplete
                                                    ? 'bg-teal-600 text-white shadow-sm'
                                                    : 'bg-gray-200 text-gray-400'
                                            }`}
                                        >
                                            {step}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={handleReset}
                                className="px-6"
                            >
                                Reset
                            </Button>
                            <Button
                                disabled={!isFormValid}
                                onClick={handleConfirm}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-8 shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
