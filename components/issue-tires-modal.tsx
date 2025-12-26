'use client';

import { useState } from "react";
import { useSKUInventoryQuery } from "@/app/(pages)/stock/inventory/query";
import { issueTires } from "@/actions/sku";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export default function IssueTiresModal({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
    const { data: inventory } = useSKUInventoryQuery();
    const [loading, setLoading] = useState(false);
    const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const selectedSku = inventory?.find(item => item.id === selectedSkuId);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSkuId) return;

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            skuId: selectedSkuId,
            quantity: Number(formData.get("quantity")),
            destination: formData.get("destination") as string,
        };

        const result = await issueTires(data);
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
                <h2 className="text-xl font-bold mb-6">Issue Tires (SKU-Based)</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select SKU</label>
                        <select
                            name="skuId"
                            required
                            onChange={(e) => setSelectedSkuId(Number(e.target.value))}
                            className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                        >
                            <option value="">-- Choose SKU --</option>
                            {inventory?.map(sku => (
                                <option key={sku.id} value={sku.id}>{sku.brand} {sku.model} ({sku.size})</option>
                            ))}
                        </select>
                    </div>

                    {selectedSku && (
                        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 flex justify-between">
                            <span>Available Quantity:</span>
                            <span className="font-bold">{selectedSku.available}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Issue Quantity</label>
                        <Input
                            name="quantity"
                            type="number"
                            required
                            min="1"
                            max={selectedSku?.available}
                            placeholder="How many?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Destination (Vehicle / Workshop)</label>
                        <Input name="destination" placeholder="e.g. V-001 or Workshop A" required />
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" disabled={loading || !selectedSkuId || (selectedSku?.available || 0) <= 0}>
                            {loading ? "Issuing..." : "Issue Tires"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
