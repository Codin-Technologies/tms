'use client';

import { useState } from "react";
import { createSKU } from "@/actions/sku";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export default function AddSKUForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            skuCode: formData.get("skuCode") as string,
            brand: formData.get("brand") as string,
            model: formData.get("model") as string,
            size: formData.get("size") as string,
            plyRating: formData.get("plyRating") as string,
            patternType: formData.get("patternType") as string,
            category: formData.get("category") as string,
            retreadable: formData.get("retreadable") === "true",
            maxRetreadCycles: Number(formData.get("maxRetreadCycles")),
            expectedMileage: Number(formData.get("expectedMileage")),
            minTreadDepth: Number(formData.get("minTreadDepth")),
            reorderPoint: Number(formData.get("reorderPoint")),
            minStockLevel: Number(formData.get("minStockLevel")),
            preferredWarehouse: formData.get("preferredWarehouse") as string,
            leadTimeDays: Number(formData.get("leadTimeDays")),
            avgUnitCost: Number(formData.get("avgUnitCost")),
            budgetCategory: formData.get("budgetCategory") as string,
            status: "active" as const,
        };

        const result = await createSKU(data);
        setLoading(false);

        if (result.success) {
            queryClient.invalidateQueries({ queryKey: ["skus"] });
            onSuccess();
        } else {
            alert(result.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section A: Identification */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">A. Identification</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">SKU Code</label>
                        <Input name="skuCode" placeholder="e.g. MIC-X-295-80" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Brand</label>
                        <Input name="brand" placeholder="e.g. Michelin" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Model</label>
                        <Input name="model" placeholder="e.g. X Multi Z" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Size</label>
                        <Input name="size" placeholder="e.g. 295/80 R22.5" required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ply Rating</label>
                            <Input name="plyRating" placeholder="16PR" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select name="category" className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                                <option value="Steer">Steer</option>
                                <option value="Drive">Drive</option>
                                <option value="Trailer">Trailer</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section B: Operational Rules */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">B. Operational Rules</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Retreadable</label>
                        <select name="retreadable" className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Max Retread Cycles</label>
                        <Input name="maxRetreadCycles" type="number" defaultValue={3} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Expected Mileage (km)</label>
                        <Input name="expectedMileage" type="number" placeholder="100000" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Min Tread Depth (mm)</label>
                        <Input name="minTreadDepth" type="number" defaultValue={4} />
                    </div>
                </div>

                {/* Section C: Inventory Rules */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">C. Inventory Rules</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reorder Point</label>
                        <Input name="reorderPoint" type="number" defaultValue={10} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Min Stock Level</label>
                        <Input name="minStockLevel" type="number" defaultValue={5} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Preferred Warehouse</label>
                        <Input name="preferredWarehouse" placeholder="Main Depot" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Lead Time (Days)</label>
                        <Input name="leadTimeDays" type="number" defaultValue={7} />
                    </div>
                </div>

                {/* Section D: Financial */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">D. Financial</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Avg Unit Cost</label>
                        <Input name="avgUnitCost" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Budget Category</label>
                        <Input name="budgetCategory" placeholder="Tire Maintenance" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Save SKU"}
                </Button>
            </div>
        </form>
    );
}
