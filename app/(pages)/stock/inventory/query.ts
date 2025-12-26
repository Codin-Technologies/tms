import { fetchSKUInventory } from "@/actions/sku";
import { useQuery } from "@tanstack/react-query";

export const useSKUInventoryQuery = () => {
    return useQuery({
        queryKey: ["sku-inventory"],
        queryFn: async () => {
            const result = await fetchSKUInventory();
            if (!result.success) throw new Error(result.message);
            return result.data;
        },
    });
};
