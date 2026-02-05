'use client';

import { useState } from "react";
import { useSKUsQuery } from "@/app/(pages)/inventory/query";
import { fetchSKUTires, issueTireMovement } from "@/actions/sku";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function IssueTiresModal({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
    const { data: skus } = useSKUsQuery();
    const [loading, setLoading] = useState(false);
    const [selectedSkuId, setSelectedSkuId] = useState<number | string>("");
    const [availableTires, setAvailableTires] = useState<any[]>([]);
    const [loadingTires, setLoadingTires] = useState(false);
    const [selectedTireId, setSelectedTireId] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const handleSkuChange = async (skuCode: string) => {
        setSelectedSkuId(skuCode);
        setSelectedTireId(null);
        if (!skuCode) {
            setAvailableTires([]);
            return;
        }

        setLoadingTires(true);
        // Assuming skuCode is passed. If ID is passed we need to know the code.
        // We can find the SKU object from `skus` list.
        const sku = skus?.find(s => String(s.id) === skuCode || s.skuCode === skuCode);
        const codeToFetch = sku ? sku.skuCode : skuCode;

        const result = await fetchSKUTires(codeToFetch, 'AVAILABLE');
        if (result.success) {
            setAvailableTires(result.data);
        } else {
            console.error(result.message);
            setAvailableTires([]);
        }
        setLoadingTires(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedTireId) {
            alert("Please select a tire to issue");
            return;
        }

        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const vehicleId = formData.get("vehicleId") as string;
        const axlePosition = formData.get("axlePosition") as string;

        const result = await issueTireMovement({
            tire_id: selectedTireId,
            type: "issue",
            vehicle_id: vehicleId,
            axle_position: axlePosition || undefined,
            // workshop_id: ...
        });

        setLoading(false);

        if (result.success) {
            queryClient.invalidateQueries({ queryKey: ["sku-inventory"] });
            queryClient.invalidateQueries({ queryKey: ["sku-tires"] });
            onSuccess();
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative shadow-2xl">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">✕</button>
                <h2 className="text-xl font-bold mb-6">Issue Tire</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select SKU</label>
                        <select
                            name="skuId"
                            required
                            value={selectedSkuId}
                            onChange={(e) => handleSkuChange(e.target.value)}
                            className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                        >
                            <option value="">-- Choose SKU --</option>
                            {skus?.map(sku => (
                                <option key={sku.id} value={sku.skuCode || sku.id}>
                                    {sku.brand} {sku.model} ({sku.size}) - Available: {sku.currentStock}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSkuId && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Specific Tire</label>
                            {loadingTires ? (
                                <div className="text-sm text-gray-500">Loading tires...</div>
                            ) : availableTires.length === 0 ? (
                                <div className="text-sm text-red-500">No available tires found for this SKU.</div>
                            ) : (
                                <div className="border rounded-md max-h-48 overflow-y-auto">
                                    {availableTires.map((tire: any) => (
                                        <div
                                            key={tire.id}
                                            className={`p-3 border-b last:border-b-0 cursor-pointer flex justify-between items-center hover:bg-gray-50 ${selectedTireId === tire.id ? 'bg-teal-50 border-teal-200' : ''}`}
                                            onClick={() => setSelectedTireId(tire.id)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold">{tire.serial_number || tire.dot_code}</span>
                                                <span className="text-xs text-gray-500">{tire.location?.name || 'Warehouse'} - {tire.condition}</span>
                                            </div>
                                            {selectedTireId === tire.id && (
                                                <Badge className="bg-teal-600">Selected</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Vehicle ID</label>
                            <Input name="vehicleId" placeholder="e.g. VH001" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Axle Position (Optional)</label>
                            <Input name="axlePosition" placeholder="e.g. A2-R1" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" disabled={loading || !selectedTireId}>
                            {loading ? "Issuing..." : "Issue Tire"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
