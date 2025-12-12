import { fetchTyreStockData, overviewTyreStockData } from "@/actions/stock";
import { StockOverview, TyreStock } from "@/types/tyre";
import { useQuery } from "@tanstack/react-query";

export const useStockQuery = () => {
  return useQuery<TyreStock>({
    queryKey: ["stock"],
    queryFn: async () => await fetchTyreStockData(),
  });
};

export const useStockOverviewQuery = () => {
  return useQuery<StockOverview>({
    queryKey: ["stockOverview"],
    queryFn: async () => await overviewTyreStockData(),
  });
};
