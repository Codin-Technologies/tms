'use client';

import { useStockQuery } from "@/app/(pages)/stock/query";
import { DataTable } from "@/components/ui/data-table";
import { mockTyres } from "@/data/tyres";
import { Tyre, TyreDetails } from "@/types/tyre";
import { ColumnDef } from "@tanstack/react-table";

function getStatusColor(status: string): string {
  switch (status) {
    case "instock":
      return "text-green-600";
    case "assigned":
      return "text-blue-600";
    case "In Maintenance":
      return "text-yellow-600";
    case "Disposed":
      return "text-red-600";
    default:
      return "";
  }
}

// Add a prop for onAdd callback
export function TyreTable({ onAdd }: { onAdd?: () => void }) {
  const {isLoading, error, data: tyres} = useStockQuery()

  const columns: ColumnDef<TyreDetails>[] = [
    { accessorKey: "serialNumber", header: "Serial Number" },
    { accessorKey: "brand", header: "Brand" },
    { accessorKey: "model", header: "Model" },
    { accessorKey: "size", header: "Size" },
    { accessorKey: "type", header: "Type" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <div className={getStatusColor(status)}>{status}</div>;
      },
    },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "remainingTreadMm", header: "TreadDepth (mm)" },
    { accessorKey: "pressure", header: "Pressure (PSI)" },
    {
      accessorKey: "purchaseCost",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("purchaseCost"));
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "TSH",
        }).format(amount);
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={tyres? tyres.data : []}
      title={"Inventory"}
      onAdd={onAdd} // Use callback passed from StockPage
    />
  );
}
