"use client";

import { useEffect } from "react";
import { useHeader } from '@/components/HeaderContext';
import { Trash2 } from "lucide-react";

export default function ScrapPage() {
    const { setHeader } = useHeader();

    useEffect(() => {
        setHeader({
            title: 'Scrap & Quarantine',
            subtitle: 'Manage end-of-life and non-conforming tires',
        });
        return () => setHeader({});
    }, [setHeader]);

    return (
        <div className="bg-white p-12 rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
                <Trash2 className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Scrap & Quarantine</h2>
            <p className="text-gray-500 max-w-md">
                Track tires that have been decommissioned or are awaiting disposal/retread assessment.
            </p>
        </div>
    );
}
