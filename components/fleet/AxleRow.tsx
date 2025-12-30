'use client';

import React from 'react';
import { TireNode, TirePosition, TireStatus } from './TireNode';

export type AxleType = 'STEER' | 'DRIVE' | 'TRAILER' | 'TAG' | 'LIFT';

export interface AxleData {
    axleNumber: number;
    axleType: AxleType;
    tiresPerSide: number;
}

interface AxleRowProps {
    axle: AxleData;
    y: number;
    centerX: number;
    tireWidth: number;
    tireHeight: number;
    tireSpacing: number;
    axleWidth: number;
    tireStatuses?: Record<string, TireStatus>;
    pendingAssignments?: Record<string, string>;
    selectedPositionId?: string | null;
    onTireClick?: (position: TirePosition & { status: TireStatus }) => void;
    onTireMouseEnter?: (position: TirePosition & { status: TireStatus }, event: React.MouseEvent) => void;
    onTireMouseLeave?: () => void;
}

export const AxleRow: React.FC<AxleRowProps> = ({
    axle,
    y,
    centerX,
    tireWidth,
    tireHeight,
    tireSpacing,
    axleWidth,
    tireStatuses = {},
    pendingAssignments = {},
    selectedPositionId = null,
    onTireClick,
    onTireMouseEnter,
    onTireMouseLeave,
}) => {
    const renderTires = (side: 'LEFT' | 'RIGHT') => {
        const tires = [];
        const sideMultiplier = side === 'LEFT' ? -1 : 1;

        for (let i = 0; i < axle.tiresPerSide; i++) {
            // Offset from center based on axle width and tire index
            // inner tire is closer to center
            const xOffset = (axleWidth / 2 + i * (tireWidth + tireSpacing)) * sideMultiplier;
            const positionId = `A${axle.axleNumber}-${side}${i + 1}`;
            const status = tireStatuses[positionId] || 'EMPTY';
            const isPending = !!pendingAssignments[positionId];
            const isSelected = selectedPositionId === positionId;

            tires.push(
                <TireNode
                    key={positionId}
                    position={{ positionId, side, index: i }}
                    status={status}
                    isPending={isPending}
                    isSelected={isSelected}
                    x={centerX + xOffset}
                    y={y}
                    width={tireWidth}
                    height={tireHeight}
                    onClick={onTireClick}
                    onMouseEnter={onTireMouseEnter}
                    onMouseLeave={onTireMouseLeave}
                />
            );
        }
        return tires;
    };

    return (
        <g className="axle-row">
            {/* Axle Line */}
            <line
                x1={centerX - axleWidth / 2}
                y1={y}
                x2={centerX + axleWidth / 2}
                y2={y}
                stroke="#9ca3af" // gray-400
                strokeWidth={2}
                strokeDasharray={axle.axleType === 'LIFT' || axle.axleType === 'TAG' ? "4 2" : "none"}
            />

            {/* Left Tires */}
            {renderTires('LEFT')}

            {/* Right Tires */}
            {renderTires('RIGHT')}

            {/* Axle Label */}
            <text
                x={centerX}
                y={y - tireHeight / 2 - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#6b7280" // gray-500
                className="uppercase tracking-wider select-none"
            >
                {`Axle ${axle.axleNumber} - ${axle.axleType}`}
            </text>
        </g>
    );
};
