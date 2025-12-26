'use client';

import { ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react";

interface SkuConditionSummaryProps {
    data: {
        good: number;
        warning: number;
        critical: number;
    };
}

export function SkuConditionSummary({ data }: SkuConditionSummaryProps) {
    const total = data.good + data.warning + data.critical || 1;
    const goodPerc = (data.good / total) * 100;
    const warnPerc = (data.warning / total) * 100;
    const critPerc = (data.critical / total) * 100;

    return (
        <div className="p-6 bg-white rounded-lg border shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-6 uppercase tracking-wider">Condition & Risk Visualization</h3>

            <div className="space-y-6">
                {/* Visual Bar */}
                <div className="h-6 w-full bg-gray-100 rounded-lg overflow-hidden flex shadow-inner">
                    <div style={{ width: `${goodPerc}%` }} className="bg-green-500 h-full flex items-center justify-center text-[10px] text-white font-bold" title="Good" >
                        {goodPerc > 10 && `${Math.round(goodPerc)}%`}
                    </div>
                    <div style={{ width: `${warnPerc}%` }} className="bg-yellow-500 h-full flex items-center justify-center text-[10px] text-white font-bold" title="Warning" >
                        {warnPerc > 10 && `${Math.round(warnPerc)}%`}
                    </div>
                    <div style={{ width: `${critPerc}%` }} className="bg-red-500 h-full flex items-center justify-center text-[10px] text-white font-bold" title="Critical" >
                        {critPerc > 10 && `${Math.round(critPerc)}%`}
                    </div>
                </div>

                {/* Legend / Counters */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-green-50 border border-green-100">
                        <ShieldCheck className="w-5 h-5 text-green-600 mb-1" />
                        <span className="text-xl font-bold text-green-700">{data.good}</span>
                        <span className="text-[10px] text-green-600 font-medium uppercase">Good</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mb-1" />
                        <span className="text-xl font-bold text-yellow-700">{data.warning}</span>
                        <span className="text-[10px] text-yellow-600 font-medium uppercase">Warning</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-red-50 border border-red-100">
                        <AlertCircle className="w-5 h-5 text-red-600 mb-1" />
                        <span className="text-xl font-bold text-red-700">{data.critical}</span>
                        <span className="text-[10px] text-red-600 font-medium uppercase">Critical</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
