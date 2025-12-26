'use client';

import { VehicleGroup } from "@/types/sku";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";

interface SkuInstalledOnVehiclesProps {
    vehicles: VehicleGroup[];
}

export function SkuInstalledOnVehicles({ vehicles }: SkuInstalledOnVehiclesProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OK': return <ShieldCheck className="w-4 h-4 text-green-500" />;
            case 'Attention': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'Critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OK': return 'bg-green-100 text-green-700 border-green-200';
            case 'Attention': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-gray-900">Vehicle ID / Name</th>
                            <th className="px-4 py-3 font-semibold text-gray-900">Axle / Position</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-900">Tire Count</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-900">Avg Tread Depth</th>
                            <th className="px-4 py-3 font-semibold text-gray-900">Condition Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {vehicles.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No tires of this SKU are currently installed on vehicles.</td>
                            </tr>
                        ) : (
                            vehicles.map((v) => (
                                <tr key={`${v.vehicleId}-${v.axlePosition}`} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-3 font-medium text-gray-900">{v.vehicleName}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {v.axlePosition}
                                            {v.isSteerAxle && (
                                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] py-0">Steer</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-gray-900">{v.tireCount}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`font-medium ${v.avgTreadDepth < 6 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                                            {v.avgTreadDepth}mm
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${getStatusColor(v.status)}`}>
                                            {getStatusIcon(v.status)}
                                            {v.status}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
