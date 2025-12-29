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

    const statusColor = getStatusColor(status);

    return (
        <g
            className="tire-node group cursor-pointer"
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
                stroke={status === 'EMPTY' ? '#d1d5db' : 'none'}
                strokeWidth={1}
                className="transition-colors duration-200 group-hover:brightness-95"
            />

            {/* Position Label (Hidden by default, shown on hover if needed or just for dev) */}
            <title>{`${position.positionId} (${status})`}</title>
        </g>
    );
};
