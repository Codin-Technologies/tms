'use client';

import { useState } from "react";
import { X, Plus, Edit2, Search, Warehouse, Wrench, ShieldAlert, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockLocations } from "@/data/inventory";
import { Location, LocationType } from "@/types/inventory";

interface ManageLocationsDrawerProps {
    onClose: () => void;
}

export default function ManageLocationsDrawer({ onClose }: ManageLocationsDrawerProps) {
    const [locations, setLocations] = useState<Location[]>(mockLocations);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getLocationIcon = (type: LocationType) => {
        switch (type) {
            case 'Warehouse': return <Warehouse className="w-4 h-4 text-blue-500" />;
            case 'Workshop': return <Wrench className="w-4 h-4 text-teal-500" />;
            case 'Quarantine': return <ShieldAlert className="w-4 h-4 text-orange-500" />;
            case 'Yard': return <CircleDot className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Locations</h2>
                        <p className="text-xs text-gray-500 mt-1 font-medium italic">Configure repositories and operational yards</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search locations..."
                            className="pl-9 bg-gray-50 border-gray-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsCreating(true)} className="w-full font-bold shadow-sm bg-teal-600 hover:bg-teal-700">
                        <Plus className="w-4 h-4 mr-2" /> Create New Location
                    </Button>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {filteredLocations.map((loc) => (
                        <div key={loc.id} className="p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group bg-white">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-teal-50 transition-colors">
                                        {getLocationIcon(loc.type)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 leading-tight">{loc.name}</h4>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{loc.type} • {loc.region}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className={loc.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 font-bold'}>
                                        {loc.status}
                                    </Badge>
                                    <button className="p-1.5 text-gray-300 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-all opacity-0 group-hover:opacity-100">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-1.5">
                                {loc.canStoreTires && <Badge variant="outline" className="text-[9px] uppercase font-black text-blue-600 bg-blue-50/20 border-blue-100">Stores</Badge>}
                                {loc.canIssueTires && <Badge variant="outline" className="text-[9px] uppercase font-black text-teal-600 bg-teal-50/20 border-teal-100">Issues</Badge>}
                                {loc.canReceiveTransfers && <Badge variant="outline" className="text-[9px] uppercase font-black text-purple-600 bg-purple-50/20 border-purple-100">Receives</Badge>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 border-t">
                    <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest leading-loose">
                        Governance Rule: Deactivation requires clearing all stock
                    </p>
                </div>
            </div>
        </div>
    );
}
