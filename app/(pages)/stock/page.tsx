"use client";

import { useState, useEffect } from "react";
import { TyreTable } from "@/components/tyre-table";
import { StatCard } from "@/components/ui/stat-card";
import { Truck } from "lucide-react";
import AddTyreForm from "@/components/add-new-tyre-form";
import { useStockOverviewQuery } from "./query";
import { useHeader } from '@/components/HeaderContext';
import { useQueryClient } from "@tanstack/react-query";

export default function StockPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading, error, data: Overview } = useStockOverviewQuery();
  const queryClient = useQueryClient();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleTyreAdded = async () => {
    console.log("handleTyreAdded triggered, refreshing data...");
    // Give backend a moment to process before re-fetching
    await new Promise(resolve => setTimeout(resolve, 500));

    // Invalidate and refetch all related data
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["stock"] }),
      queryClient.invalidateQueries({ queryKey: ["stockOverview"] }),
      queryClient.refetchQueries({ queryKey: ["stock"] }),
      queryClient.refetchQueries({ queryKey: ["stockOverview"] })
    ]);
    console.log("Data refresh requests sent");
  };

  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader({
      title: 'Tyre Stock',
      subtitle: 'Current inventory overview',
      searchPlaceholder: 'Search tyre SKU, model...',
      actions: (
        <button onClick={handleOpenModal} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm">
          Add Tyre
        </button>
      )
    });
    return () => setHeader({});
  }, [setHeader]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
  }, [isModalOpen]);

  return (
    <div className="mx-auto flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Tyres"
            value={Overview ? Overview.data.total : 0}
            icon={<Truck />}
          />
          <StatCard
            title="In Use"
            value={Overview ? Overview.data.inuse : 0}
            icon={<Truck />}
          />
          <StatCard
            title="In Store"
            value={Overview ? Overview.data.instore : 0}
            icon={<Truck />}
          />
          <StatCard
            title="Needs Replacement"
            value={Overview ? Overview.data.needsreplacement : 0}
            icon={<Truck />}
          />
        </div>
      </div>

      <div className="bg-white text-black rounded-lg shadow-md p-6 space-y-6">
        {/* Tyre table with Add Tyre handler */}
        <TyreTable onAdd={handleOpenModal} />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Add New Tyre</h2>
            <AddTyreForm onCancel={handleCloseModal} onSuccess={handleTyreAdded} />
          </div>
        </div>
      )}
    </div>
  );
}
