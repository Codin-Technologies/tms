'use client';

import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { useHeader } from '@/components/HeaderContext';
import { useRouter } from 'next/navigation';
import { useSKUsQuery } from '@/app/(pages)/inventory/query';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
    Package,
    Gauge,
    Shield,
    Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, Transition } from '@headlessui/react';
import { VehicleAxleDiagram, VehicleAxleData } from '@/components/fleet/VehicleAxleDiagram';
import { AxleType } from '@/components/fleet/AxleRow';
import { createVehicle } from '@/actions/vehicle';
import { toast } from 'sonner';

// ============================================================================
// TYPE DEFINITIONS (Strict TypeScript Interfaces)
// ============================================================================

type VehicleType = 'Truck' | 'Bus' | 'Trailer';
type AxlePosition = 'Steer' | 'Drive' | 'Tag' | 'Trailer';
type TireConfiguration = 'Single' | 'Dual';
type VehicleStatus = 'Draft' | 'Active';
type ToleranceBasis = 'None' | 'Reading';
type SKURuleType = 'specific' | 'category' | 'commodity';

export interface Axle {
    id: string;
    number: number;
    position: AxlePosition;
    tireConfig: TireConfiguration;
    liftAxle: boolean;
    tolerance: number;
}

export interface Position {
    id: string;
    positionNumber: string;
    positionCode?: string;
    axleId: string;
    axleNumber: number;
    side: 'Left' | 'Right';
    position: 'Inner' | 'Outer' | 'Single';
    skuRules: SKURule[];
}

export interface SKURule {
    id: string;
    type: SKURuleType;
    skuId?: number;
    category?: string;
    commodityCode?: string;
}

export interface VehicleConfiguration {
    vehicleId: string;
    description: string;
    vin?: string;
    registrationNumber: string;
    vehicleType: VehicleType;
    make: string;
    model: string;
    year: number;
    status: VehicleStatus;
    assetTolerance: number;
    toleranceBasis: ToleranceBasis;
    axles: Axle[];
    positions: Position[];
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const vehicleDetailsSchema = z.object({
    vehicleId: z.string().min(1, 'Vehicle ID is required'),
    description: z.string().min(1, 'Asset Description is required'),
    vin: z.string().optional(),
    registrationNumber: z.string().optional(),
    vehicleType: z.enum(['Truck', 'Bus', 'Trailer']),
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    status: z.enum(['Draft', 'Active']),
});

const axleSchema = z.object({
    position: z.enum(['Steer', 'Drive', 'Tag', 'Trailer']),
    tireConfig: z.enum(['Single', 'Dual']),
    liftAxle: z.boolean(),
    tolerance: z.number().min(0, 'Tolerance must be >= 0'),
});

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AddVehiclePage() {
    const router = useRouter();
    const { setHeader } = useHeader();
    const { data: skus } = useSKUsQuery();

    const [currentStep, setCurrentStep] = useState(1);
    const [vehicleData, setVehicleData] = useState<Partial<VehicleConfiguration>>({
        vehicleId: '',
        description: '',
        vin: '',
        registrationNumber: '',
        vehicleType: 'Truck',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        status: 'Draft',
        assetTolerance: 0,
        toleranceBasis: 'None',
        axles: [],
        positions: [],
    });

    const [axles, setAxles] = useState<Axle[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [showAddAxle, setShowAddAxle] = useState(false);
    const [editingAxle, setEditingAxle] = useState<Axle | null>(null);


    useEffect(() => {
        // Header action replaces the floating button: single source of Proceed/Create
        const proceedHandler = async () => {
            if (currentStep < 4) {
                if (currentStep === 1) {
                    const form = document.getElementById('vehicle-details-form') as HTMLFormElement;
                    if (form) {
                        form.requestSubmit();
                        return;
                    }
                }
                if (currentStep === 2 && !canProceedToStep3()) {
                    toast('Please complete axle configuration before proceeding');
                    return;
                }
                if (currentStep === 3 && !canProceedToStep4()) {
                    toast('Please configure positions before proceeding');
                    return;
                }
                setCurrentStep(currentStep + 1);
            } else {
                if (!canActivate()) {
                    toast('Please complete the configuration before creating the asset');
                    return;
                }
                await handleActivate();
            }
        };

        setHeader({
            title: 'Add Vehicle & Configure Axles',
            subtitle: 'Define vehicle structure, rules, and operations (IBM MFT Model)',
            actionLabel: currentStep < 4 ? 'Proceed' : 'Create Asset',
            actions: (
                <button
                    onClick={proceedHandler}
                    className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
                >
                    {currentStep < 4 ? 'Proceed' : 'Create Asset'}
                </button>
            ),
        });

        return () => setHeader({});
    }, [setHeader, currentStep, vehicleData, axles, positions]);

    // Auto-generate positions when axles change (Step 3)
    useEffect(() => {
        if (currentStep >= 3 && axles.length > 0) {
            const newPositions: Position[] = [];
            axles.forEach(axle => {
                if (axle.tireConfig === 'Single') {
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

    // Step validation functions
    const canProceedToStep2 = () => {
        return vehicleData.vehicleId &&
            vehicleData.make &&
            vehicleData.model &&
            vehicleData.description;
    };

    const canProceedToStep3 = () => {
        return axles.length > 0 &&
            axles.every(axle => axle.tolerance <= (vehicleData.assetTolerance || 0)) &&
            vehicleData.assetTolerance !== undefined;
    };

    const canProceedToStep4 = () => {
        return positions.length > 0;
    };

    const canActivate = () => {
        return canProceedToStep4() &&
            axles.length > 0 &&
            positions.every(pos => pos.skuRules.length >= 0) && // Rules are optional (OR logic)
            axles.every(axle => axle.tolerance <= (vehicleData.assetTolerance || 0));
    };

    // Handlers
    const handleStep1Submit = (data: z.infer<typeof vehicleDetailsSchema>) => {
        setVehicleData({ ...vehicleData, ...data });
        // Proceed to next step after validation
        setTimeout(() => setCurrentStep(2), 0);
    };

    const handleAddAxle = (axleData: Omit<Axle, 'id' | 'number'>) => {
        const newAxle: Axle = {
            id: `axle-${Date.now()}`,
            number: axles.length + 1,
            ...axleData,
        };
        setAxles([...axles, newAxle]);
        setShowAddAxle(false);
        setEditingAxle(null);
    };

    const handleUpdateAxle = (id: string, updates: Partial<Axle>) => {
        setAxles(axles.map(axle => axle.id === id ? { ...axle, ...updates } : axle));
        setEditingAxle(null);
    };

    const handleDeleteAxle = (id: string) => {
        if (vehicleData.status === 'Active') {
            alert('Cannot delete axles from active configuration');
            return;
        }
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

    const handleActivate = async () => {
        try {
            const payload = {
                ...vehicleData,
                axles: axles.map(a => ({
                    ...a,
                    positions: positions.filter(p => p.axleId === a.id)
                }))
            };

            const result = await createVehicle(payload);

            if (result.success) {
                toast.success("Vehicle created and activated successfully");
                router.push('/operations');
            } else {
                toast.error(result.message || "Failed to create vehicle");
            }
        } catch (error) {
            console.error("handleActivate error:", error);
            toast.error("An error occurred while activating vehicle");
        }
    };

    const steps = [
        { number: 1, title: 'Vehicle Details', icon: Truck },
        { number: 2, title: 'Axle Configuration', icon: Settings },
        { number: 3, title: 'Position & SKU Rules', icon: FileCheck },
        { number: 4, title: 'Review & Activate', icon: CheckCircle2 },
    ];

    return (
        <div className="w-full bg-white min-h-screen px-2 md:px-4">
            <div className="w-full">
                {/* Full-width form */}
                <div className="flex flex-col gap-6">
                        {/* Step Content (large left column) - removed top stepper per design */}
                    <div className="relative">
                        {/* Progress indicator */}
                        <div className="mt-8 mb-8">
                            <div className="flex items-center gap-8">
                                {["Details", "Axles", "Positions", "Review"].map((label, idx) => {
                                    const stepNum = idx + 1;
                                    const isActive = currentStep === stepNum;
                                    const isComplete = currentStep > stepNum;
                                    return (
                                        <div key={label} className="flex items-center gap-4">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isComplete ? 'bg-teal-600 text-white' : isActive ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-gray-100 text-gray-500'}`}>
                                                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-sm font-medium">{stepNum}</span>}
                                            </div>
                                            <div className={`text-sm ${isComplete ? 'text-teal-700' : isActive ? 'text-teal-700 font-medium' : 'text-gray-500'}`}>{label}</div>
                                        </div>
                                    );
                                })}

                                <div className="flex-1 h-2 bg-gray-200 rounded-full ml-6">
                                    <div className="h-2 bg-teal-600 rounded-full transition-all duration-300" style={{ width: `${Math.round((currentStep / 4) * 100)}%` }} />
                                </div>
                            </div>
                        </div>

                        <Card className="p-8 border-gray-200">
                            {currentStep === 1 && (
                                <Step1VehicleDetails
                                    onSubmit={handleStep1Submit}
                                    vehicleData={vehicleData}
                                    onUpdate={setVehicleData}
                                />
                            )}

                            {currentStep === 2 && (
                                <Step2AxleConfiguration
                                    vehicleData={vehicleData}
                                    axles={axles}
                                    onUpdateVehicleData={setVehicleData}
                                    onAddAxle={handleAddAxle}
                                    onUpdateAxle={handleUpdateAxle}
                                    onDeleteAxle={handleDeleteAxle}
                                    showAddAxle={showAddAxle}
                                    editingAxle={editingAxle}
                                    onShowAddAxle={setShowAddAxle}
                                    onSetEditingAxle={setEditingAxle}
                                />
                            )}

                            {currentStep === 3 && (
                                <Step3PositionRules
                                    axles={axles}
                                    positions={positions}
                                    skus={skus || []}
                                    onAddRule={handleAddSKURule}
                                    onRemoveRule={handleRemoveSKURule}
                                    onUpdatePosition={(id, updates) => {
                                        setPositions(positions.map(pos =>
                                            pos.id === id ? { ...pos, ...updates } : pos
                                        ));
                                    }}
                                />
                            )}

                            {currentStep === 4 && (
                                <Step4ReviewActivate
                                    vehicleData={vehicleData}
                                    axles={axles}
                                    positions={positions}
                                    skus={skus || []}
                                    onActivate={handleActivate}
                                    canActivate={canActivate()}
                                />
                            )}

                        </Card>


                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// STEPPER NAVIGATION COMPONENT
// ============================================================================

function StepperNavigation({
    steps,
    currentStep,
    onStepClick,
}: {
    steps: Array<{ number: number; title: string; icon: any }>;
    currentStep: number;
    onStepClick: (step: number) => void;
}) {
    return (
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
                                onClick={() => isAccessible && onStepClick(step.number)}
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
    );
}

// ============================================================================
// STEP 1: VEHICLE DETAILS
// ============================================================================

function Step1VehicleDetails({
    onSubmit,
    vehicleData,
    onUpdate,
}: {
    onSubmit: (data: z.infer<typeof vehicleDetailsSchema>) => void;
    vehicleData: Partial<VehicleConfiguration>;
    onUpdate: (data: Partial<VehicleConfiguration>) => void;
}) {
    const methods = useForm({
        resolver: zodResolver(vehicleDetailsSchema),
        defaultValues: {
            vehicleId: vehicleData.vehicleId || '',
            description: vehicleData.description || '',
            vin: vehicleData.vin || '',
            registrationNumber: vehicleData.registrationNumber || '',
            vehicleType: vehicleData.vehicleType || 'Truck',
            make: vehicleData.make || '',
            model: vehicleData.model || '',
            year: vehicleData.year || new Date().getFullYear(),
            status: vehicleData.status || 'Draft',
        },
        mode: 'onChange',
    });

    // Update parent state on form changes
    useEffect(() => {
        const subscription = methods.watch((value) => {
            onUpdate({ ...vehicleData, ...value });
        });
        return () => subscription.unsubscribe();
    }, [methods.watch, onUpdate, vehicleData]);

    return (
        <form id="vehicle-details-form" onSubmit={(e) => {
            e.preventDefault();
            methods.handleSubmit(onSubmit)(e);
        }} className="space-y-6">
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
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Asset Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        {...methods.register('description')}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                        placeholder="A short description of the asset (e.g., Tridem prime mover assigned to depot)"
                    />
                    {methods.formState.errors.description && (
                        <p className="text-xs text-red-600">{methods.formState.errors.description.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Vehicle ID / Fleet Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                        {...methods.register('vehicleId')}
                        placeholder="e.g. FL-7823"
                    />
                    {methods.formState.errors.vehicleId && (
                        <p className="text-xs text-red-600">{methods.formState.errors.vehicleId.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Registration Number</label>
                    <Input
                        {...methods.register('registrationNumber')}
                        placeholder="e.g. ABC-123"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">VIN</label>
                    <Input
                        {...methods.register('vin')}
                        placeholder="Vehicle Identification Number"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...methods.register('vehicleType')}
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
                        {...methods.register('status')}
                        className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Make <span className="text-red-500">*</span>
                    </label>
                    <Input
                        {...methods.register('make')}
                        placeholder="e.g. Freightliner"
                    />
                    {methods.formState.errors.make && (
                        <p className="text-xs text-red-600">{methods.formState.errors.make.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Model <span className="text-red-500">*</span>
                    </label>
                    <Input
                        {...methods.register('model')}
                        placeholder="e.g. Cascadia"
                    />
                    {methods.formState.errors.model && (
                        <p className="text-xs text-red-600">{methods.formState.errors.model.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Year</label>
                    <Input
                        type="number"
                        {...methods.register('year', { valueAsNumber: true })}
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
        </form>
    );
}

// ============================================================================
// STEP 2: AXLE CONFIGURATION
// ============================================================================

function Step2AxleConfiguration({
    vehicleData,
    axles,
    onUpdateVehicleData,
    onAddAxle,
    onUpdateAxle,
    onDeleteAxle,
    showAddAxle,
    editingAxle,
    onShowAddAxle,
    onSetEditingAxle,
}: {
    vehicleData: Partial<VehicleConfiguration>;
    axles: Axle[];
    onUpdateVehicleData: (data: Partial<VehicleConfiguration>) => void;
    onAddAxle: (data: Omit<Axle, 'id' | 'number'>) => void;
    onUpdateAxle: (id: string, updates: Partial<Axle>) => void;
    onDeleteAxle: (id: string) => void;
    showAddAxle: boolean;
    editingAxle: Axle | null;
    onShowAddAxle: (show: boolean) => void;
    onSetEditingAxle: (axle: Axle | null) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Axle Configuration</h2>
                    <p className="text-sm text-gray-500">Define physical reality of the vehicle (IBM MFT Model)</p>
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
                            value={vehicleData.toleranceBasis || 'None'}
                            onChange={(e) => onUpdateVehicleData({
                                ...vehicleData,
                                toleranceBasis: e.target.value as ToleranceBasis
                            })}
                            className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="None">None</option>
                            <option value="Reading">Reading</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Asset Tolerance Value {vehicleData.toleranceBasis !== 'None' && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                            type="number"
                            value={vehicleData.assetTolerance || 0}
                            onChange={(e) => onUpdateVehicleData({
                                ...vehicleData,
                                assetTolerance: parseFloat(e.target.value) || 0
                            })}
                            placeholder="Max variance across vehicle"
                            min="0"
                            step="0.1"
                            required={vehicleData.toleranceBasis !== 'None'}
                        />
                        <div className="flex items-start gap-1 text-xs text-gray-500">
                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>Maximum acceptable measurement variance across all positions</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Axles Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Axles</h3>
                    <Button
                        onClick={() => onShowAddAxle(true)}
                        className="bg-teal-600 hover:bg-teal-700"
                        disabled={vehicleData.status === 'Active'}
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
                            <AxleCard
                                key={axle.id}
                                axle={axle}
                                assetTolerance={vehicleData.assetTolerance || 0}
                                onEdit={() => onSetEditingAxle(axle)}
                                onDelete={() => onDeleteAxle(axle.id)}
                                canEdit={vehicleData.status === 'Draft'}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Axle Dialog */}
            {(showAddAxle || editingAxle) && (
                <AxleFormDialog
                    axle={editingAxle}
                    assetTolerance={vehicleData.assetTolerance || 0}
                    onSave={(data) => {
                        if (editingAxle) {
                            onUpdateAxle(editingAxle.id, data);
                        } else {
                            onAddAxle(data);
                        }
                    }}
                    onClose={() => {
                        onShowAddAxle(false);
                        onSetEditingAxle(null);
                    }}
                />
            )}
        </div>
    );
}

// Axle Card Component
function AxleCard({
    axle,
    assetTolerance,
    onEdit,
    onDelete,
    canEdit,
}: {
    axle: Axle;
    assetTolerance: number;
    onEdit: () => void;
    onDelete: () => void;
    canEdit: boolean;
}) {
    const isValid = axle.tolerance <= assetTolerance;

    return (
        <Card className="p-4 border-gray-200">
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
                {canEdit && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onEdit}>
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDelete}
                            className="text-red-600 hover:text-red-700"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
            {!isValid && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    Axle tolerance ({axle.tolerance}) cannot exceed asset tolerance ({assetTolerance})
                </div>
            )}
        </Card>
    );
}

// Axle Form Dialog (Headless UI)
function AxleFormDialog({
    axle,
    assetTolerance,
    onSave,
    onClose,
}: {
    axle: Axle | null;
    assetTolerance: number;
    onSave: (data: Omit<Axle, 'id' | 'number'>) => void;
    onClose: () => void;
}) {
    const [formData, setFormData] = useState<Omit<Axle, 'id' | 'number'>>({
        position: axle?.position || 'Steer',
        tireConfig: axle?.tireConfig || 'Single',
        liftAxle: axle?.liftAxle || false,
        tolerance: axle?.tolerance || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validation = axleSchema.safeParse(formData);
        if (!validation.success) {
            alert(validation.error.issues[0].message);
            return;
        }
        if (formData.tolerance > assetTolerance) {
            alert(`Axle tolerance cannot exceed asset tolerance (${assetTolerance})`);
            return;
        }
        onSave(formData);
    };

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title className="text-lg font-semibold">
                                        {axle ? 'Edit Axle' : 'Add Axle'}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
                                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">
                                            {axle ? 'Update' : 'Add'} Axle
                                        </Button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

// ============================================================================
// STEP 3: POSITION & SKU RULES
// ============================================================================

function Step3PositionRules({
    axles,
    positions,
    skus,
    onAddRule,
    onRemoveRule,
    onUpdatePosition,
}: {
    axles: Axle[];
    positions: Position[];
    skus: any[];
    onAddRule: (positionId: string, rule: SKURule) => void;
    onRemoveRule: (positionId: string, ruleId: string) => void;
    onUpdatePosition: (id: string, updates: Partial<Position>) => void;
}) {
    // Mock position codes master list
    const positionCodes = ['FL', 'FR', 'RL', 'RR', 'SPARE'];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Position & SKU Rules</h2>
                    <p className="text-sm text-gray-500">SKU Rules per position (IBM Item Rules - OR-based logic)</p>
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
                    {/* Positions Table */}
                    <Card className="p-6 border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Positions Table</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position Number</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Axle</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU Rules</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {positions.map((position) => {
                                        const axle = axles.find(a => a.id === position.axleId);
                                        return (
                                            <tr key={position.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {position.positionNumber}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={position.positionCode || ''}
                                                        onChange={(e) => onUpdatePosition(position.id, { positionCode: e.target.value || undefined })}
                                                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-teal-500"
                                                    >
                                                        <option value="">None</option>
                                                        {positionCodes.map(code => (
                                                            <option key={code} value={code}>{code}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    Axle {position.axleNumber} ({axle?.position})
                                                </td>
                                                <td className="px-4 py-3">
                                                    {position.skuRules.length === 0 ? (
                                                        <span className="text-xs text-gray-400 italic">Any Tire SKU</span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1">
                                                            {position.skuRules.map((rule, idx) => (
                                                                <React.Fragment key={rule.id}>
                                                                    {idx > 0 && <span className="text-xs text-gray-400">OR</span>}
                                                                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                                                                        {rule.type === 'specific'
                                                                            ? `SKU: ${skus.find(s => s.id === rule.skuId)?.skuCode || 'N/A'}`
                                                                            : rule.type === 'category'
                                                                                ? `Category: ${rule.category}`
                                                                                : `Commodity: ${rule.commodityCode}`
                                                                        }
                                                                    </Badge>
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <SKURuleBuilder
                                                        position={position}
                                                        skus={skus}
                                                        onAddRule={(rule) => onAddRule(position.id, rule)}
                                                        onRemoveRule={(ruleId) => onRemoveRule(position.id, ruleId)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* OR Logic Explanation */}
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
        </div>
    );
}

// SKU Rule Builder Component
function SKURuleBuilder({
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
    const [showBuilder, setShowBuilder] = useState(false);
    const [ruleType, setRuleType] = useState<SKURuleType>('specific');
    const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [commodityCode, setCommodityCode] = useState<string>('');

    const handleAddRule = () => {
        if (ruleType === 'specific' && selectedSkuId) {
            onAddRule({
                id: `rule-${Date.now()}`,
                type: 'specific',
                skuId: selectedSkuId,
            });
            setShowBuilder(false);
            setSelectedSkuId(null);
        } else if (ruleType === 'category' && selectedCategory) {
            onAddRule({
                id: `rule-${Date.now()}`,
                type: 'category',
                category: selectedCategory,
            });
            setShowBuilder(false);
            setSelectedCategory('');
        } else if (ruleType === 'commodity' && commodityCode) {
            onAddRule({
                id: `rule-${Date.now()}`,
                type: 'commodity',
                commodityCode: commodityCode,
            });
            setShowBuilder(false);
            setCommodityCode('');
        }
    };

    return (
        <div className="relative flex items-center gap-2">
            <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBuilder(true)}
            >
                <Plus className="w-4 h-4 mr-1" />
                Add Rule
            </Button>
            {showBuilder && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowBuilder(false)}></div>
                    <div className="absolute z-50 top-full left-0 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg space-y-3 min-w-[300px]">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Add SKU Rule</span>
                            <button onClick={() => setShowBuilder(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Rule Type</label>
                            <select
                                value={ruleType}
                                onChange={(e) => setRuleType(e.target.value as SKURuleType)}
                                className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="specific">Specific SKU</option>
                                <option value="category">SKU Category</option>
                                <option value="commodity">Commodity Code</option>
                            </select>
                        </div>
                        {ruleType === 'specific' && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-700">Select SKU</label>
                                <select
                                    value={selectedSkuId || ''}
                                    onChange={(e) => setSelectedSkuId(Number(e.target.value))}
                                    className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Choose SKU...</option>
                                    {skus.map(sku => (
                                        <option key={sku.id} value={sku.id}>
                                            {sku.brand} {sku.model} - {sku.size} ({sku.skuCode})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {ruleType === 'category' && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-700">Select Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Choose Category...</option>
                                    <option value="Steer">Steer</option>
                                    <option value="Drive">Drive</option>
                                    <option value="Trailer">Trailer</option>
                                </select>
                            </div>
                        )}
                        {ruleType === 'commodity' && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-700">Commodity Code</label>
                                <Input
                                    value={commodityCode}
                                    onChange={(e) => setCommodityCode(e.target.value)}
                                    placeholder="Enter commodity code"
                                    className="h-9 text-sm"
                                />
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleAddRule}
                                disabled={
                                    (ruleType === 'specific' && !selectedSkuId) ||
                                    (ruleType === 'category' && !selectedCategory) ||
                                    (ruleType === 'commodity' && !commodityCode)
                                }
                                className="flex-1 bg-teal-600 hover:bg-teal-700"
                            >
                                Add
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setShowBuilder(false);
                                    setSelectedSkuId(null);
                                    setSelectedCategory('');
                                    setCommodityCode('');
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================================================
// STEP 4: REVIEW & ACTIVATE
// ============================================================================

function Step4ReviewActivate({
    vehicleData,
    axles,
    positions,
    skus,
    onActivate,
    canActivate,
}: {
    vehicleData: Partial<VehicleConfiguration>;
    axles: Axle[];
    positions: Position[];
    skus: any[];
    onActivate: () => void;
    canActivate: boolean;
}) {
    const getSKUName = (skuId: number) => {
        const sku = skus.find(s => s.id === skuId);
        return sku ? `${sku.brand} ${sku.model} (${sku.skuCode})` : 'Unknown';
    };

    const diagramData = useMemo<VehicleAxleData>(() => ({
        vehicleId: vehicleData.vehicleId || 'N/A',
        vehicleType: (vehicleData.vehicleType || 'Truck').toUpperCase(),
        axles: axles.map(axle => ({
            axleNumber: axle.number,
            axleType: (axle.liftAxle ? 'LIFT' : axle.position.toUpperCase()) as AxleType,
            tiresPerSide: axle.tireConfig === 'Single' ? 1 : 2
        }))
    }), [vehicleData, axles]);

    return (
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

            {/* Vehicle Summary */}
            <Card className="p-6 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 font-black uppercase tracking-tight text-sm">Vehicle Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle ID</p>
                        <p className="font-bold text-gray-800">{vehicleData.vehicleId}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Type</p>
                        <p className="font-bold text-gray-800">{vehicleData.vehicleType}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Make/Model</p>
                        <p className="font-bold text-gray-800">{vehicleData.make} {vehicleData.model}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <Badge variant="outline" className="font-bold uppercase text-[9px] bg-gray-50">{vehicleData.status}</Badge>
                    </div>
                </div>
            </Card>

            {/* Tolerances Summary */}
            <Card className="p-6 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 font-black uppercase tracking-tight text-sm">Asset & Axle Tolerances</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Asset Tolerance Basis: {vehicleData.toleranceBasis}</span>
                        <span className="font-black text-teal-700 text-sm">{vehicleData.assetTolerance}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {axles.map(axle => (
                            <div key={axle.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Axle {axle.number} ({axle.position})</span>
                                <span className="font-bold text-gray-800 text-xs">{axle.tolerance}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Visual Axle Diagram (Integrated) */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">Axle Configuration Preview</h3>
                    <Badge variant="outline" className="text-[9px] bg-teal-50 text-teal-700 border-none font-black uppercase tracking-tighter">Live</Badge>
                </div>
                <VehicleAxleDiagram
                    data={diagramData}
                    className="!bg-gray-50/50 !shadow-none !border-gray-200 !rounded-2xl"
                />
            </div>

            {/* Axles & Positions Summary */}
            <Card className="p-6 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Axles & Positions with SKU Rules</h3>
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
                                                    {pos.skuRules.map((rule, idx) => (
                                                        <React.Fragment key={rule.id}>
                                                            {idx > 0 && <span className="text-xs text-gray-400 mr-1">OR</span>}
                                                            <Badge variant="outline" className="mr-1">
                                                                {rule.type === 'specific'
                                                                    ? getSKUName(rule.skuId!)
                                                                    : rule.type === 'category'
                                                                        ? `Category: ${rule.category}`
                                                                        : `Commodity: ${rule.commodityCode}`
                                                                }
                                                            </Badge>
                                                        </React.Fragment>
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

            {/* Activation Warning */}
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
                        <p className="text-xs mt-2 font-medium">
                            Once activated, configuration becomes immutable and is used by tire issue, inventory validation, rotations, and inspections.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

