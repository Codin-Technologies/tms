'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useHeader } from '@/components/HeaderContext';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Edit,
    MoreHorizontal,
    ChevronDown,
    User,
    Fuel,
    DollarSign,
    Wrench,
    AlertTriangle,
    ClipboardList,
    FileText,
    Shield,
    Bell,
    Calendar,
    Gauge,
    EyeOff,
    UserPlus,
    Activity,
    MapPin,
    Truck,
    Clock,
    CheckCircle2,
    Info,
    History,
    ChevronRight,
    ChevronLeft,
    Settings,
    FileCheck,
    Plus,
    X,
    AlertCircle,
    Package,
    ShieldCheck,
    Circle,
    RefreshCcw,
    ArrowRightLeft,
    ArrowRight,
    RotateCcw,
    ListFilter,
    Save,
    Download,
    TrendingUp,
} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VehicleAxleDiagram, VehicleAxleData } from '@/components/fleet/VehicleAxleDiagram';
import { TireStatus } from '@/components/fleet/TireNode';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dialog } from '@headlessui/react';
import { useSKUsQuery } from '@/app/(pages)/stock/skus/query';
import { AxleType } from '@/components/fleet/AxleRow';
import { Fragment } from 'react';

// ============================================================================
// TYPE DEFINITIONS
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

export interface RotationRule {
    id: string;
    name: string;
    description: string;
    pattern: Record<string, string>; // e.g. "A1-L" -> "A2-R"
    axleCount: number;
}

export interface VehicleConfiguration {
    vehicleId: string;
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

const axleSchema = z.object({
    position: z.enum(['Steer', 'Drive', 'Tag', 'Trailer']),
    tireConfig: z.enum(['Single', 'Dual']),
    liftAxle: z.boolean(),
    tolerance: z.number().min(0, 'Tolerance must be >= 0'),
});

// Validation Schema for Vehicle Details
const vehicleDetailsSchema = z.object({
    fleetNumber: z.string().min(1, 'Vehicle ID is required'),
    registrationNumber: z.string().optional(),
    vehicleType: z.string().min(1, 'Vehicle Type is required'),
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.string().optional(),
    odometer: z.string().min(1, 'Odometer is required'),
    description: z.string().optional(),
});

type VehicleDetailsFormValues = z.infer<typeof vehicleDetailsSchema>;

// Mock vehicle data
const mockVehicleData: Record<string, any> = {
    'FL-7823': {
        id: 'FL-7823',
        fleetNumber: 'FL-7823',
        registrationNumber: 'ABC-123',
        vehicleType: 'Truck',
        name: 'ABC-123',
        description: 'Bobcat - 2011 New Holland L230 - JAF0L2305BM18CMLY',
        make: 'Freightliner',
        model: 'Cascadia',
        year: '2011',
        hours: '80 hr',
        status: 'Draft',
        location: 'Atlanta',
        assignment: 'Unassigned',
        group: 'Atlanta / Georgia',
        operator: 'Unassigned',
        odometer: '80 hr',
        image: '/placeholder-vehicle.jpg',
        axleConfiguration: {
            vehicleId: 'FL-7823',
            vehicleType: 'TRUCK',
            axles: [
                { axleNumber: 1, axleType: 'STEER', tiresPerSide: 1 },
                { axleNumber: 2, axleType: 'DRIVE', tiresPerSide: 2 },
                { axleNumber: 3, axleType: 'DRIVE', tiresPerSide: 2 },
            ]
        },
        tireStatuses: {
            'A1-LEFT1': 'ASSIGNED',
            'A1-RIGHT1': 'ASSIGNED',
            'A2-LEFT1': 'CRITICAL',
            'A2-LEFT2': 'ASSIGNED',
            'A2-RIGHT1': 'ASSIGNED',
            'A2-RIGHT2': 'WARNING',
            'A3-LEFT1': 'ASSIGNED',
            'A3-LEFT2': 'ASSIGNED',
            'A3-RIGHT1': 'ASSIGNED',
            'A3-RIGHT2': 'ASSIGNED',
        }
    },
};

const tabs = [
    { id: 'Overview', label: 'Overview', icon: Info },
    { id: 'Axle & Wheel Configurations', label: 'Axles & Wheels', icon: Activity },
    { id: 'Tire Management', label: 'Tire Management', icon: Truck },
    { id: 'Sensor Data Snapshots', label: 'Sensor Data', icon: Gauge },
    { id: 'Service History', label: 'Service History', icon: History },
    { id: 'Inspection History', label: 'Inspection History', icon: ClipboardList },
    { id: 'Work Orders', label: 'Work Orders', icon: FileText },
];

const addMenuItems = [
    { icon: UserPlus, label: 'Add Vehicle Assignment' },
    { icon: Fuel, label: 'Add Fuel Entry' },
    { icon: DollarSign, label: 'Add Expense Entry' },
    { icon: Wrench, label: 'Add Service Entry' },
    { icon: AlertTriangle, label: 'Add Issue' },
    { icon: ClipboardList, label: 'Add Inspection Submission' },
    { icon: FileText, label: 'Add Work Order' },
    { icon: Shield, label: 'Add Warranty' },
    { icon: Bell, label: 'Add Service Reminder' },
    { icon: Calendar, label: 'Add Vehicle Renewal Reminder' },
    { icon: Gauge, label: 'Add Odometer Entry' },
];



// ============================================================================
// CONFIGURATION COMPONENTS
// ============================================================================

function AxleConfigurationSection({
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
                    <p className="text-sm text-gray-500">Define physical reality of the vehicle (Model)</p>
                </div>
            </div>

            {/* Asset-Level Tolerances */}
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-teal-600" />
                    Asset-Level Tolerances (Exact Match)
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
            </div>

            {/* Axles Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Axles</h3>
                    <Button
                        onClick={() => onShowAddAxle(true)}
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
                            <AxleCard
                                key={axle.id}
                                axle={axle}
                                assetTolerance={vehicleData.assetTolerance || 0}
                                onEdit={() => onSetEditingAxle(axle)}
                                onDelete={() => onDeleteAxle(axle.id)}
                                canEdit={true}
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
        <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
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
        </div>
    );
}

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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
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
                                            id="liftAxle-dialog"
                                            checked={formData.liftAxle}
                                            onChange={(e) => setFormData({ ...formData, liftAxle: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="liftAxle-dialog" className="text-sm text-gray-700">Lift Axle</label>
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

function PositionSKURulesSection({
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
                    <p className="text-sm text-gray-400 mt-1">Configure axles first</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="p-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
                                                                            ? `SKU: ${skus?.find((s: any) => s.id === rule.skuId)?.skuCode || 'N/A'}`
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
                                                        skus={skus || []}
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
                    </div>

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
                    <div className="absolute z-50 top-full right-0 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg space-y-3 min-w-[300px]">
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

export default function VehicleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { setHeader } = useHeader();
    const vehicleId = params.id as string;
    const [activeTab, setActiveTab] = useState('Overview');
    const [isEditing, setIsEditing] = useState(false);

    const initialVehicleData = useMemo(() => mockVehicleData[vehicleId] || {
        id: vehicleId,
        fleetNumber: vehicleId,
        registrationNumber: 'N/A',
        vehicleType: 'N/A',
        name: 'N/A',
        description: 'Vehicle Description',
        make: 'N/A',
        model: 'Unknown Vehicle',
        year: 'N/A',
        hours: 'N/A',
        status: 'Active',
        location: 'Atlanta',
        assignment: 'Unassigned',
        group: 'N/A',
        operator: 'Unassigned',
        odometer: '85 hr',
    }, [vehicleId]);

    // Ensure name defaults to registrationNumber if available
    const processedInitialData = useMemo(() => {
        const raw = mockVehicleData[vehicleId] || initialVehicleData;
        return {
            ...raw,
            name: raw.name === 'N/A' || !raw.name ? (raw.registrationNumber !== 'N/A' ? raw.registrationNumber : raw.id) : raw.name
        };
    }, [vehicleId, initialVehicleData]);

    const [vehicle, setVehicle] = useState(processedInitialData);

    useEffect(() => {
        setVehicle(processedInitialData);
    }, [processedInitialData]);
    const { data: skus } = useSKUsQuery();

    // Configuration State
    const [axles, setAxles] = useState<Axle[]>(() => {
        if (vehicle.axleConfiguration?.axles) {
            return vehicle.axleConfiguration.axles.map((a: any, idx: number) => ({
                id: `axle-${idx}`,
                number: a.axleNumber,
                position: (a.axleType.charAt(0) + a.axleType.slice(1).toLowerCase()) as AxlePosition,
                tireConfig: a.tiresPerSide === 1 ? 'Single' : 'Dual',
                liftAxle: a.axleType === 'LIFT',
                tolerance: 0,
            }));
        }
        return [];
    });

    const [positions, setPositions] = useState<Position[]>([]);
    const [showAddAxle, setShowAddAxle] = useState(false);
    const [editingAxle, setEditingAxle] = useState<Axle | null>(null);

    // Issuing State
    const [isIssuingMode, setIsIssuingMode] = useState(false);
    const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);
    const [pendingIssuance, setPendingIssuance] = useState<Record<string, string>>({}); // positionId -> skuId/serial
    const [pendingDispositions, setPendingDispositions] = useState<Record<string, 'Scrap' | 'Quarantine' | 'Inventory'>>({}); // positionId -> disposition
    const [selectedDiagramPosition, setSelectedDiagramPosition] = useState<string | null>(null);

    // Rotation State
    const [isRotationMode, setIsRotationMode] = useState(false);
    const [selectedSourcePosition, setSelectedSourcePosition] = useState<string | null>(null);
    const [pendingRotations, setPendingRotations] = useState<Record<string, string>>({}); // targetPositionId -> sourcePositionId
    const [activityLogs, setActivityLogs] = useState<any[]>([
        {
            id: 'log-1',
            type: 'rotation',
            sourcePositionId: 'A1-L1',
            targetPositionId: 'A2-L1',
            timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
            performedBy: 'John Doe',
            status: 'Confirmed'
        },
        {
            id: 'log-3',
            type: 'install',
            positionId: 'A1-L1',
            tireName: 'Michelin X Multi',
            sku: 'MICH-XM-11R22.5',
            timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
            performedBy: 'Sarah Tech',
            status: 'Confirmed'
        },
        {
            id: 'log-4',
            type: 'remove',
            positionId: 'A1-L1',
            disposition: 'Scrap',
            reason: 'Sidewall Damage',
            timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
            performedBy: 'Sarah Tech',
            status: 'Confirmed'
        },
        {
            id: 'log-2',
            type: 'rotation',
            sourcePositionId: 'A1-R1',
            targetPositionId: 'A2-R1',
            timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
            performedBy: 'Mike Smith',
            status: 'Confirmed'
        }
    ]);
    const [rotationRules, setRotationRules] = useState<RotationRule[]>([
        {
            id: 'rule-1',
            name: 'Standard X-Rotation',
            description: 'Cross rotate steer to drive and rear to front.',
            axleCount: 2,
            pattern: {
                'A1-L1': 'A2-R1',
                'A1-R1': 'A2-L1',
                'A2-L1': 'A1-R1',
                'A2-R1': 'A1-L1'
            }
        },
        {
            id: 'rule-2',
            name: 'Front-Back Direct',
            description: 'Direct swap between front and back axles.',
            axleCount: 2,
            pattern: {
                'A1-L1': 'A2-L1',
                'A1-R1': 'A2-R1',
                'A2-L1': 'A1-L1',
                'A2-R1': 'A1-R1'
            }
        }
    ]);
    const [showRuleBuilder, setShowRuleBuilder] = useState(false);

    // Auto-generate positions when axles change
    useEffect(() => {
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
                newPositions.push({ id: `pos-${axle.id}-left-inner`, positionNumber: `A${axle.number}-LI`, axleId: axle.id, axleNumber: axle.number, side: 'Left', position: 'Inner', skuRules: [] });
                newPositions.push({ id: `pos-${axle.id}-left-outer`, positionNumber: `A${axle.number}-LO`, axleId: axle.id, axleNumber: axle.number, side: 'Left', position: 'Outer', skuRules: [] });
                newPositions.push({ id: `pos-${axle.id}-right-inner`, positionNumber: `A${axle.number}-RI`, axleId: axle.id, axleNumber: axle.number, side: 'Right', position: 'Inner', skuRules: [] });
                newPositions.push({ id: `pos-${axle.id}-right-outer`, positionNumber: `A${axle.number}-RO`, axleId: axle.id, axleNumber: axle.number, side: 'Right', position: 'Outer', skuRules: [] });
            }
        });
        setPositions(newPositions);
    }, [axles]);

    const handleAddAxle = (axleData: Omit<Axle, 'id' | 'number'>) => {
        const newAxle: Axle = {
            id: `axle-${Date.now()}`,
            number: axles.length + 1,
            ...axleData,
        };
        setAxles([...axles, newAxle]);
        setShowAddAxle(false);
        setEditingAxle(null);
        toast.success('Axle added successfully');
    };

    const handleUpdateAxle = (id: string, updates: Partial<Axle>) => {
        setAxles(axles.map(axle => axle.id === id ? { ...axle, ...updates } : axle));
        setEditingAxle(null);
        toast.success('Axle updated successfully');
    };

    const handleDeleteAxle = (id: string) => {
        setAxles(axles.filter(axle => axle.id !== id));
        toast.success('Axle removed');
    };

    const handleAddSKURule = (positionId: string, rule: SKURule) => {
        setPositions(positions.map(pos =>
            pos.id === positionId
                ? { ...pos, skuRules: [...pos.skuRules, rule] }
                : pos
        ));
        toast.success('SKU rule added');
    };

    const handleRemoveSKURule = (positionId: string, ruleId: string) => {
        setPositions(positions.map(pos =>
            pos.id === positionId
                ? { ...pos, skuRules: pos.skuRules.filter(r => r.id !== ruleId) }
                : pos
        ));
        toast.success('SKU rule removed');
    };

    const handleUpdatePosition = (id: string, updates: Partial<Position>) => {
        setPositions(positions.map(pos =>
            pos.id === id ? { ...pos, ...updates } : pos
        ));
    };

    const handleIssueTire = () => {
        setIsIssuingMode(true);
        setSelectedInventoryItemId(null);
        setPendingIssuance({});
        setSelectedDiagramPosition(null);
    };

    const handleCancelIssuing = () => {
        setIsIssuingMode(false);
        setSelectedInventoryItemId(null);
        setPendingIssuance({});
        setSelectedDiagramPosition(null);
        toast.info('Tire issuing cancelled');
    };

    const handleConfirmIssuance = () => {
        const newStatuses = { ...vehicle.tireStatuses };
        const newLogs: any[] = [];

        Object.entries(pendingIssuance).forEach(([posId, skuId]) => {
            // Check if there was a removal
            if (vehicle.tireStatuses?.[posId] && vehicle.tireStatuses[posId] !== 'EMPTY') {
                const disposition = pendingDispositions[posId];
                if (!disposition) {
                    toast.error(`Missing disposition for tire at ${posId}`);
                    return; // Should be blocked by UI, but safe guard
                }
                newLogs.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'remove',
                    positionId: posId,
                    disposition: disposition,
                    reason: 'Replacement',
                    timestamp: new Date().toISOString(),
                    performedBy: 'Current User',
                    status: 'Confirmed'
                });
            }

            // Install Log
            newLogs.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'install',
                positionId: posId,
                sku: skus?.find((s: any) => s.id.toString() === skuId)?.skuCode || 'Unknown SKU',
                tireName: skus?.find((s: any) => s.id.toString() === skuId)?.brand || 'New Tire',
                timestamp: new Date().toISOString(),
                performedBy: 'Current User',
                status: 'Confirmed'
            });

            newStatuses[posId] = 'ASSIGNED';
        });

        setVehicle((prev: any) => ({ ...prev, tireStatuses: newStatuses }));
        setActivityLogs(prev => [...newLogs, ...prev]);
        setIsIssuingMode(false);
        setPendingIssuance({});
        setPendingDispositions({});
        setSelectedInventoryItemId(null);
        setSelectedDiagramPosition(null);
        toast.success(`Processed ${Object.keys(pendingIssuance).length} tire updates`);
    };

    const handleRotateTires = () => {
        setIsRotationMode(true);
        setIsIssuingMode(false);
        setSelectedSourcePosition(null);
        setPendingRotations({});
    };

    const handleCancelRotation = () => {
        setIsRotationMode(false);
        setSelectedSourcePosition(null);
        setPendingRotations({});
        toast.info('Tire rotation cancelled');
    };

    const handleConfirmRotation = () => {
        const newStatuses = { ...vehicle.tireStatuses };
        const newLogs: any[] = [];

        // Apply rotations: target position gets the status of the source position
        Object.entries(pendingRotations).forEach(([target, source]) => {
            const sourceStatus = vehicle.tireStatuses?.[source] || 'EMPTY';
            const targetStatus = vehicle.tireStatuses?.[target] || 'EMPTY';

            newLogs.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'rotation',
                sourcePositionId: source,
                targetPositionId: target,
                performedBy: "Current User",
                timestamp: new Date().toISOString(),
                status: 'Confirmed'
            });

            newStatuses[target] = sourceStatus;
            if (!pendingRotations[source]) {
                newStatuses[source] = 'EMPTY';
            }
        });

        setVehicle((prev: any) => ({ ...prev, tireStatuses: newStatuses }));
        setActivityLogs(prev => [...newLogs, ...prev]);
        setIsRotationMode(false);
        setPendingRotations({});
        setSelectedSourcePosition(null);
        toast.success('Tire rotation confirmed');
    };

    const handleRevertRotation = (logId: string) => {
        const log = activityLogs.find(l => l.id === logId);
        if (!log || log.type !== 'rotation') return;

        setVehicle((prev: any) => {
            const nextStatuses = { ...prev.tireStatuses };
            const currentSource = nextStatuses[log.sourcePositionId];
            const currentTarget = nextStatuses[log.targetPositionId];

            nextStatuses[log.sourcePositionId] = currentTarget;
            nextStatuses[log.targetPositionId] = currentSource;

            return { ...prev, tireStatuses: nextStatuses };
        });

        setActivityLogs(prev => prev.filter(l => l.id !== logId));
        toast.success(`Rotation reverted: ${log.sourcePositionId} ↔ ${log.targetPositionId}`);
    };

    const handleAddRule = (rule: Omit<RotationRule, 'id'>) => {
        const newRule: RotationRule = {
            id: `rule-${Date.now()}`,
            ...rule
        };
        setRotationRules(prev => [...prev, newRule]);
        setShowRuleBuilder(false);
        toast.success(`Rotation rule "${rule.name}" created`);
    };

    const handleApplyRule = (rule: RotationRule) => {
        // Map target relative positions to actual position IDs
        // Pattern: { "A1-L1": "A2-R1" } means the current tire at A1-L1 should move to A2-R1
        const stagedMoves: Record<string, string> = {};

        Object.entries(rule.pattern).forEach(([sourceRel, targetRel]) => {
            // Find actual position ID based on positionNumber (e.g., A1-L1)
            const sourcePos = positions.find(p => p.positionNumber === sourceRel);
            const targetPos = positions.find(p => p.positionNumber === targetRel);

            if (sourcePos && targetPos) {
                stagedMoves[targetPos.id] = sourcePos.id;
            }
        });

        if (Object.keys(stagedMoves).length === 0) {
            toast.error("Could not apply rule: No matching positions found for this vehicle configuration.");
            return;
        }

        setPendingRotations(stagedMoves);
        setIsRotationMode(true);
        setIsIssuingMode(false);
        toast.info(`Applied rule: ${rule.name}. Review moves in the summary.`);
    };

    const { register, handleSubmit, reset, formState: { errors } } = useForm<VehicleDetailsFormValues>({
        resolver: zodResolver(vehicleDetailsSchema),
        defaultValues: {
            fleetNumber: vehicle.fleetNumber,
            registrationNumber: vehicle.registrationNumber,
            vehicleType: vehicle.vehicleType,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            odometer: vehicle.odometer,
            description: vehicle.description,
        }
    });

    const onSave = (data: VehicleDetailsFormValues) => {
        setVehicle((prev: any) => ({ ...prev, ...data }));
        setIsEditing(false);
        toast.success('Vehicle details updated successfully (locally)');
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    useEffect(() => {
        setHeader({
            title: (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-gray-900 tracking-tight">Vehicle #{vehicle.fleetNumber || vehicle.id}</span>
                        <Badge variant="outline" className="text-xs font-bold border-green-200 text-green-700 bg-green-50 uppercase tracking-wider px-2 py-0.5">Active</Badge>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{vehicle.make} {vehicle.model} {vehicle.year} | VIN: {vehicle.registrationNumber || 'N/A'}</span>
                </div>
            ),
            actions: (
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="font-bold shadow-sm h-9 bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button size="sm" className="font-bold shadow-sm h-9 bg-blue-700 hover:bg-blue-800 text-white">
                        <Edit className="w-4 h-4 mr-2" /> Edit Vehicle
                    </Button>
                </div>
            )
        });
        return () => setHeader({});
    }, [setHeader, vehicle]);

    // Metrics Data
    const metrics = [
        {
            label: 'Total Mileage',
            value: `${parseInt(vehicle.odometer || '0').toLocaleString()} mi`,
            trend: '+2,847 mi',
            trendLabel: 'this month',
            trendColor: 'text-green-600',
            icon: Gauge,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
        },
        {
            label: 'Fuel Efficiency',
            value: '6.8 MPG',
            trend: '↑ 0.3 MPG',
            trendLabel: 'vs last month',
            trendColor: 'text-green-600',
            icon: Fuel,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-100',
        },
        {
            label: 'Next Service',
            value: '2,547 mi',
            subLabel: 'Scheduled: Dec 15, 2024',
            icon: Wrench,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-100',
        }
    ];



    return (
        <div className="mx-auto flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Back Navigation */}
            <button
                onClick={() => router.push('/operations')}
                className="group flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-all w-fit"
            >
                <div className="p-1.5 rounded-full group-hover:bg-teal-50 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Back to Vehicles</span>
            </button>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.map((metric) => (
                    <div key={metric.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                        <div>
                            <div className={`w-10 h-10 rounded-lg ${metric.iconBg} flex items-center justify-center mb-4`}>
                                <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
                            </div>
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{metric.label}</h3>
                            <div className="text-2xl font-black text-gray-900 tracking-tight mb-1">{metric.value}</div>
                            {metric.trend && (
                                <p className={`text-xs font-bold ${metric.trendColor}`}>
                                    {metric.trend} <span className="text-gray-400 font-medium ml-1">{metric.trendLabel}</span>
                                </p>
                            )}
                            {metric.subLabel && (
                                <p className="text-xs font-medium text-gray-400">
                                    {metric.subLabel}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs & Content Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                <div className="flex border-b border-gray-100 bg-gray-50/40 p-1 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-6 py-4 text-xs font-bold transition-all rounded-t-2xl m-1 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-teal-600 shadow-sm ring-1 ring-gray-100 -mb-[5px] pb-5'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-teal-500' : 'text-gray-300'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-8 flex-1">
                    {activeTab === 'Overview' && (
                        <div className="flex flex-col gap-6 animate-in slide-in-from-left-2 duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Vehicle Information (2/3 Width) */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Vehicle Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                            {/* General Details */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">General Details</h4>
                                                <div className="grid grid-cols-2 gap-y-4">
                                                    {[
                                                        { label: 'Make', value: vehicle.make },
                                                        { label: 'Model', value: vehicle.model },
                                                        { label: 'Year', value: vehicle.year },
                                                        { label: 'VIN', value: vehicle.registrationNumber || 'N/A' },
                                                        { label: 'License Plate', value: `TRK-${vehicle.fleetNumber}` }, // Mocked based on ID
                                                        { label: 'Color', value: 'White' }, // Mocked
                                                    ].map((item, idx) => (
                                                        <React.Fragment key={idx}>
                                                            <div className="text-xs text-gray-500 font-medium">{item.label}</div>
                                                            <div className="text-xs font-bold text-gray-900 text-right">{item.value}</div>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Technical Specifications */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Technical Specifications</h4>
                                                <div className="grid grid-cols-2 gap-y-4">
                                                    {[
                                                        { label: 'Engine Type', value: 'Detroit DD15' },
                                                        { label: 'Transmission', value: '12-Speed Automated' },
                                                        { label: 'Fuel Type', value: 'Diesel' },
                                                        { label: 'GVWR', value: '80,000 lbs' },
                                                        { label: 'Axle Config', value: '6x4' },
                                                        { label: 'Wheelbase', value: '244 in' },
                                                    ].map((item, idx) => (
                                                        <React.Fragment key={idx}>
                                                            <div className="text-xs text-gray-500 font-medium">{item.label}</div>
                                                            <div className="text-xs font-bold text-gray-900 text-right">{item.value}</div>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Assignment & Location */}
                                            <div className="md:col-span-2 space-y-4 pt-4">
                                                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Assignment & Location</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                                    {[
                                                        { label: 'Driver Assigned', value: 'Michael Roberts', link: true },
                                                        { label: 'Current Location', value: 'Dallas, TX' },
                                                        { label: 'Department', value: 'Long Haul' },
                                                        { label: 'Home Terminal', value: 'Houston, TX' },
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center">
                                                            <div className="text-xs text-gray-500 font-medium">{item.label}</div>
                                                            <div className={`text-xs font-bold ${item.link ? 'text-blue-600 cursor-pointer hover:underline' : 'text-gray-900'}`}>{item.value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Status & Quick Actions (1/3 Width) */}
                                <div className="space-y-6">
                                    {/* Current Status Card */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">Current Status</h3>
                                        <div className="space-y-6">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Operational</p>
                                                    <p className="text-xs text-gray-500">All systems normal</p>
                                                </div>
                                            </div>
                                            <div className="w-full h-px bg-gray-100"></div>
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">In Transit</p>
                                                    <p className="text-xs text-gray-500">Route: HOU → DAL</p>
                                                </div>
                                            </div>
                                            <div className="w-full h-px bg-gray-100"></div>
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">1 Alert</p>
                                                    <p className="text-xs text-gray-500">Tire pressure low</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions Card */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">Quick Actions</h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Schedule Inspection', icon: Calendar },
                                                { label: 'Request Service', icon: Wrench },
                                                { label: 'View Reports', icon: FileText },
                                                { label: 'Track Location', icon: MapPin },
                                            ].map((action) => (
                                                <button key={action.label} className="w-full flex items-center gap-3 p-3 text-left rounded-lg bg-gray-50 hover:bg-teal-50 hover:text-teal-700 transition-colors group">
                                                    <action.icon className="w-4 h-4 text-blue-600 group-hover:text-teal-600" />
                                                    <span className="text-sm font-bold text-gray-700 group-hover:text-teal-700">{action.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Section: Recent Maintenance & Active Alerts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Maintenance</h3>
                                        <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <div className="w-5 h-5 text-blue-600">🛢️</div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Oil Change</p>
                                                    <p className="text-xs text-gray-500">Completed on Dec 1, 2024</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600">$247</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Active Alerts</h3>
                                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">1 Critical</Badge>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Low Tire Pressure</p>
                                                    <p className="text-xs text-gray-500">Reported today at 09:30 AM</p>
                                                </div>
                                            </div>
                                            <button className="text-xs font-bold text-blue-600 hover:text-blue-800">Resolve</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Axle & Wheel Configurations' && (
                        <div className="space-y-8 animate-in slide-in-from-right-2 duration-300">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-1 shadow-sm">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-[9px]">Total Axles</span>
                                    <span className="text-xl font-black text-gray-900">{axles.length}</span>
                                </div>
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-1 shadow-sm">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-[9px]">Total Positions</span>
                                    <span className="text-xl font-black text-gray-900">{positions.length}</span>
                                </div>
                                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 flex flex-col gap-1 shadow-sm">
                                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest text-[9px]">Status</span>
                                    <span className="text-xl font-black text-teal-700 uppercase tracking-tight">Interactive Mode</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <AxleConfigurationSection
                                        vehicleData={{
                                            ...vehicle,
                                            toleranceBasis: (vehicle as any).toleranceBasis || 'None',
                                            assetTolerance: (vehicle as any).assetTolerance || 0,
                                        }}
                                        axles={axles}
                                        onUpdateVehicleData={(updates) => setVehicle((prev: any) => ({ ...prev, ...updates }))}
                                        onAddAxle={handleAddAxle}
                                        onUpdateAxle={handleUpdateAxle}
                                        onDeleteAxle={handleDeleteAxle}
                                        showAddAxle={showAddAxle}
                                        editingAxle={editingAxle}
                                        onShowAddAxle={setShowAddAxle}
                                        onSetEditingAxle={setEditingAxle}
                                    />

                                    <div className="pt-8 border-t border-gray-100">
                                        <PositionSKURulesSection
                                            axles={axles}
                                            positions={positions}
                                            skus={skus || []}
                                            onAddRule={handleAddSKURule}
                                            onRemoveRule={handleRemoveSKURule}
                                            onUpdatePosition={handleUpdatePosition}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="sticky top-6">
                                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col items-center">
                                            <div className="w-full flex items-center justify-between mb-8">
                                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                                    <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div>
                                                    Configuration Preview
                                                </h3>
                                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-teal-50 border-teal-200 text-teal-700">Live Preview</Badge>
                                            </div>

                                            <div className="w-full bg-gray-50/50 rounded-2xl border border-gray-100 p-8 flex justify-center shadow-inner">
                                                <VehicleAxleDiagram
                                                    data={{
                                                        vehicleId: vehicle.id,
                                                        vehicleType: (vehicle.vehicleType || 'TRUCK').toUpperCase() as any,
                                                        axles: axles.map(a => ({
                                                            axleNumber: a.number,
                                                            axleType: (a.liftAxle ? 'LIFT' : a.position.toUpperCase()) as any,
                                                            tiresPerSide: a.tireConfig === 'Single' ? 1 : 2
                                                        }))
                                                    }}
                                                    className="!bg-transparent !shadow-none !border-none scale-110 origin-center"
                                                />
                                            </div>

                                            <div className="w-full mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                                    <Info className="w-4 h-4 text-teal-500" />
                                                    Configuration Logic
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                                    This diagram reflects your current modifications in real-time. Changes made here define the physical mounting points and validation rules for tire assignments.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Tire Management' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                            {/* Tire Health Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Installed', count: Object.keys(vehicle.tireStatuses || {}).length, color: 'text-gray-800', bg: 'bg-gray-100' },
                                    { label: 'Healthy', count: Object.values(vehicle.tireStatuses || {}).filter(s => s === 'ASSIGNED').length, color: 'text-green-600', bg: 'bg-green-50' },
                                    { label: 'Warning', count: Object.values(vehicle.tireStatuses || {}).filter(s => s === 'WARNING').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { label: 'Critical', count: Object.values(vehicle.tireStatuses || {}).filter(s => s === 'CRITICAL').length, color: 'text-red-600', bg: 'bg-red-50' },
                                ].map((stat, idx) => (
                                    <div key={idx} className={`p-4 ${stat.bg} rounded-2xl border border-gray-100/50 flex flex-col gap-1`}>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                        <span className={`text-xl font-black ${stat.color}`}>{stat.count}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Interactive Diagram for Tire Selection */}
                            <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm flex flex-col items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                                <div className="w-full flex items-center justify-between mb-8 relative z-10">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div>
                                            {isRotationMode ? 'Interactive Tire Rotation' : (isIssuingMode ? 'Interactive Tire Issuing' : 'Tire Asset Management')}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 ml-3.5">
                                            {isRotationMode ? 'Select source tire then target position' : (isIssuingMode ? 'Select tire then click position' : 'Interactive Position Selection')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isIssuingMode && !isRotationMode ? (
                                            <>
                                                <Button size="sm" className="font-bold bg-teal-600 hover:bg-teal-700 shadow-md" onClick={handleIssueTire}>Issue New Tire</Button>
                                                <Button variant="outline" size="sm" className="font-bold flex gap-1.5" onClick={handleRotateTires}>
                                                    <RefreshCcw className="w-3.5 h-3.5" />
                                                    Rotation Flow
                                                </Button>
                                                <Button variant="ghost" size="sm" className="font-bold text-gray-500 hover:text-teal-600" onClick={() => setShowRuleBuilder(true)}>
                                                    <ListFilter className="w-3.5 h-3.5 mr-1" />
                                                    Rotation Rules
                                                </Button>
                                            </>
                                        ) : isIssuingMode ? (
                                            <>
                                                <Button size="sm" variant="outline" className="font-bold text-red-600 border-red-200 hover:bg-red-50" onClick={handleCancelIssuing}>Cancel Issuing</Button>
                                                <Button size="sm" className="font-bold bg-teal-600 hover:bg-teal-700 shadow-md" onClick={handleConfirmIssuance} disabled={Object.keys(pendingIssuance).length === 0}>Confirm Issue ({Object.keys(pendingIssuance).length})</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="sm" variant="outline" className="font-bold text-red-600 border-red-200 hover:bg-red-50" onClick={handleCancelRotation}>Cancel Rotation</Button>
                                                <Button size="sm" className="font-bold bg-teal-600 hover:bg-teal-700 shadow-md" onClick={handleConfirmRotation} disabled={Object.keys(pendingRotations).length === 0}>Confirm Rotation ({Object.keys(pendingRotations).length})</Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 transition-all duration-500">
                                    {/* Column 1: Axle Diagram (Span 5 in default, 8 in active) */}
                                    <div className={`lg:col-span-${(isIssuingMode || isRotationMode) ? '8' : '5'} bg-white rounded-2xl border border-gray-100 p-4 flex flex-col relative shadow-sm h-[600px]`}>
                                        <div className="w-full flex items-center justify-between mb-4">
                                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-4 bg-teal-500 rounded-full"></div>
                                                Axle Configuration
                                            </h4>
                                            <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5">Live View</Badge>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                                            {axles.length > 0 ? (
                                                <VehicleAxleDiagram
                                                    data={{
                                                        vehicleId: vehicle.id,
                                                        vehicleType: (vehicle.vehicleType || 'TRUCK').toUpperCase() as any,
                                                        axles: axles.map(a => ({
                                                            axleNumber: a.number,
                                                            axleType: (a.liftAxle ? 'LIFT' : a.position.toUpperCase()) as any,
                                                            tiresPerSide: a.tireConfig === 'Single' ? 1 : 2
                                                        }))
                                                    }}
                                                    tireStatuses={vehicle.tireStatuses}
                                                    pendingAssignments={isIssuingMode ? pendingIssuance : pendingRotations}
                                                    selectedPositionId={isRotationMode ? selectedSourcePosition : selectedDiagramPosition}
                                                    onTireClick={(tire) => {
                                                        if (isIssuingMode) {
                                                            if (selectedInventoryItemId) {
                                                                const selectedSku = skus?.find((s: any) => s.id.toString() === selectedInventoryItemId);
                                                                const axleNumber = parseInt(tire.positionId.split('-')[0].substring(1));
                                                                const axle = axles.find(a => a.number === axleNumber);

                                                                const isCompatible =
                                                                    (axle?.position === 'Steer' && selectedSku?.category === 'Steer') ||
                                                                    (axle?.position === 'Drive' && selectedSku?.category === 'Drive') ||
                                                                    (axle?.position === 'Trailer' && selectedSku?.category === 'Trailer') ||
                                                                    (axle?.position === 'Tag' && (selectedSku?.category === 'Steer' || selectedSku?.category === 'Drive')) ||
                                                                    (!axle);

                                                                if (!isCompatible) {
                                                                    toast.error(`Incompatible Tire Category`, {
                                                                        description: `${selectedSku?.category} SKU cannot be mounted on ${axle?.position} Axle.`
                                                                    });
                                                                    return;
                                                                }

                                                                setPendingIssuance(prev => ({
                                                                    ...prev,
                                                                    [tire.positionId]: selectedInventoryItemId!
                                                                }));
                                                                toast.success(`Tire ${selectedSku?.skuCode} staged for ${tire.positionId}`);
                                                            } else {
                                                                setSelectedDiagramPosition(prev => prev === tire.positionId ? null : tire.positionId);
                                                            }
                                                        } else if (isRotationMode) {
                                                            if (!selectedSourcePosition) {
                                                                if (vehicle.tireStatuses?.[tire.positionId] === 'EMPTY') {
                                                                    toast.info('Cannot rotate an empty position. Select a mounted tire.');
                                                                    return;
                                                                }
                                                                setSelectedSourcePosition(tire.positionId);
                                                                toast.info(`Selected ${tire.positionId} as source. Now click target position.`);
                                                            } else {
                                                                const sourcePos = selectedSourcePosition;
                                                                if (sourcePos === tire.positionId) {
                                                                    setSelectedSourcePosition(null);
                                                                    return;
                                                                }
                                                                const isTargetBodyOccupied = vehicle.tireStatuses?.[tire.positionId] !== 'EMPTY';
                                                                if (isTargetBodyOccupied) {
                                                                    toast.success(`Staged swap: ${sourcePos} ↔ ${tire.positionId}`);
                                                                    setPendingRotations(prev => ({
                                                                        ...prev,
                                                                        [tire.positionId]: sourcePos,
                                                                        [sourcePos]: tire.positionId
                                                                    }));
                                                                } else {
                                                                    toast.success(`Staged move: ${sourcePos} → ${tire.positionId}`);
                                                                    setPendingRotations(prev => ({
                                                                        ...prev,
                                                                        [tire.positionId]: sourcePos
                                                                    }));
                                                                }
                                                                setSelectedSourcePosition(null);
                                                            }
                                                        }
                                                    }}
                                                    className={`!shadow-none !border-none !bg-transparent ${(isIssuingMode || isRotationMode) ? 'scale-110' : 'scale-90'}`}
                                                />
                                            ) : (
                                                <div className="text-center py-10 text-gray-400 font-medium text-xs">No axle data.</div>
                                            )}
                                            {isIssuingMode && selectedInventoryItemId && (
                                                <div className="mt-4 w-full p-2 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 px-1.5 bg-teal-600 rounded text-white text-[9px] font-black uppercase">
                                                            {skus?.find((s: any) => s.id.toString() === selectedInventoryItemId)?.skuCode}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-teal-600 uppercase">Ready to mount</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Column 2: Latest Activity (Span 3) - Only visible in default view */}
                                    {(!isIssuingMode && !isRotationMode) && (
                                        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-[600px] flex flex-col">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                                    <History className="w-3.5 h-3.5 text-teal-500" />
                                                    Latest Actions
                                                </h4>
                                                <Badge variant="outline" className="text-[8px] font-black uppercase bg-gray-50">Audit</Badge>
                                            </div>
                                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                                {activityLogs.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                                                        <Clock className="w-8 h-8 text-gray-200 mb-2" />
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">No history recorded for this asset</p>
                                                    </div>
                                                ) : (
                                                    activityLogs.map((log) => (
                                                        <div key={log.id} className={`p-3 rounded-xl border transition-all group ${log.type === 'remove' ? 'border-red-100 bg-red-50/20' :
                                                            log.type === 'install' ? 'border-green-100 bg-green-50/20' :
                                                                'border-gray-100 bg-gray-50/30'
                                                            }`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex flex-col">
                                                                    <span className={`text-[9px] font-black uppercase ${log.type === 'remove' ? 'text-red-600' :
                                                                        log.type === 'install' ? 'text-green-600' :
                                                                            'text-teal-600'
                                                                        }`}>
                                                                        {log.type === 'rotation' ? 'Rotation' : log.type === 'install' ? 'New Install' : 'Removal'}
                                                                    </span>
                                                                    <span className="text-[8px] font-bold text-gray-400 uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                                {log.type === 'rotation' && (
                                                                    <button onClick={() => handleRevertRotation(log.id)} className="p-1 text-gray-300 hover:text-teal-600">
                                                                        <RotateCcw className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {log.type === 'rotation' ? (
                                                                <div className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-gray-100/50">
                                                                    <span className="text-[9px] font-black text-gray-600">{log.sourcePositionId}</span>
                                                                    <ArrowRight className="w-2.5 h-2.5 text-teal-400" />
                                                                    <span className="text-[9px] font-black text-teal-700">{log.targetPositionId}</span>
                                                                </div>
                                                            ) : log.type === 'install' ? (
                                                                <div className="flex flex-col gap-1 bg-white px-2 py-1.5 rounded-lg border border-green-100/50">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-[9px] font-black text-gray-600">{log.positionId}</span>
                                                                        <span className="text-[9px] font-bold text-green-600">{log.sku}</span>
                                                                    </div>
                                                                    <span className="text-[8px] text-gray-400 font-medium truncate">{log.tireName}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col gap-1 bg-white px-2 py-1.5 rounded-lg border border-red-100/50">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-[9px] font-black text-gray-600">{log.positionId}</span>
                                                                        <Badge variant="outline" className="text-[7px] font-black h-3.5 px-1 border-red-100 text-red-600 uppercase bg-red-50">{log.disposition}</Badge>
                                                                    </div>
                                                                    <span className="text-[8px] text-gray-400 font-medium">{log.reason}</span>
                                                                </div>
                                                            )}

                                                            <div className="mt-2 flex items-center justify-between">
                                                                <div className="flex items-center gap-1">
                                                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${log.type === 'remove' ? 'bg-red-100' :
                                                                        log.type === 'install' ? 'bg-green-100' :
                                                                            'bg-teal-100'
                                                                        }`}>
                                                                        <User className={`w-2 h-2 ${log.type === 'remove' ? 'text-red-600' :
                                                                            log.type === 'install' ? 'text-green-600' :
                                                                                'text-teal-600'
                                                                            }`} />
                                                                    </div>
                                                                    <span className="text-[8px] font-bold text-gray-500">{log.performedBy}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Column 3: Rotation Rules / Staging (Span 4) */}
                                    <div className="lg:col-span-4 flex flex-col gap-4 h-[600px]">
                                        {isIssuingMode ? (
                                            <>
                                                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col overflow-hidden">
                                                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <Package className="w-3.5 h-3.5 text-teal-500" />
                                                        Available Inventory
                                                    </h4>
                                                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                                        {skus?.map((sku: any) => (
                                                            <div
                                                                key={sku.id}
                                                                onClick={() => setSelectedInventoryItemId(sku.id.toString())}
                                                                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${selectedInventoryItemId === sku.id.toString() ? 'border-teal-500 bg-teal-50/50' : 'border-gray-100 hover:border-teal-200'}`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <span className="text-[8px] font-black text-teal-600 bg-teal-50 px-1 rounded uppercase tracking-tighter">{sku.skuCode}</span>
                                                                    <span className="text-[8px] font-bold text-gray-400">Qty: 4</span>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-gray-800 mt-1">{sku.brand} {sku.model}</p>
                                                                <p className="text-[8px] text-gray-400 uppercase tracking-widest">{sku.size} • {sku.category}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>


                                                {/* Removal Disposition Card */}
                                                {isIssuingMode && Object.keys(pendingIssuance).some(pos => vehicle.tireStatuses?.[pos] && vehicle.tireStatuses[pos] !== 'EMPTY') && (
                                                    <div className="h-48 bg-white rounded-2xl border border-red-50 shadow-sm p-4 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
                                                        <h4 className="text-[10px] font-black text-red-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                            Removal Disposition
                                                        </h4>
                                                        <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                                            {Object.keys(pendingIssuance)
                                                                .filter(pos => vehicle.tireStatuses?.[pos] && vehicle.tireStatuses[pos] !== 'EMPTY')
                                                                .map(pos => (
                                                                    <div key={pos} className="p-2 rounded-lg border border-red-100 bg-red-50/20">
                                                                        <div className="flex justify-between items-center mb-2">
                                                                            <span className="text-[9px] font-black text-gray-700">Removing from <span className="text-red-600">{pos}</span></span>
                                                                            {pendingDispositions[pos] ? (
                                                                                <Badge variant="outline" className="text-[7px] font-black h-3.5 px-1 border-red-200 text-red-700 uppercase bg-white">{pendingDispositions[pos]}</Badge>
                                                                            ) : (
                                                                                <span className="text-[7px] font-bold text-red-400 uppercase animate-pulse">Action Required</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="grid grid-cols-3 gap-1">
                                                                            {['Inventory', 'Quarantine', 'Scrap'].map((option) => (
                                                                                <button
                                                                                    key={option}
                                                                                    onClick={() => setPendingDispositions(prev => ({ ...prev, [pos]: option as any }))}
                                                                                    className={`py-1.5 px-1 rounded text-[8px] font-bold uppercase border transition-all ${pendingDispositions[pos] === option
                                                                                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                                                                        : 'bg-white text-gray-500 border-gray-100 hover:border-red-200 hover:text-red-500'
                                                                                        }`}
                                                                                >
                                                                                    {option}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : isRotationMode ? (
                                            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col overflow-hidden">
                                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <RefreshCcw className="w-3.5 h-3.5 text-teal-500" />
                                                    Staged Rotation
                                                </h4>
                                                <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                                    {Object.entries(pendingRotations).length === 0 ? (
                                                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                                                            <ArrowRightLeft className="w-6 h-6 text-gray-300 mb-2" />
                                                            <p className="text-[9px] font-black uppercase text-gray-400">Empty Staging</p>
                                                        </div>
                                                    ) : (
                                                        Object.entries(pendingRotations).map(([target, source]) => (
                                                            <div key={target} className="p-2.5 rounded-xl border border-teal-100 bg-teal-50/20 flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black text-gray-500">{source}</span>
                                                                    <ArrowRight className="w-3 h-3 text-teal-400" />
                                                                    <span className="text-[9px] font-black text-teal-700">{target}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => setPendingRotations(prev => {
                                                                        const next = { ...prev };
                                                                        delete next[target];
                                                                        return next;
                                                                    })}
                                                                    className="text-gray-300 hover:text-red-500"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col overflow-hidden">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                                        <ListFilter className="w-3.5 h-3.5 text-teal-500" />
                                                        Engineered Rules
                                                    </h4>
                                                    <button onClick={() => setShowRuleBuilder(true)} className="p-1 text-teal-600 hover:bg-teal-50 rounded">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                                                    {rotationRules.map((rule) => (
                                                        <div key={rule.id} className="p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/10 transition-all flex flex-col gap-2">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{rule.name}</h5>
                                                                    <p className="text-[8px] text-gray-400 mt-0.5 line-clamp-1">{rule.description}</p>
                                                                </div>
                                                                <Badge variant="outline" className="text-[7px] font-black h-4 px-1">{rule.axleCount} Axles</Badge>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="w-full h-8 text-[9px] font-black uppercase tracking-widest"
                                                                onClick={() => handleApplyRule(rule)}
                                                                disabled={rule.axleCount > axles.length}
                                                            >
                                                                Stage Rule
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Old bottom rules section removed (now in Col 3) */}

                                <div className="mt-6 flex gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div> Healthy
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div> Warning
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div> Critical
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-gray-200 rounded-full"></div> Empty
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!['Overview', 'Axle & Wheel Configurations', 'Tire Management'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
                            <div className="p-6 bg-gray-50 rounded-full mb-6">
                                {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Info, { className: "w-16 h-16 text-gray-200" })}
                            </div>
                            <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase">{activeTab}</h4>
                            <p className="text-gray-400 max-w-sm mt-3 text-sm font-medium">Detailed interactive data for "{activeTab}" will populate as telemetry and maintenance logs are recorded.</p>
                            <Button variant="outline" className="mt-8 font-bold border-2 border-teal-100 text-teal-700 hover:bg-teal-50">Initialize Module</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Rotation Rule Builder Modal */}
            <Transition.Root show={showRuleBuilder} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={setShowRuleBuilder}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
                                    <div className="bg-white px-8 pt-8 pb-6">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <Dialog.Title as="h3" className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                                    Rule Engine Builder
                                                </Dialog.Title>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Design a reusable rotation pattern</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="rounded-full bg-gray-50 p-2 text-gray-400 hover:text-gray-500 transition-colors"
                                                onClick={() => setShowRuleBuilder(false)}
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Rule Name</label>
                                                <Input
                                                    placeholder="e.g., Highway Efficiency Pattern"
                                                    className="rounded-xl border-gray-100 font-bold text-sm h-12 focus:ring-teal-500/20 focus:border-teal-500"
                                                    id="rule-name"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Description</label>
                                                <Input
                                                    placeholder="Describe when to use this rule..."
                                                    className="rounded-xl border-gray-100 font-bold text-sm h-12 focus:ring-teal-500/20 focus:border-teal-500"
                                                    id="rule-desc"
                                                />
                                            </div>

                                            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
                                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <ArrowRightLeft className="w-3.5 h-3.5 text-teal-500" />
                                                    Define Movement Patterns
                                                </h4>
                                                <div className="space-y-3">
                                                    {/* Mock pattern builder rows */}
                                                    {[1, 2].map(i => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <select className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[10px] font-black uppercase text-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500">
                                                                <option>Source Position</option>
                                                                <option>A1-L1</option>
                                                                <option>A1-R1</option>
                                                                <option>A2-L1</option>
                                                                <option>A2-R1</option>
                                                            </select>
                                                            <ArrowRight className="w-4 h-4 text-gray-300" />
                                                            <select className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[10px] font-black uppercase text-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500">
                                                                <option>Target Position</option>
                                                                <option>A1-L1</option>
                                                                <option>A1-R1</option>
                                                                <option>A2-L1</option>
                                                                <option>A2-R1</option>
                                                            </select>
                                                        </div>
                                                    ))}
                                                    <button className="w-full py-2 border-2 border-dashed border-gray-100 rounded-xl text-[9px] font-black text-gray-300 hover:text-teal-500 hover:border-teal-100 transition-all uppercase">+ Add Move</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-8 py-6 flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest h-12"
                                            onClick={() => setShowRuleBuilder(false)}
                                        >
                                            Discard
                                        </Button>
                                        <Button
                                            type="button"
                                            className="flex-1 rounded-xl bg-gray-900 hover:bg-teal-600 text-white font-black text-[10px] uppercase tracking-widest h-12 shadow-lg"
                                            onClick={() => {
                                                const name = (document.getElementById('rule-name') as HTMLInputElement).value || 'New Rule';
                                                const desc = (document.getElementById('rule-desc') as HTMLInputElement).value || 'No description';
                                                handleAddRule({
                                                    name,
                                                    description: desc,
                                                    axleCount: 2,
                                                    pattern: { 'A1-L1': 'A2-R1', 'A1-R1': 'A2-L1' }
                                                });
                                            }}
                                        >
                                            Save Rule Pattern
                                        </Button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}
