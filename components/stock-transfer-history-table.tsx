'use client';

import { useSKUsQuery } from "@/app/(pages)/stock/skus/query";
import { StockTransfer } from "@/types/inventory";
import { SKU } from "@/types/sku";
import {
    ArrowRightLeft,
    ChevronRight,
    MapPin,
    Truck,
    RefreshCw,
    Building2,
    Package,
    ArrowUpRight,
    ArrowDownLeft,
    Monitor,
    MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface StockTransferHistoryTableProps {
    history: StockTransfer[];
}

export function StockTransferHistoryTable({ history }: StockTransferHistoryTableProps) {
    const { data: skus } = useSKUsQuery();

    const columns: ColumnDef<StockTransfer>[] = [
        {
            accessorKey: "createdAt",
            header: () => <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Transaction Date</span>,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 text-xs tracking-tight">{format(row.original.createdAt, 'MMM dd, yyyy')}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{format(row.original.createdAt, 'HH:mm')}</span>
                </div>
            )
        },
        {
            id: "sku",
            header: () => <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Resource Profile</span>,
            cell: ({ row }) => {
                const sku = skus?.find((s: SKU) => s.id === row.original.skuId);
                return (
                    <div className="flex items-center gap-3 py-1">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-teal-600 transition-colors shadow-sm">
                            <Package className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col max-w-[200px] gap-0.5">
                            <span className="font-black text-gray-800 text-xs truncate leading-none">{sku?.brand} {sku?.model}</span>
                            <span className="text-[9px] font-bold text-gray-400 truncate uppercase tracking-tight">{sku?.size} | {sku?.skuCode}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "quantity",
            header: () => <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Distribution</span>,
            cell: ({ row }) => {
                const qty = row.original.quantity;
                const maxDisplay = 50; // Scaling factor for visual bar
                const percentage = Math.min((qty / maxDisplay) * 100, 100);

                return (
                    <div className="flex items-center gap-4 w-48">
                        <span className="font-black tabular-nums text-sm text-gray-900 w-8">{qty}</span>
                        <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    row.original.status === 'completed' ? "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.3)]" : "bg-gray-300"
                                )}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            }
        },
        {
            id: "routing",
            header: () => <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Movement Path</span>,
            cell: ({ row }) => {
                const isOut = row.original.type.toLowerCase().includes('out') || row.original.type.toLowerCase().includes('issue');
                return (
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center text-[10px]",
                            isOut ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                        )}>
                            {isOut ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-gray-500">
                            <span className="truncate max-w-[80px]">{row.original.fromLocationId || row.original.fromDealerId || '---'}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                            <span className="truncate max-w-[80px] font-bold text-gray-900">{row.original.toLocationId || row.original.toDealerId || row.original.toVehicleId || '---'}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "type",
            header: () => <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Vector</span>,
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{row.original.type}</span>
                    <div className="w-8 h-0.5 bg-gray-100 rounded-full" />
                </div>
            )
        },
        {
            accessorKey: "status",
            header: () => <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Approval</span>,
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        status === 'completed' ? "bg-green-50 text-green-700 border-green-100" :
                            status === 'pending' ? "bg-orange-50 text-orange-700 border-orange-100" :
                                "bg-red-50 text-red-700 border-red-100"
                    )}>
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            status === 'completed' ? "bg-green-500" :
                                status === 'pending' ? "bg-orange-500 animate-pulse" :
                                    "bg-red-500"
                        )} />
                        {status}
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: "",
            cell: () => (
                <div className="flex justify-end pr-2">
                    <button className="p-2 hover:bg-gray-50 rounded-xl transition-all group/btn text-gray-300 hover:text-gray-600 border border-transparent hover:border-gray-100">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={history}
        />
    );
}
