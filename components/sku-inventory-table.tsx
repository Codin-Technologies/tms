'use client';

import { useState } from "react";
import { useSKUInventoryQuery } from "@/app/(pages)/stock/inventory/query";
import { DataTable } from "@/components/ui/data-table";
import { SKUInventoryOverview } from "@/types/sku";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Plus, Download, ClipboardList } from "lucide-react";
import ReceiveStockModal from "./receive-stock-modal";
import IssueTiresModal from "./issue-tires-modal";
import Link from "next/link";

export function SKUInventoryTable() {
    const { isLoading, error, data: inventory } = useSKUInventoryQuery();
    const [showReceive, setShowReceive] = useState(false);
    const [showIssue, setShowIssue] = useState(false);

    const columns: ColumnDef<SKUInventoryOverview>[] = [
        {
            accessorKey: "brand",
            header: "SKU",
            cell: ({ row }) => (
                <Link href={`/stock/skus/${row.original.id}`} className="flex flex-col group/sku">
                    <span className="font-bold text-teal-600 group-hover/sku:underline">{row.original.brand} {row.original.model}</span>
                    <span className="text-xs text-gray-400 font-mono tracking-tighter">{row.original.size} | {row.original.skuCode}</span>
                </Link>
            )
        },
        { accessorKey: "totalQty", header: "Total Qty" },
        { accessorKey: "available", header: "Available" },
        { accessorKey: "issued", header: "Issued" },
        { accessorKey: "inspection", header: "Inspection" },
        { accessorKey: "quarantine", header: "Quarantine" },
        { accessorKey: "scrapped", header: "Scrapped" },
        {
            id: "visual_bar",
            header: "Status Distribution",
            cell: ({ row }) => {
                const total = row.original.totalQty || 1;
                const availPerc = (row.original.available / total) * 100;
                const issuedPerc = (row.original.issued / total) * 100;
                const inspPerc = (row.original.inspection / total) * 100;
                const quarPerc = (row.original.quarantine / total) * 100;

                return (
                    <div className="w-48 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                        <div style={{ width: `${availPerc}%` }} className="bg-green-500 h-full" title="Available" />
                        <div style={{ width: `${issuedPerc}%` }} className="bg-blue-500 h-full" title="Issued" />
                        <div style={{ width: `${inspPerc}%` }} className="bg-yellow-500 h-full" title="Inspection" />
                        <div style={{ width: `${quarPerc}%` }} className="bg-orange-500 h-full" title="Quarantine" />
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Receive Stock" onClick={() => setShowReceive(true)}>
                        <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Issue Tires" onClick={() => setShowIssue(true)}>
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Transfer Stock">
                        <ArrowRightLeft className="w-4 h-4" />
                    </Button>
                    <Link href={`/stock/skus/${row.original.id}`}>
                        <Button variant="ghost" size="icon" title="View Details">
                            <ClipboardList className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <>
            <DataTable
                columns={columns}
                data={inventory || []}
                title={"Inventory by SKU"}
            />

            {showReceive && (
                <ReceiveStockModal
                    onCancel={() => setShowReceive(false)}
                    onSuccess={() => setShowReceive(false)}
                />
            )}

            {showIssue && (
                <IssueTiresModal
                    onCancel={() => setShowIssue(false)}
                    onSuccess={() => setShowIssue(false)}
                />
            )}
        </>
    );
}
