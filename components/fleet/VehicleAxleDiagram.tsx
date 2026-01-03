'use client';

import React, { useState, useMemo } from 'react';
import { AxleRow, AxleData } from './AxleRow';
import { TirePosition, TireStatus } from './TireNode';
import { TireDetailsCard, TireDetails } from './TireDetailsCard';

export interface VehicleAxleData {
    vehicleId: string;
    vehicleType: string;
    axles: AxleData[];
}

interface VehicleAxleDiagramProps {
    data?: VehicleAxleData;
    axleConfiguration?: VehicleAxleData; // Alias for data (for compatibility)
    isLoading?: boolean;
    onTireClick?: (position: TirePosition & { status: TireStatus }) => void;
    tireStatuses?: Record<string, TireStatus>;
    pendingAssignments?: Record<string, string>;
    selectedPositionId?: string | null;
    selectedPosition?: string | null; // Alias for selectedPositionId
    className?: string;
}

export const VehicleAxleDiagram: React.FC<VehicleAxleDiagramProps> = ({
    data,
    axleConfiguration,
    isLoading = false,
    onTireClick,
    tireStatuses = {},
    pendingAssignments = {},
    selectedPositionId = null,
    selectedPosition = null,
    className = '',
}) => {
    // Support both prop names for compatibility
    const vehicleData = data || axleConfiguration;
    const selectedId = selectedPositionId || selectedPosition;
    const [hoveredTire, setHoveredTire] = useState<{ position: TirePosition & { status: TireStatus }, x: number, y: number } | null>(null);
    const [selectedTire, setSelectedTire] = useState<TirePosition & { status: TireStatus } | null>(null);

    // SVG Dimensions & Layout Constants
    const width = 400;
    const paddingY = 60;
    const normalAxleSpacing = 80;
    const steerDriveGap = 120; // Significant space between steer and drive
    const centerX = width / 2;

    const tireWidth = 24;
    const tireHeight = 40;
    const tireSpacing = 4;
    const axleWidth = 140;

    // Calculate cumulative Y positions for axles
    const axleLayout = useMemo(() => {
        if (!vehicleData?.axles) return [];
        let currentY = paddingY;
        return vehicleData.axles.map((axle, index) => {
            const y = currentY;
            const isSteer = axle.axleType === 'STEER';
            const nextAxleIsDriveOrTrailer = vehicleData.axles[index + 1] && vehicleData.axles[index + 1].axleType !== 'STEER';

            if (isSteer && nextAxleIsDriveOrTrailer) {
                currentY += steerDriveGap;
            } else {
                currentY += normalAxleSpacing;
            }
            return { ...axle, y };
        });
    }, [vehicleData, paddingY, normalAxleSpacing, steerDriveGap]);

    const height = axleLayout.length > 0
        ? axleLayout[axleLayout.length - 1].y + paddingY + 40
        : 400;

    // Mock tire details fetcher (simulation)
    const getTireDetails = (tireId: string, status: TireStatus): TireDetails => ({
        tireId,
        installedDate: '2025-05-12',
        distanceCovered: '45,230 KM',
        treadDepth: '12mm',
        brand: 'Michelin',
        model: 'X Line Energy',
        status
    });

    if (isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center p-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 ${className}`}>
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Configuration...</span>
            </div>
        );
    }

    if (!vehicleData || !vehicleData.axles || vehicleData.axles.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center p-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 ${className}`}>
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center">Axle configuration not defined</span>
                <p className="text-xs text-gray-400 mt-2">Please set up axle specifications to view the diagram.</p>
            </div>
        );
    }

    const vehicleBodyWidth = axleWidth + (tireWidth + tireSpacing) * 4;

    return (
        <div className={`vehicle-axle-diagram-container relative bg-white p-6 rounded-3xl border border-gray-100 shadow-sm ${className}`}>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto drop-shadow-sm"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Vehicle Body / Chassis representation */}
                <rect
                    x={centerX - vehicleBodyWidth / 2}
                    y={20}
                    width={vehicleBodyWidth}
                    height={height - 60}
                    rx={20}
                    fill="#fafafa" // gray-50
                    stroke="#f3f4f6" // gray-100
                    strokeWidth={2}
                />

                {/* Front Grill / Cab Indicator */}
                <rect
                    x={centerX - 60}
                    y={25}
                    width={120}
                    height={15}
                    rx={4}
                    fill="#f3f4f6"
                />

                {/* Axles */}
                {axleLayout.map((axle) => (
                    <AxleRow
                        key={axle.axleNumber}
                        axle={axle}
                        y={axle.y}
                        centerX={centerX}
                        tireWidth={tireWidth}
                        tireHeight={tireHeight}
                        tireSpacing={tireSpacing}
                        axleWidth={axleWidth}
                        tireStatuses={tireStatuses}
                        pendingAssignments={pendingAssignments}
                        selectedPositionId={selectedId}
                        onTireClick={(tire) => {
                            setSelectedTire(tire);
                            onTireClick?.(tire);
                        }}
                        onTireMouseEnter={(tire, e) => {
                            const svg = e.currentTarget.closest('svg');
                            if (svg) {
                                const point = svg.createSVGPoint();
                                point.x = e.clientX;
                                point.y = e.clientY;
                                const cursorPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
                                setHoveredTire({ position: tire, x: cursorPoint.x, y: cursorPoint.y });
                            }
                        }}
                        onTireMouseLeave={() => setHoveredTire(null)}
                    />
                ))}

                {/* Selection Highlight (if needed) */}
                {selectedTire && (
                    <text x={10} y={height - 10} fontSize="10" fill="#9ca3af" className="italic">
                        Selected: {selectedTire.positionId}
                    </text>
                )}
            </svg>

            {/* Hover Card */}
            {hoveredTire && hoveredTire.position.status !== 'EMPTY' && (
                <div
                    className="absolute pointer-events-none transition-all duration-200"
                    style={{
                        left: `${(hoveredTire.x / width) * 100}%`,
                        top: `${(hoveredTire.y / height) * 100}%`,
                        transform: 'translate(-50%, -110%)'
                    }}
                >
                    <TireDetailsCard details={getTireDetails(hoveredTire.position.positionId, hoveredTire.position.status)} />
                </div>
            )}

            {/* Selected Card Overlay (could be a side panel in reality, but for demo let's put it on top if no hover) */}
            {!hoveredTire && selectedTire && selectedTire.status !== 'EMPTY' && (
                <div
                    className="absolute top-4 right-4 animate-in slide-in-from-right-4 duration-300"
                    onClick={() => setSelectedTire(null)}
                >
                    <TireDetailsCard details={getTireDetails(selectedTire.positionId, selectedTire.status)} className="cursor-pointer hover:scale-[1.02] transition-transform" />
                    <p className="text-[10px] text-gray-400 text-center mt-2 uppercase font-bold tracking-tighter cursor-pointer">Click card to dismiss</p>
                </div>
            )}

            {/* Legend */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 px-2">
                {[
                    { label: 'Empty', status: 'EMPTY' as const, color: 'bg-gray-200' },
                    { label: 'Assigned', status: 'ASSIGNED' as const, color: 'bg-emerald-500' },
                    { label: 'Warning', status: 'WARNING' as const, color: 'bg-amber-500' },
                    { label: 'Critical', status: 'CRITICAL' as const, color: 'bg-red-500' },
                ].map(item => (
                    <div key={item.status} className="flex items-center gap-2">
                        <div className={`w-3 h-4 rounded-sm ${item.color}`} />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
