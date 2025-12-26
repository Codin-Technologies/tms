"use client";

import { useState, useEffect } from "react";
import { SKUTable } from "@/components/sku-table";
import AddSKUForm from "@/components/add-sku-form";
import { useHeader } from '@/components/HeaderContext';
import { PackagePlus } from "lucide-react";

export default function SKUCatalogPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { setHeader } = useHeader();

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    useEffect(() => {
        setHeader({
            title: 'SKU Catalog',
            subtitle: 'Manage tire types and master data',
            searchPlaceholder: 'Search SKUs, brand, model...',
            actions: (
                <button onClick={handleOpenModal} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm">
                    <PackagePlus className="w-4 h-4" />
                    Create SKU
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
            <div className="bg-white text-black rounded-lg shadow-md p-6 space-y-6">
                <SKUTable onAdd={handleOpenModal} />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative shadow-2xl">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New SKU</h2>
                        <AddSKUForm onCancel={handleCloseModal} onSuccess={handleCloseModal} />
                    </div>
                </div>
            )}
        </div>
    );
}
