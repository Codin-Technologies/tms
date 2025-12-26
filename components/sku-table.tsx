'use client';

import { useSKUsQuery } from "@/app/(pages)/stock/skus/query";
import { DataTable } from "@/components/ui/data-table";
import { SKU } from "@/types/sku";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import Link from "next/link";

export function SKUTable({ onAdd }: { onAdd?: () => void }) {
    const { isLoading, error, data: skus } = useSKUsQuery();

    const columns: ColumnDef<SKU>[] = [
        {
            accessorKey: "skuCode",
            header: "SKU Code",
            cell: ({ row }) => (
                <Link href={`/stock/skus/${row.original.id}`} className="text-teal-600 font-bold hover:underline">
                    {row.original.skuCode}
                </Link>
            )
        },
        { accessorKey: "brand", header: "Brand" },
        { accessorKey: "model", header: "Model" },
        { accessorKey: "size", header: "Size" },
        { accessorKey: "plyRating", header: "Ply Rating" },
        { accessorKey: "category", header: "Category" },
        {
            accessorKey: "retreadable",
            header: "Retreadable",
            cell: ({ row }) => row.getValue("retreadable") ? "Yes" : "No"
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge className={status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
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
                    <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={skus || []}
            title={"Tire Catalog"}
            onAdd={onAdd}
        />
    );
}
