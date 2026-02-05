'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCcw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative mb-8">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-red-100/50 blur-3xl rounded-full scale-150" />

                {/* Error Icon Circle */}
                <div className="relative flex items-center justify-center w-24 h-24 bg-red-50 rounded-3xl border-2 border-red-100 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-white" />
                    <AlertTriangle className="relative w-12 h-12 text-red-600 animate-pulse" />
                </div>

                {/* Floating smaller icon */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center animate-bounce">
                    <WifiOff className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="text-center max-w-md space-y-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-3">
                        Operational Failure
                    </h2>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        We've encountered a critical synchronization issue. This could be due to a lost connection or a momentary server-side disruption.
                    </p>
                </div>

                {/* Error Summary Box */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        System Logs
                    </div>
                    <code className="text-[11px] font-mono text-gray-600 break-all bg-white p-2 rounded block border border-gray-100 truncate">
                        {error.message || 'An unexpected error occurred within the TMS runtime.'}
                    </code>
                    {error.digest && (
                        <p className="text-[9px] text-gray-400 mt-2 font-mono">ID: {error.digest}</p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        onClick={() => reset()}
                        className="flex-1 h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-bold gap-2 shadow-lg shadow-gray-200"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Retry Operation
                    </Button>
                    <Link href="/operations" className="flex-1">
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl border-gray-200 font-bold gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>

            <p className="mt-12 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Codin Technologies • Fleet Management Systems
            </p>
        </div>
    );
}
