'use client';

import React, { useState, useEffect } from 'react';
import { useHeader } from '@/components/HeaderContext';
import { useRouter } from 'next/navigation';
import { useSKUsQuery } from '@/app/(pages)/stock/skus/query';
import {
    ChevronRight,
    ChevronLeft,
    Truck,
    Settings,
    FileCheck,
    CheckCircle2,
    Plus,
    X,
    AlertCircle,
    Info,
    ArrowRightLeft,
    Package,
    Gauge,
    Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Types
type VehicleType = 'Truck' | 'Trailer' | 'Bus';
type AxlePosition = 'Steer' | 'Drive' | 'Tag' | 'Trailer';
type TireConfiguration = 'Single' | 'Dual';
type VehicleStatus = 'Draft' | 'Active';

interface Axle {
    id: string;
    number: number;
    position: AxlePosition;
    tireConfig: TireConfiguration;
    liftAxle: boolean;
    tolerance: number;
}

interface Position {
    id: string;
    positionNumber: string;
    positionCode?: string;
    axleId: string;
    axleNumber: number;
    side: 'Left' | 'Right';
    position: 'Inner' | 'Outer' | 'Single';
    skuRules: SKURule[];
}

interface SKURule {
    id: string;
    type: 'specific' | 'category';
    skuId?: number;
    category?: string;
}

interface VehicleFormData {
    vehicleId: string;
    registrationNumber: string;
    vehicleType: VehicleType;
    make: string;
    model: string;
    year: number;
    status: VehicleStatus;
    assetTolerance: number;
    toleranceBasis: 'None' | 'Reading';
}

export default function AddVehiclePage() {
    const router = useRouter();
    const { setHeader } = useHeader();
    const { data: skus } = useSKUsQuery();

    const [currentStep, setCurrentStep] = useState(1);
    const [vehicleData, setVehicleData] = useState<VehicleFormData>({
        vehicleId: '',
        registrationNumber: '',
        vehicleType: 'Truck',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        status: 'Draft',
        assetTolerance: 0,
        toleranceBasis: 'None',
    });

    const [axles, setAxles] = useState<Axle[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [showAddAxle, setShowAddAxle] = useState(false);
    const [editingAxle, setEditingAxle] = useState<Axle | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

    useEffect(() => {
        setHeader({
            title: 'Add Vehicle & Configure Axles',
            subtitle: 'Define vehicle structure, rules, and operations (IBM MFT Model)',
        });
        return () => setHeader({});
    }, [setHeader]);

    // Step validation
    const canProceedToStep2 = () => {
        return vehicleData.vehicleId && vehicleData.registrationNumber && vehicleData.make && vehicleData.model;
    };

    const canProceedToStep3 = () => {
        return axles.length > 0 && axles.every(axle => axle.tolerance <= vehicleData.assetTolerance);
    };

    const canProceedToStep4 = () => {
        return positions.length > 0 && positions.every(pos => pos.skuRules.length > 0);
    };

    // Generate positions from axles
    useEffect(() => {
        if (currentStep >= 3 && axles.length > 0) {
            const newPositions: Position[] = [];
            axles.forEach(axle => {
                if (axle.tireConfig === 'Single') {
                    // Single: Left, Right
                    newPositions.push({
                        id: `pos-${axle.id}-left`,
                        positionNumber: `A${axle.number}-L`,
                        axleId: axle.id,
                        axleNumber: axle.number,
                        side: 'Left',
                        position: 'Single',
                        skuRules: [],
                    });
                    newPositions.push({
                        id: `pos-${axle.id}-right`,
                        positionNumber: `A${axle.number}-R`,
                        axleId: axle.id,
                        axleNumber: axle.number,
                        side: 'Right',
                        position: 'Single',
                        skuRules: [],
                    });
                } else {
                    // Dual: Left Inner, Left Outer, Right Inner, Right Outer
                    newPositions.push({
                        id: `pos-${axle.id}-left-inner`,
                        positionNumber: `A${axle.number}-LI`,
                        axleId: axle.id,
                        axleNumber: axle.number,
                        side: 'Left',
                        position: 'Inner',
                        skuRules: [],
                    });
                    newPositions.push({
                        id: `pos-${axle.id}-left-outer`,
                        positionNumber: `A${axle.number}-LO`,
                        axleId: axle.id,
                        axleNumber: axle.number,
                        side: 'Left',
                        position: 'Outer',
                        skuRules: [],
                    });
                    newPositions.push({
                        id: `pos-${axle.id}-right-inner`,
                        positionNumber: `A${axle.number}-RI`,
                        axleId: axle.id,
                        axleNumber: axle.number,
                        side: 'Right',
                        position: 'Inner',
                        skuRules: [],
                    });
                    newPositions.push({
                        id: `pos-${axle.id}-right-outer`,
                        positionNumber: `A${axle.number}-RO`,
                        axleId: axle.id,
                        axleNumber: axle.number,
                        side: 'Right',
                        position: 'Outer',
                        skuRules: [],
                    });
                }
            });
            setPositions(newPositions);
        }
    }, [axles, currentStep]);

    const handleAddAxle = (axleData: Omit<Axle, 'id' | 'number'>) => {
        const newAxle: Axle = {
            id: `axle-${Date.now()}`,
            number: axles.length + 1,
            ...axleData,
        };
        setAxles([...axles, newAxle]);
        setShowAddAxle(false);
    };

    const handleUpdateAxle = (id: string, updates: Partial<Axle>) => {
        setAxles(axles.map(axle => axle.id === id ? { ...axle, ...updates } : axle));
        setEditingAxle(null);
    };

    const handleDeleteAxle = (id: string) => {
        setAxles(axles.filter(axle => axle.id !== id));
        setPositions(positions.filter(pos => pos.axleId !== id));
    };

    const handleAddSKURule = (positionId: string, rule: SKURule) => {
        setPositions(positions.map(pos =>
            pos.id === positionId
                ? { ...pos, skuRules: [...pos.skuRules, rule] }
                : pos
        ));
    };

    const handleRemoveSKURule = (positionId: string, ruleId: string) => {
        setPositions(positions.map(pos =>
            pos.id === positionId
                ? { ...pos, skuRules: pos.skuRules.filter(r => r.id !== ruleId) }
                : pos
        ));
    };

    const handleActivate = () => {
        // Here you would save to database
        alert('Vehicle configuration activated successfully!');
        router.push('/operations');
    };

    const steps = [
        { number: 1, title: 'Vehicle Details', icon: Truck },
        { number: 2, title: 'Axle Configuration', icon: Settings },
        { number: 3, title: 'Position Rules', icon: FileCheck },
        { number: 4, title: 'Review & Activate', icon: CheckCircle2 },
    ];

    return (
        <div className="mx-auto flex flex-col gap-6 max-w-6xl">
            {/* Stepper Navigation */}
            <Card className="p-6 border-gray-200">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.number;
                        const isComplete = currentStep > step.number;
                        const isAccessible = currentStep >= step.number || isComplete;

                        return (
                            <React.Fragment key={step.number}>
                                <button
                                    onClick={() => isAccessible && setCurrentStep(step.number)}
                                    disabled={!isAccessible}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-teal-600 text-white shadow-lg'
                                        : isComplete
                                            ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                                            : isAccessible
                                                ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : isComplete ? 'bg-teal-600 text-white' : 'bg-gray-200'
                                        }`}>
                                        {isComplete ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-medium opacity-75">Step {step.number}</div>
                                        <div className="font-semibold">{step.title}</div>
                                    </div>
                                </button>
                                {index < steps.length - 1 && (
                                    <ChevronRight className={`w-5 h-5 ${isComplete ? 'text-teal-600' : 'text-gray-300'
                                        }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </Card>

            {/* Step Content */}
            <Card className="p-8 border-gray-200">
                {/* Step 1: Vehicle Details */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Vehicle Details</h2>
                                <p className="text-sm text-gray-500">Create the asset identity before structure</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Vehicle ID / Fleet Number *</label>
                                <Input
                                    value={vehicleData.vehicleId}
                                    onChange={(e) => setVehicleData({ ...vehicleData, vehicleId: e.target.value })}
                                    placeholder="e.g. FL-7823"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Registration Number *</label>
                                <Input
                                    value={vehicleData.registrationNumber}
                                    onChange={(e) => setVehicleData({ ...vehicleData, registrationNumber: e.target.value })}
                                    placeholder="e.g. ABC-123"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Vehicle Type *</label>
                                <select
                                    value={vehicleData.vehicleType}
                                    onChange={(e) => setVehicleData({ ...vehicleData, vehicleType: e.target.value as VehicleType })}
                                    className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="Truck">Truck</option>
                                    <option value="Trailer">Trailer</option>
                                    <option value="Bus">Bus</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={vehicleData.status}
                                    onChange={(e) => setVehicleData({ ...vehicleData, status: e.target.value as VehicleStatus })}
                                    className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Make *</label>
                                <Input
                                    value={vehicleData.make}
                                    onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
                                    placeholder="e.g. Freightliner"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Model *</label>
                                <Input
                                    value={vehicleData.model}
                                    onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                                    placeholder="e.g. Cascadia"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Year</label>
                                <Input
                                    type="number"
                                    value={vehicleData.year}
                                    onChange={(e) => setVehicleData({ ...vehicleData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Vehicle Type Controls Default Axle Templates</p>
                                    <p className="text-xs">The selected vehicle type will suggest appropriate axle configurations in the next step.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Axle Configuration */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Axle Configuration</h2>
                                <p className="text-sm text-gray-500">Define physical reality of the vehicle</p>
                            </div>
                        </div>

                        {/* Asset-Level Tolerances */}
                        <Card className="p-6 bg-gray-50 border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Gauge className="w-5 h-5 text-teal-600" />
                                Asset-Level Tolerances (IBM Exact Match)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Tolerance Basis</label>
                                    <select
                                        value={vehicleData.toleranceBasis}
                                        onChange={(e) => setVehicleData({ ...vehicleData, toleranceBasis: e.target.value as 'None' | 'Reading' })}
                                        className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="None">None</option>
                                        <option value="Reading">Reading</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Asset Tolerance Value *</label>
                                    <Input
                                        type="number"
                                        value={vehicleData.assetTolerance}
                                        onChange={(e) => setVehicleData({ ...vehicleData, assetTolerance: parseFloat(e.target.value) || 0 })}
                                        placeholder="Max variance across vehicle"
                                        min="0"
                                        step="0.1"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Info className="w-3 h-3" />
                                        Maximum acceptable measurement variance across all positions
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Axle List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Axle List</h3>
                                <Button
                                    onClick={() => setShowAddAxle(true)}
                                    className="bg-teal-600 hover:bg-teal-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Axle
                                </Button>
                            </div>

                            {axles.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No axles configured</p>
                                    <p className="text-sm text-gray-400 mt-1">Click "Add Axle" to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {axles.map((axle) => (
                                        <Card key={axle.id} className="p-4 border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                                        A{axle.number}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{axle.position} Axle</p>
                                                        <p className="text-sm text-gray-600">
                                                            {axle.tireConfig} • Tolerance: {axle.tolerance}
                                                            {axle.liftAxle && ' • Lift Axle'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingAxle(axle)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteAxle(axle.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {axle.tolerance > vehicleData.assetTolerance && (
                                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Axle tolerance ({axle.tolerance}) cannot exceed asset tolerance ({vehicleData.assetTolerance})
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add/Edit Axle Modal */}
                        {(showAddAxle || editingAxle) && (
                            <AxleFormModal
                                axle={editingAxle}
                                assetTolerance={vehicleData.assetTolerance}
                                onSave={(data) => {
                                    if (editingAxle) {
                                        handleUpdateAxle(editingAxle.id, data);
                                    } else {
                                        handleAddAxle(data);
                                    }
                                }}
                                onCancel={() => {
                                    setShowAddAxle(false);
                                    setEditingAxle(null);
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Step 3: Position Rules */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                                <FileCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Position Rules</h2>
                                <p className="text-sm text-gray-500">SKU Rules per position (OR-based logic)</p>
                            </div>
                        </div>

                        {positions.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No positions available</p>
                                <p className="text-sm text-gray-400 mt-1">Configure axles in Step 2 first</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {axles.map((axle) => {
                                    const axlePositions = positions.filter(p => p.axleId === axle.id);
                                    return (
                                        <Card key={axle.id} className="p-6 border-gray-200">
                                            <h3 className="font-semibold text-gray-900 mb-4">
                                                Axle {axle.number} ({axle.position}) - {axle.tireConfig}
                                            </h3>
                                            <div className="space-y-4">
                                                {axlePositions.map((position) => (
                                                    <PositionRulesCard
                                                        key={position.id}
                                                        position={position}
                                                        skus={skus || []}
                                                        onAddRule={(rule) => handleAddSKURule(position.id, rule)}
                                                        onRemoveRule={(ruleId) => handleRemoveSKURule(position.id, ruleId)}
                                                    />
                                                ))}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">OR-Based Logic (IBM MFT Model)</p>
                                    <p className="text-xs">Multiple rules = OR. Tire assigned to this position must meet at least one rule.</p>
                                    <p className="text-xs mt-1">If no rules defined: Any SKU marked as Tire is allowed.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Review & Activate */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Review & Activate</h2>
                                <p className="text-sm text-gray-500">Verify configuration before activation</p>
                            </div>
                        </div>

                        <ReviewSummary
                            vehicleData={vehicleData}
                            axles={axles}
                            positions={positions}
                            skus={skus || []}
                        />

                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium mb-1">Activation Rules</p>
                                    <ul className="text-xs list-disc list-inside space-y-1">
                                        <li>All axles defined</li>
                                        <li>All positions created</li>
                                        <li>Tolerances valid</li>
                                        <li>No conflicting rules</li>
                                    </ul>
                                    <p className="text-xs mt-2 font-medium">Once activated, configuration becomes immutable and is used by tire issue, inventory validation, rotations, and inspections.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (currentStep > 1) {
                                setCurrentStep(currentStep - 1);
                            } else {
                                router.back();
                            }
                        }}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        {currentStep === 1 ? 'Cancel' : 'Previous'}
                    </Button>
                    <div className="flex gap-3">
                        {currentStep < 4 ? (
                            <Button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={
                                    (currentStep === 1 && !canProceedToStep2()) ||
                                    (currentStep === 2 && !canProceedToStep3()) ||
                                    (currentStep === 3 && !canProceedToStep4())
                                }
                                className="bg-teal-600 hover:bg-teal-700"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleActivate}
                                disabled={!canProceedToStep4()}
                                className="bg-teal-600 hover:bg-teal-700"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Activate Configuration
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}

// Axle Form Modal Component
function AxleFormModal({
    axle,
    assetTolerance,
    onSave,
    onCancel,
}: {
    axle: Axle | null;
    assetTolerance: number;
    onSave: (data: Omit<Axle, 'id' | 'number'>) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<Omit<Axle, 'id' | 'number'>>({
        position: axle?.position || 'Steer',
        tireConfig: axle?.tireConfig || 'Single',
        liftAxle: axle?.liftAxle || false,
        tolerance: axle?.tolerance || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.tolerance > assetTolerance) {
            alert(`Axle tolerance cannot exceed asset tolerance (${assetTolerance})`);
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{axle ? 'Edit Axle' : 'Add Axle'}</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Axle Position *</label>
                        <select
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value as AxlePosition })}
                            className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                            required
                        >
                            <option value="Steer">Steer</option>
                            <option value="Drive">Drive</option>
                            <option value="Tag">Tag</option>
                            <option value="Trailer">Trailer</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tire Configuration *</label>
                        <select
                            value={formData.tireConfig}
                            onChange={(e) => setFormData({ ...formData, tireConfig: e.target.value as TireConfiguration })}
                            className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                            required
                        >
                            <option value="Single">Single</option>
                            <option value="Dual">Dual</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Axle Tolerance *</label>
                        <Input
                            type="number"
                            value={formData.tolerance}
                            onChange={(e) => setFormData({ ...formData, tolerance: parseFloat(e.target.value) || 0 })}
                            min="0"
                            max={assetTolerance}
                            step="0.1"
                            required
                        />
                        <p className="text-xs text-gray-500">Must be ≤ Asset tolerance ({assetTolerance})</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="liftAxle"
                            checked={formData.liftAxle}
                            onChange={(e) => setFormData({ ...formData, liftAxle: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="liftAxle" className="text-sm text-gray-700">Lift Axle</label>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">
                            {axle ? 'Update' : 'Add'} Axle
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

// Position Rules Card Component
function PositionRulesCard({
    position,
    skus,
    onAddRule,
    onRemoveRule,
}: {
    position: Position;
    skus: any[];
    onAddRule: (rule: SKURule) => void;
    onRemoveRule: (ruleId: string) => void;
}) {
    const [showAddRule, setShowAddRule] = useState(false);
    const [ruleType, setRuleType] = useState<'specific' | 'category'>('specific');
    const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const handleAddRule = () => {
        if (ruleType === 'specific' && selectedSkuId) {
            onAddRule({
                id: `rule-${Date.now()}`,
                type: 'specific',
                skuId: selectedSkuId,
            });
            setShowAddRule(false);
            setSelectedSkuId(null);
        } else if (ruleType === 'category' && selectedCategory) {
            onAddRule({
                id: `rule-${Date.now()}`,
                type: 'category',
                category: selectedCategory,
            });
            setShowAddRule(false);
            setSelectedCategory('');
        }
    };

    const getSKUName = (skuId: number) => {
        const sku = skus.find(s => s.id === skuId);
        return sku ? `${sku.brand} ${sku.model} (${sku.size})` : 'Unknown SKU';
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="font-medium text-gray-900">{position.positionNumber}</p>
                    <p className="text-xs text-gray-500">
                        {position.side} {position.position !== 'Single' && position.position}
                    </p>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddRule(true)}
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Rule
                </Button>
            </div>

            {position.skuRules.length === 0 ? (
                <div className="text-sm text-gray-500 italic">
                    No rules defined - Any Tire SKU allowed
                </div>
            ) : (
                <div className="space-y-2">
                    {position.skuRules.map((rule, index) => (
                        <div key={rule.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500">OR</span>
                                <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                                    {rule.type === 'specific'
                                        ? getSKUName(rule.skuId!)
                                        : `Category: ${rule.category}`
                                    }
                                </Badge>
                            </div>
                            <button
                                onClick={() => onRemoveRule(rule.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showAddRule && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-300 space-y-3">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">Rule Type</label>
                        <select
                            value={ruleType}
                            onChange={(e) => setRuleType(e.target.value as 'specific' | 'category')}
                            className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-sm"
                        >
                            <option value="specific">Specific SKU</option>
                            <option value="category">SKU Category</option>
                        </select>
                    </div>
                    {ruleType === 'specific' ? (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Select SKU</label>
                            <select
                                value={selectedSkuId || ''}
                                onChange={(e) => setSelectedSkuId(Number(e.target.value))}
                                className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-sm"
                            >
                                <option value="">Choose SKU...</option>
                                {skus.map(sku => (
                                    <option key={sku.id} value={sku.id}>
                                        {sku.brand} {sku.model} - {sku.size}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Select Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-sm"
                            >
                                <option value="">Choose Category...</option>
                                <option value="Steer">Steer</option>
                                <option value="Drive">Drive</option>
                                <option value="Trailer">Trailer</option>
                            </select>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleAddRule}
                            disabled={ruleType === 'specific' ? !selectedSkuId : !selectedCategory}
                            className="flex-1 bg-teal-600 hover:bg-teal-700"
                        >
                            Add
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setShowAddRule(false);
                                setSelectedSkuId(null);
                                setSelectedCategory('');
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Review Summary Component
function ReviewSummary({
    vehicleData,
    axles,
    positions,
    skus,
}: {
    vehicleData: VehicleFormData;
    axles: Axle[];
    positions: Position[];
    skus: any[];
}) {
    const getSKUName = (skuId: number) => {
        const sku = skus.find(s => s.id === skuId);
        return sku ? `${sku.brand} ${sku.model}` : 'Unknown';
    };

    return (
        <div className="space-y-6">
            {/* Vehicle Summary */}
            <Card className="p-6 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Vehicle</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">ID</p>
                        <p className="font-medium">{vehicleData.vehicleId}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium">{vehicleData.vehicleType}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Make/Model</p>
                        <p className="font-medium">{vehicleData.make} {vehicleData.model}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Status</p>
                        <Badge variant="outline">{vehicleData.status}</Badge>
                    </div>
                </div>
            </Card>

            {/* Tolerances Summary */}
            <Card className="p-6 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Tolerances</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Asset Tolerance</span>
                        <span className="font-semibold">{vehicleData.assetTolerance}</span>
                    </div>
                    {axles.map(axle => (
                        <div key={axle.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm">Axle {axle.number} ({axle.position})</span>
                            <span className="font-medium">{axle.tolerance}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Axles & Positions Summary */}
            <Card className="p-6 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Axles & Positions</h3>
                <div className="space-y-4">
                    {axles.map(axle => {
                        const axlePositions = positions.filter(p => p.axleId === axle.id);
                        return (
                            <div key={axle.id} className="border-l-4 border-teal-500 pl-4">
                                <p className="font-medium text-gray-900 mb-2">
                                    Axle {axle.number} - {axle.position} ({axle.tireConfig})
                                </p>
                                <div className="space-y-2 ml-4">
                                    {axlePositions.map(pos => (
                                        <div key={pos.id} className="text-sm">
                                            <span className="font-medium">{pos.positionNumber}:</span>
                                            {pos.skuRules.length > 0 ? (
                                                <div className="ml-2 mt-1 space-y-1">
                                                    {pos.skuRules.map(rule => (
                                                        <Badge key={rule.id} variant="outline" className="mr-1">
                                                            {rule.type === 'specific'
                                                                ? getSKUName(rule.skuId!)
                                                                : `Category: ${rule.category}`
                                                            }
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="ml-2 text-gray-500 italic">Any Tire SKU</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}


