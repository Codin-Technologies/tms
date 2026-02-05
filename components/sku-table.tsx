'use client';

import { useSKUsQuery } from "@/app/(pages)/inventory/query";
import { DataTable } from "@/components/ui/data-table";
import { SKU } from "@/types/sku";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { deleteSKU } from "@/actions/sku";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ui/confirm-dialog";

export function SKUTable({ onAdd, onReceiveStock }: { onAdd?: () => void, onReceiveStock?: (sku: SKU) => void }) {
    const { isLoading, error, data: skus } = useSKUsQuery();
    const queryClient = useQueryClient();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteCode, setConfirmDeleteCode] = useState<string | null>(null);

    const handleDelete = async (skuCode: string) => {
        setDeletingId(skuCode);
        const result = await deleteSKU(skuCode);
        setDeletingId(null);
        setConfirmDeleteCode(null);

        if (result.success) {
            toast.success("SKU deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["skus"] });
            queryClient.invalidateQueries({ queryKey: ["sku-inventory"] });
        } else {
            toast.error(result.message || "Failed to delete SKU");
        }
    };

    const columns: ColumnDef<SKU>[] = [
        {
            accessorKey: "skuCode",
            header: "SKU / Type",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link href={`/stock/inventory/${row.original.skuCode}`} className="text-teal-600 font-black hover:underline tracking-tight">
                        {row.original.skuCode}
                    </Link>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{row.original.category || 'All Position'}</span>
                </div>
            )
        },
        {
            accessorKey: "brand",
            header: "Manufacturer",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                        {row.original.brand.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-700">{row.original.brand}</span>
                </div>
            )
        },
        {
            accessorKey: "model",
            header: "Model",
            cell: ({ row }) => <span className="font-medium text-gray-600">{row.original.model}</span>
        },
        {
            accessorKey: "size",
            header: "Configuration",
            cell: ({ row }) => <Badge variant="outline" className="font-mono text-[11px] bg-white">{row.original.size}</Badge>
        },
        {
            accessorKey: "currentStock",
            header: "Quantity",
            cell: ({ row }) => {
                const stock = row.original.currentStock || 0;
                const reorder = row.original.reorderPoint || 0;
                const isLow = stock <= reorder;

                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className={`font-black ${isLow ? 'text-amber-700' : 'text-gray-900'}`}>{stock}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Operational Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const active = status === 'active';

                return (
                    <Badge className={`${active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-600 border-gray-100'} border font-bold text-[10px] uppercase tracking-wider`}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-teal-700 border-teal-200 hover:bg-teal-50 font-bold text-[11px]"
                        onClick={() => onReceiveStock?.(row.original)}
                    >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Stock
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setConfirmDeleteCode(row.original.skuCode)}
                        disabled={deletingId === row.original.skuCode}
                    >
                        {deletingId === row.original.skuCode ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <DataTable
                columns={columns}
                data={skus || []}
                title={"SKU Catalog"}
                onAdd={onAdd}
            />

            <ConfirmDialog
                isOpen={!!confirmDeleteCode}
                onClose={() => setConfirmDeleteCode(null)}
                onConfirm={() => confirmDeleteCode && handleDelete(confirmDeleteCode)}
                title="Delete SKU Master Data"
                description={`Are you sure you want to delete ${confirmDeleteCode}? This will permanently remove the tire technical identity from the catalog. This action cannot be undone.`}
                confirmText="Delete SKU"
                isLoading={!!deletingId}
                variant="danger"
            />
        </>
    );
}
