"use client";

import { useEffect } from "react";
import { useHeader } from '@/components/HeaderContext';
import { LineChart } from "lucide-react";

export default function ReorderPage() {
    const { setHeader } = useHeader();

    useEffect(() => {
        setHeader({
            title: 'Reorder & Forecast',
            subtitle: 'Predict tire needs and manage replenishment',
        });
        return () => setHeader({});
    }, [setHeader]);

    return (
        <div className="bg-white p-12 rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-teal-100 p-4 rounded-full mb-4">
                <LineChart className="w-12 h-12 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Reorder & Forecast</h2>
            <p className="text-gray-500 max-w-md">
                Analyze usage patterns and get predictive alerts for when to restock tires based on your SKU-level rules.
            </p>
        </div>
    );
}
