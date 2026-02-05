'use client';

import React from 'react';
import { Loader2, Package, ShieldCheck, Truck } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full scale-150 animate-pulse" />

                {/* Main Spinner */}
                <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin shadow-xl" />

                    {/* Inner Icon */}
                    <div className="absolute flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <Truck className="w-6 h-6 text-teal-600 animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Text and Skeleton placeholders */}
            <div className="text-center space-y-4 max-w-sm px-4">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
                        Initializing Asset Intelligence
                        <span className="flex gap-1">
                            <span className="w-1 h-1 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1 h-1 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1 h-1 bg-teal-600 rounded-full animate-bounce" />
                        </span>
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">Synchronizing with TMS Cloud Infrastructure</p>
                </div>

                {/* Simulated Skeletons */}
                <div className="space-y-3 opacity-40">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500/50 w-1/3 animate-horizontal-loading" style={{
                            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                        }} />
                    </div>
                    <div className="h-2 w-2/3 mx-auto bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500/50 w-1/2 animate-horizontal-loading [animation-delay:-0.5s]" />
                    </div>
                </div>
            </div>

            {/* Bottom Status Tags */}
            <div className="flex gap-4 pt-4 opacity-30 grayscale pointer-events-none">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <ShieldCheck className="w-3 h-3" />
                    Secure Link
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <Package className="w-3 h-3" />
                    Inventory Data
                </div>
            </div>
        </div>
    );
}
