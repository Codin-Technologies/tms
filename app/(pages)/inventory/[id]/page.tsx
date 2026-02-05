"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchSKUDetails, fetchSKUTires } from "@/actions/sku";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHeader } from "@/components/HeaderContext";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    ArrowLeft,
    Box,
    CheckCircle,
    Truck,
    AlertTriangle,
    Activity,
    Calendar,
    DollarSign,
    PackagePlus,
    Download,
    History,
    Search,
    RefreshCw,
    Package,
    ArrowRightLeft,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Info,
    Warehouse,
    ClipboardList,
    Gauge,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ReceiveStockModal from "@/components/receive-stock-modal";
import { mockTransferHistory } from "@/data/inventory";
import { StockTransferHistoryTable } from "@/components/stock-transfer-history-table";
import * as XLSX from "xlsx";
import { format } from "date-fns";

export default function SKUDetailsPage() {
    const params = useParams();
    const skuCode = params.id as string;
    const { setHeader } = useHeader();
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

    const { data: skuData, isLoading: isSkuLoading } = useQuery({
        queryKey: ["sku", skuCode],
        queryFn: async () => {
            const result = await fetchSKUDetails(skuCode);
            if (!result.success) throw new Error(result.message);
            return result.data;
        }
    });

    const { data: tiresData, isLoading: isTiresLoading } = useQuery({
        queryKey: ["sku-tires", skuCode],
        queryFn: async () => {
            const result = await fetchSKUTires(skuCode);
            return result.data || [];
        },
        enabled: !!skuCode
    });

    const handleExportTires = () => {
        if (!tiresData || tiresData.length === 0) {
            alert("No data available to export.");
            return;
        }

        // Prepare data for Excel
        const exportData = tiresData.map((tire: any) => ({
            "Tire Serial": tire.serialNumber || tire.serial_number || "N/A",
            "DOT Code": tire.dotCode || tire.dot_code || "N/A",
            "Mfg Week": tire.manufacturingWeek || tire.manufacture_week || "N/A",
            "Mfg Year": tire.manufacturingYear || tire.manufacture_year || "N/A",
            "Status": (tire.status || "UNKNOWN").toUpperCase(),
            "Condition": (tire.condition || "N/A").toUpperCase(),
            "Location": tire.location?.name || tire.location || "Warehouse"
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tire Registry");

        // Generate filename
        const dateStr = format(new Date(), "yyyy-MM-dd");
        const filename = `${skuData?.sku_code || skuCode}_tire_registry_${dateStr}.xlsx`;

        XLSX.writeFile(workbook, filename);
    };

    useEffect(() => {
        const title = skuData?.sku_code || skuCode;
        const brandModel = skuData ? `${skuData.brand} ${skuData.model}` : '';
        const size = skuData?.size ? ` • ${skuData.size}` : '';
        const category = skuData?.category ? ` • ${skuData.category}` : '';

        setHeader({
            title: title,
            subtitle: skuData ? `${brandModel}${size}${category}` : 'Asset Master',
            backButton: (
                <Link href="/inventory" className="flex items-center text-gray-400 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            ),
            actions: (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-white"
                        onClick={handleExportTires}
                        disabled={isTiresLoading || !tiresData?.length}
                    >
                        <Download className="w-4 h-4" />
                        Export Data
                    </Button>
                    <Button
                        onClick={() => setIsReceiveModalOpen(true)}
                        className="gap-2 bg-teal-600 hover:bg-teal-700 shadow-md"
                    >
                        <PackagePlus className="w-4 h-4" />
                        Receive Stock
                    </Button>
                </div>
            )
        });
        return () => setHeader({});
    }, [setHeader, skuCode, skuData]);


    if (isSkuLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="text-gray-500 font-medium tracking-tight">Synchronizing SKU intelligence...</p>
        </div>
    );

    if (!skuData) return (
        <div className="p-12 text-center space-y-6">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">SKU Intelligence Missing</h3>
                <p className="text-gray-500">We couldn't find the requested SKU records in the master database.</p>
            </div>
            <Link href="/inventory">
                <Button variant="outline">Return to Catalog</Button>
            </Link>
        </div>
    );

    const sku = skuData;
    const skuHistory = mockTransferHistory.filter(t => t.skuId === sku.id || t.skuId === sku.sku_code);

    const tireColumns: ColumnDef<any>[] = [
        {
            accessorKey: "serialNumber",
            header: "Tire ID / Serial",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 font-mono tracking-tighter">
                        {row.original.serialNumber || row.original.serial_number || 'T-REXPANT-' + row.index}
                    </span>
                    <span className="text-[10px] text-gray-400">Barcode Registered</span>
                </div>
            )
        },
        {
            accessorKey: "dotCode",
            header: "DOT / Mfg",
            cell: ({ row }) => {
                const dot = row.original.dotCode || row.original.dot_code;
                const week = row.original.manufacturingWeek || row.original.manufacture_week;
                const year = row.original.manufacturingYear || row.original.manufacture_year;

                return (
                    <div className="flex flex-col">
                        <span className="font-mono text-gray-700">{dot || 'N/A'}</span>
                        {week && year && (
                            <span className="text-[10px] text-gray-500 italic">WK {week}/{year}</span>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Presence",
            cell: ({ row }) => {
                const status = (row.original.status || '').toUpperCase();
                let color = "bg-gray-100 text-gray-600 border-gray-200";
                if (status === 'AVAILABLE') color = "bg-emerald-50 text-emerald-700 border-emerald-200";
                if (status === 'MOUNTED') color = "bg-blue-50 text-blue-700 border-blue-200";
                if (status === 'SCRAPPED') color = "bg-rose-50 text-rose-700 border-rose-200";

                return (
                    <Badge variant="outline" className={`${color} px-2 py-0 border font-bold text-[10px] uppercase tracking-wider`}>
                        {status || 'Unknown'}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "condition",
            header: "Life Cycle",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${row.original.condition === 'NEW' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                    <span className="text-xs font-medium text-gray-700">{row.original.condition}</span>
                </div>
            )
        },
        {
            accessorKey: "location",
            header: "Current Registry",
            cell: ({ row }) => {
                const loc = row.original.warehouse?.name || row.original.location?.name || row.original.location_id;
                return (
                    <div className="flex items-center gap-2 group">
                        <Search className="w-3 h-3 text-gray-300 group-hover:text-teal-500" />
                        <span className="text-sm text-gray-600 truncate max-w-[150px]">{loc || 'Transit'}</span>
                    </div>
                )
            }
        }
    ];

    const mountedCount = tiresData?.filter((t: any) => t.status?.toUpperCase() === 'MOUNTED').length || 0;
    const availableCount = tiresData?.filter((t: any) => t.status?.toUpperCase() === 'AVAILABLE').length || 0;
    const inspectionCount = tiresData?.filter((t: any) => t.status?.toUpperCase() === 'INSPECTION').length || 0;
    const scrappedCount = tiresData?.filter((t: any) => t.status?.toUpperCase() === 'SCRAPPED').length || 0;
    const totalTires = tiresData?.length || 0;
    const utilizationRate = totalTires > 0 ? Math.round((mountedCount / totalTires) * 100) : 0;

    return (
        <div className="flex flex-col gap-6 w-full pb-12 px-2 lg:px-6">
            {/* Main Workspace with Consoliated View */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 lg:p-8">
                <div className="space-y-12">
                    {/* Section 2: Technical & Stock Intelligence */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-teal-600 rounded-full" />
                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Stock Intelligence</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 border-gray-200 shadow-sm bg-white">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                                        <Gauge className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Stock Context</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500 font-medium">Reorder Point</span>
                                        <span className="font-black text-gray-900">{sku.reorder_point} Units</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 font-medium">Safety Stock</span>
                                        <span className="font-black text-gray-900 text-rose-600">{sku.min_stock_level || 5} Units</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 border-gray-200 shadow-sm bg-white">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                        <RefreshCw className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Life Cycle</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500 font-medium">Max Retreads</span>
                                        <span className="font-black text-gray-900">{sku.max_retread_cycles || 3}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 font-medium">Pull Depth</span>
                                        <span className="font-black text-gray-900">{sku.min_tread_depth || 3} mm</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 border-gray-200 shadow-md bg-teal-600 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <ShieldCheck className="w-5 h-5 text-teal-100" />
                                    <h4 className="font-bold">Inventory Now</h4>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-4xl font-black tracking-tighter">{skuData.current_stock || 0}</p>
                                    <p className="text-[10px] font-bold text-teal-100 uppercase tracking-widest mt-1">Total System Load</p>

                                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-xs font-bold text-teal-50">Available</p>
                                            <p className="text-xl font-black">{availableCount}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-teal-50">Deployed</p>
                                            <p className="text-xl font-black">{mountedCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {skuData.current_stock <= sku.reorder_point && (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-4">
                                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-orange-900 uppercase">Procurement Required</p>
                                    <p className="text-xs text-orange-700 font-medium">Stock below safety threshold of {sku.reorder_point} units. Initiate restock flow.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 3: Fleet Registry */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-6 bg-blue-600 rounded-full" />
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Active Asset Registry</h3>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                                {tiresData?.length || 0} TRACKED SERIALS
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                            <DataTable
                                columns={tireColumns}
                                data={tiresData || []}
                                title=""
                            />
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 4: Movement History */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-amber-500 rounded-full" />
                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Chain of Custody History</h3>
                        </div>
                        <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-1">
                            <StockTransferHistoryTable history={skuHistory} />
                        </div>
                    </section>
                </div>
            </div>

            {/* Receive Modal Integration */}
            {isReceiveModalOpen && (
                <ReceiveStockModal
                    onCancel={() => setIsReceiveModalOpen(false)}
                    onSuccess={() => {
                        setIsReceiveModalOpen(false);
                    }}
                    initialSkuId={sku.id || sku.sku_code}
                />
            )}
        </div>
    );
}
