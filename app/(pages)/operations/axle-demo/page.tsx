'use client';

import React, { useState, useEffect } from 'react';
import { VehicleAxleDiagram, VehicleAxleData } from '@/components/fleet/VehicleAxleDiagram';
import { TirePosition, TireStatus } from '@/components/fleet/TireNode';
import { Button } from '@/components/ui/button';

export default function AxleDiagramDemo() {
    const [loading, setLoading] = useState(false);
    const [vehicleData, setVehicleData] = useState<VehicleAxleData | undefined>(undefined);
    const [tireStatuses, setTireStatuses] = useState<Record<string, TireStatus>>({});

    // Mock API Fetch
    const fetchMockData = async (type: 'TRUCK' | 'TRAILER' | 'EMPTY') => {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (type === 'EMPTY') {
            setVehicleData(undefined);
        } else if (type === 'TRUCK') {
            setVehicleData({
                vehicleId: 'TRUCK-7823',
                vehicleType: 'TRUCK',
                axles: [
                    { axleNumber: 1, axleType: 'STEER', tiresPerSide: 1 },
                    { axleNumber: 2, axleType: 'DRIVE', tiresPerSide: 2 },
                    { axleNumber: 3, axleType: 'DRIVE', tiresPerSide: 2 },
                ],
            });
            // Set some initial statuses
            setTireStatuses({
                'A1-LEFT1': 'ASSIGNED',
                'A1-RIGHT1': 'WARNING',
                'A2-LEFT1': 'ASSIGNED',
                'A2-LEFT2': 'ASSIGNED',
                'A2-RIGHT1': 'CRITICAL',
                'A2-RIGHT2': 'ASSIGNED',
                'A3-LEFT1': 'ASSIGNED',
                'A3-LEFT2': 'ASSIGNED',
                'A3-RIGHT1': 'ASSIGNED',
                'A3-RIGHT2': 'ASSIGNED',
            });
        } else if (type === 'TRAILER') {
            setVehicleData({
                vehicleId: 'TRAILER-101',
                vehicleType: 'TRAILER',
                axles: [
                    { axleNumber: 1, axleType: 'TRAILER', tiresPerSide: 2 },
                    { axleNumber: 2, axleType: 'TRAILER', tiresPerSide: 2 },
                    { axleNumber: 3, axleType: 'TRAILER', tiresPerSide: 2 },
                ],
            });
            setTireStatuses({
                'A1-LEFT1': 'ASSIGNED',
                'A1-RIGHT1': 'ASSIGNED',
                'A2-LEFT1': 'ASSIGNED',
                'A2-RIGHT1': 'ASSIGNED',
                'A3-LEFT1': 'ASSIGNED',
                'A3-RIGHT1': 'ASSIGNED',
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMockData('TRUCK');
    }, []);

    const handleTireClick = (tire: TirePosition & { status: TireStatus }) => {
        console.log('Tire Clicked:', tire);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic underline decoration-teal-500 underline-offset-8">Interactive Axle Intelligence</h1>
                <p className="text-gray-500 font-medium">Hover over non-empty tire nodes to inspect telemetry and lifecycle data.</p>
            </div>

            <div className="flex flex-wrap gap-4">
                <Button
                    variant={vehicleData?.vehicleType === 'TRUCK' ? 'default' : 'outline'}
                    onClick={() => fetchMockData('TRUCK')}
                >
                    Load Truck (3 Axles)
                </Button>
                <Button
                    variant={vehicleData?.vehicleType === 'TRAILER' ? 'default' : 'outline'}
                    onClick={() => fetchMockData('TRAILER')}
                >
                    Load Trailer (3 Axles)
                </Button>
                <Button
                    variant={!vehicleData && !loading ? 'default' : 'outline'}
                    onClick={() => fetchMockData('EMPTY')}
                >
                    Empty State
                </Button>
                <Button
                    variant={loading ? 'default' : 'outline'}
                    onClick={() => setLoading(true)}
                >
                    Simulate Loading
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <VehicleAxleDiagram
                    data={vehicleData}
                    isLoading={loading}
                    tireStatuses={tireStatuses}
                    onTireClick={handleTireClick}
                />

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Configuration Metadata</h2>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehicle ID</span>
                            <span className="text-sm font-bold text-gray-800">{vehicleData?.vehicleId || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</span>
                            <span className="text-sm font-bold text-gray-800">{vehicleData?.vehicleType || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Axles</span>
                            <span className="text-sm font-bold text-gray-800">{vehicleData?.axles.length || 0}</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Implementation Notes</h3>
                        <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                            <li>SVG coordinates are calculated from a <strong>centerline axis</strong>.</li>
                            <li>Each tire has a unique <strong>positionId</strong> (e.g., A1-LEFT1).</li>
                            <li>Symmetry is guaranteed across all axle types.</li>
                            <li>Loading and Empty states are handled as first-class UI.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
