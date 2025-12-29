'use client';

import React from 'react';
import { TireStatus } from './TireNode';
import { Badge } from "@/components/ui/badge";
import { Calendar, Hash, Ruler, MapPin, Activity } from 'lucide-react';

export interface TireDetails {
    tireId: string;
    installedDate: string;
    distanceCovered: string;
    treadDepth: string;
    brand: string;
    model: string;
    status: TireStatus;
}

interface TireDetailsCardProps {
    details: TireDetails;
    className?: string;
}

export const TireDetailsCard: React.FC<TireDetailsCardProps> = ({ details, className = '' }) => {
    const getStatusConfig = (status: TireStatus) => {
        switch (status) {
            case 'CRITICAL':
                return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500' };
            case 'WARNING':
                return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500' };
            case 'ASSIGNED':
                return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' };
            default:
                return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-100', dot: 'bg-gray-400' };
        }
    };

    const config = getStatusConfig(details.status);

    return (
        <div className={`bg-white/95 backdrop-blur-sm p-4 rounded-2xl border ${config.border} shadow-xl animate-in fade-in zoom-in duration-200 min-w-[240px] z-50 ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{details.brand} {details.model}</span>
                </div>
                <Badge variant="outline" className={`text-[9px] font-bold ${config.bg} ${config.color} border-none`}>
                    {details.status}
                </Badge>
            </div>

            <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Serial Number</span>
                        <span className="text-xs font-bold text-gray-800 tracking-tight">{details.tireId}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Installed</span>
                            <span className="text-xs font-bold text-gray-800 tracking-tight">{details.installedDate}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-gray-400" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Distance</span>
                            <span className="text-xs font-bold text-gray-800 tracking-tight">{details.distanceCovered}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                    <Ruler className="w-3.5 h-3.5 text-teal-500" />
                    <div className="flex items-center justify-between flex-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Remaining Tread</span>
                        <span className="text-sm font-black text-teal-700 tracking-tighter">{details.treadDepth}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
