import { fetchSKUs, fetchSKUInventory } from "@/actions/sku";
import { useQuery } from "@tanstack/react-query";

export const useSKUsQuery = () => {
    return useQuery({
        queryKey: ["skus"],
        queryFn: async () => {
            const result = await fetchSKUs();
            if (!result.success) throw new Error(result.message);
            return result.data;
        },
    });
};

export const useSKUInventoryQuery = () => {
    return useQuery({
        queryKey: ["sku-inventory"],
        queryFn: async () => {
            const result = await fetchSKUInventory();
            if (!result.success) throw new Error(result.message);
            return result.data;
        }
    });
};
