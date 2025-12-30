'use client';

import React from 'react';

export type TireStatus = 'EMPTY' | 'ASSIGNED' | 'WARNING' | 'CRITICAL';

export interface TirePosition {
    positionId: string;
    side: 'LEFT' | 'RIGHT';
    index: number;
}

interface TireNodeProps {
    position: TirePosition;
    status: TireStatus;
    x: number;
    y: number;
    width: number;
    height: number;
    isPending?: boolean;
    isSelected?: boolean;
    onClick?: (position: TirePosition & { status: TireStatus }) => void;
    onMouseEnter?: (position: TirePosition & { status: TireStatus }, event: React.MouseEvent) => void;
    onMouseLeave?: () => void;
}

export const TireNode: React.FC<TireNodeProps> = ({
    position,
    status,
    x,
    y,
    width,
    height,
    isPending = false,
    isSelected = false,
    onClick,
    onMouseEnter,
    onMouseLeave,
}) => {
    const getStatusColor = (status: TireStatus) => {
        switch (status) {
            case 'CRITICAL':
                return '#ef4444'; // red-500
            case 'WARNING':
                return '#f59e0b'; // amber-500
            case 'ASSIGNED':
                return '#10b981'; // emerald-500
            case 'EMPTY':
            default:
                return '#e5e7eb'; // gray-200
        }
    };

    const statusColor = isPending ? '#3b82f6' : getStatusColor(status); // blue-500 for pending

    return (
        <g
            className={`tire-node group cursor-pointer ${isPending ? 'animate-pulse' : ''}`}
            onClick={() => onClick?.({ ...position, status })}
            onMouseEnter={(e) => onMouseEnter?.({ ...position, status }, e)}
            onMouseLeave={() => onMouseLeave?.()}
        >
            {/* Tire Shape */}
            <rect
                x={x - width / 2}
                y={y - height / 2}
                width={width}
                height={height}
                rx={4}
                fill={statusColor}
                stroke={isSelected ? '#0d9488' : (status === 'EMPTY' ? '#d1d5db' : 'none')} // teal-600 if selected
                strokeWidth={isSelected ? 3 : 1}
                className="transition-all duration-200 group-hover:brightness-95"
            />

            {/* Position Label (Hidden by default, shown on hover if needed or just for dev) */}
            <title>{`${position.positionId} (${status})${isPending ? ' - PENDING' : ''}`}</title>
        </g>
    );
};
