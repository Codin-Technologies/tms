'use client';

import { useState } from "react";
import { useSKUsQuery } from "@/app/(pages)/stock/skus/query";
import { receiveStock } from "@/actions/sku";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export default function ReceiveStockModal({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
    const { data: skus } = useSKUsQuery();
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            skuId: Number(formData.get("skuId")),
            quantity: Number(formData.get("quantity")),
            location: formData.get("location") as string,
            supplier: formData.get("supplier") as string,
            condition: formData.get("condition") as string,
        };

        const result = await receiveStock(data);
        setLoading(false);

        if (result.success) {
            queryClient.invalidateQueries({ queryKey: ["sku-inventory"] });
            onSuccess();
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-2xl">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">✕</button>
                <h2 className="text-xl font-bold mb-6">Receive Stock (SKU-Based)</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select SKU</label>
                        <select name="skuId" required className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm">
                            <option value="">-- Choose SKU --</option>
                            {skus?.map(sku => (
                                <option key={sku.id} value={sku.id}>{sku.brand} {sku.model} ({sku.size})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Quantity Received</label>
                        <Input name="quantity" type="number" required min="1" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Receiving Location (Warehouse)</label>
                        <Input name="location" placeholder="e.g. Dar Depot" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Supplier / PO Reference</label>
                        <Input name="supplier" placeholder="e.g. Michelin Official" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Condition</label>
                        <select name="condition" className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm">
                            <option value="new">New</option>
                            <option value="retread">Retread</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Processing..." : "Receive Stock"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
