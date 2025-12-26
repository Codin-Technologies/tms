'use client';

import { useState } from "react";
import { X, Plus, Edit2, Search, Truck, RefreshCw, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockDealers } from "@/data/inventory";
import { Dealer, DealerCategory } from "@/types/inventory";

interface ManageDealersDrawerProps {
    onClose: () => void;
}

export default function ManageDealersDrawer({ onClose }: ManageDealersDrawerProps) {
    const [dealers, setDealers] = useState<Dealer[]>(mockDealers);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const filteredDealers = dealers.filter(dlr =>
        dlr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dlr.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDealerIcon = (category: DealerCategory) => {
        switch (category) {
            case 'Tire Supplier': return <Truck className="w-4 h-4 text-blue-500" />;
            case 'Retreader': return <RefreshCw className="w-4 h-4 text-purple-500" />;
            case 'Scrap / Disposal': return <Trash2 className="w-4 h-4 text-red-500" />;
            default: return <Building2 className="w-4 h-4 text-gray-500" />;
        }
    };

    const getCategoryStyles = (category: DealerCategory) => {
        switch (category) {
            case 'Tire Supplier': return "bg-blue-50 text-blue-700 border-blue-200";
            case 'Retreader': return "bg-purple-50 text-purple-700 border-purple-200";
            case 'Scrap / Disposal': return "bg-red-50 text-red-700 border-red-200";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Dealers</h2>
                        <p className="text-xs text-gray-500 mt-1 font-medium italic">Configure external partners and service providers</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search dealers by name or type..."
                            className="pl-9 bg-gray-50 border-gray-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsCreating(true)} className="w-full font-bold shadow-sm bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" /> Onboard New Partner
                    </Button>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {filteredDealers.map((dlr) => (
                        <div key={dlr.id} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group bg-white">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                                        {getDealerIcon(dlr.category)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 leading-tight">{dlr.name}</h4>
                                        <Badge className={`mt-1.5 text-[10px] uppercase font-black px-2 py-0 ${getCategoryStyles(dlr.category)}`}>
                                            {dlr.category}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className={dlr.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200 font-bold'}>
                                        {dlr.status}
                                    </Badge>
                                    <button className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all opacity-0 group-hover:opacity-100">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50">
                                <div className="grid grid-cols-2 gap-y-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Contact</span>
                                        <span className="text-xs font-semibold text-gray-700">{dlr.contactPerson}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Phone</span>
                                        <span className="text-xs font-semibold text-gray-700">{dlr.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {dlr.canReceiveNew && <Badge variant="outline" className="text-[8px] uppercase font-bold text-blue-600 bg-blue-50/20">Receives New</Badge>}
                                {dlr.canReceiveUsed && <Badge variant="outline" className="text-[8px] uppercase font-bold text-purple-600 bg-purple-50/20">Receives Used</Badge>}
                                {dlr.canReturn && <Badge variant="outline" className="text-[8px] uppercase font-bold text-green-600 bg-green-50/20">Returns</Badge>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-indigo-50/30 border-t">
                    <p className="text-[10px] text-indigo-400 text-center font-bold uppercase tracking-widest leading-loose">
                        External Node: Restricted Inventory Governance Applied
                    </p>
                </div>
            </div>
        </div>
    );
}
