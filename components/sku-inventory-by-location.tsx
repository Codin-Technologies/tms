'use client';

import { LocationGroup } from "@/types/sku";

interface SkuInventoryByLocationProps {
    locations: LocationGroup[];
}

export function SkuInventoryByLocation({ locations }: SkuInventoryByLocationProps) {
    return (
        <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-gray-900">Location Name</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-900">Available</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-900">Under Inspection</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-900">Quarantined</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-900">Total</th>
                            <th className="px-4 py-3 w-48 font-semibold text-gray-900">State Distribution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {locations.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No inventory found for this SKU in any location.</td>
                            </tr>
                        ) : (
                            locations.map((loc) => {
                                const availPerc = (loc.available / loc.total) * 100;
                                const inspPerc = (loc.inspection / loc.total) * 100;
                                const quarPerc = (loc.quarantine / loc.total) * 100;

                                return (
                                    <tr key={loc.locationName} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                        <td className="px-4 py-3 font-medium text-gray-900 group-hover:text-teal-600 flex items-center gap-2">
                                            {loc.locationName}
                                        </td>
                                        <td className="px-4 py-3 text-right text-green-600 font-medium">{loc.available}</td>
                                        <td className="px-4 py-3 text-right text-yellow-600 font-medium">{loc.inspection}</td>
                                        <td className="px-4 py-3 text-right text-orange-600 font-medium">{loc.quarantine}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900">{loc.total}</td>
                                        <td className="px-4 py-3">
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                                <div style={{ width: `${availPerc}%` }} className="bg-green-500 h-full" title={`Available: ${loc.available}`} />
                                                <div style={{ width: `${inspPerc}%` }} className="bg-yellow-500 h-full" title={`Inspection: ${loc.inspection}`} />
                                                <div style={{ width: `${quarPerc}%` }} className="bg-orange-500 h-full" title={`Quarantine: ${loc.quarantine}`} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
