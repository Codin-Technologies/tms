import { inspectionData, inspectionOverviewData } from "@/actions/inspection";
import { InspectionOverview } from "@/types/tyre";
import { useQuery } from "@tanstack/react-query";

export const useInspectionOverviewQuery = () => {
  return useQuery<InspectionOverview>({
    queryKey: ["inspectionOverview"],
    queryFn: async () => await inspectionOverviewData(),
  });
};
export const useInspectionDataQuery = () => {
  return useQuery({
    queryKey: ["insectionData"],
    queryFn: async () => await inspectionData(),
  });
};
