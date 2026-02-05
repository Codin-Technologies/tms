"use client";

import { useState, useEffect } from "react";
import { SKUTable } from "@/components/sku-table";
import AddSKUForm from "@/components/add-sku-form";
import ReceiveStockModal from "@/components/receive-stock-modal";
import { useHeader } from '@/components/HeaderContext';
import { PackagePlus, ShieldAlert } from "lucide-react";
import { SKU } from "@/types/sku";
import Link from "next/link";

export default function SKUCatalogPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [receiveStockSku, setReceiveStockSku] = useState<SKU | null>(null);
    const { setHeader } = useHeader();

    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    const handleOpenReceiveModal = (sku: SKU) => setReceiveStockSku(sku);
    const handleCloseReceiveModal = () => setReceiveStockSku(null);

    useEffect(() => {
        setHeader({
            title: 'Inventory',
            subtitle: 'Manage tire types and master data',
            searchPlaceholder: 'Search SKUs, brand, model...',
            actions: (
                <div className="flex items-center gap-3">
                    <Link
                        href="/inventory/thresholds"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm whitespace-nowrap"
                    >
                        <ShieldAlert size={18} className="text-teal-600" />
                        Manage Thresholds
                    </Link>
                    <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm whitespace-nowrap">
                        <PackagePlus className="w-4 h-4" />
                        Create SKU
                    </button>
                </div>
            )
        });
        return () => setHeader({});
    }, [setHeader]);

    useEffect(() => {
        document.body.style.overflow = (isCreateModalOpen || receiveStockSku) ? "hidden" : "auto";
    }, [isCreateModalOpen, receiveStockSku]);

    return (
        <div className="mx-auto flex flex-col gap-6">
            <div className="bg-white text-black rounded-lg shadow-md p-6 space-y-6">
                <SKUTable onReceiveStock={handleOpenReceiveModal} />
            </div>

            {/* Create SKU Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative shadow-2xl">
                        <button
                            onClick={handleCloseCreateModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New SKU</h2>
                        <AddSKUForm onCancel={handleCloseCreateModal} onSuccess={handleCloseCreateModal} />
                    </div>
                </div>
            )}

            {/* Receive Stock Modal */}
            {receiveStockSku && (
                <ReceiveStockModal
                    onCancel={handleCloseReceiveModal}
                    onSuccess={handleCloseReceiveModal}
                    initialSkuId={receiveStockSku.id}
                />
            )}
        </div>
    );
}
