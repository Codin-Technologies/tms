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
        name: 'AB103',
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
                    <p className="text-sm text-gray-500">Define physical reality of the vehicle (IBM MFT Model)</p>
                </div>
            </div>

            {/* Asset-Level Tolerances */}
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
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
        name: vehicleId,
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

    const [vehicle, setVehicle] = useState(initialVehicleData);
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
                <div className="flex items-center gap-3">
                    {vehicle.name}
                    <Badge className="bg-green-50 text-green-700 border-green-200 shadow-sm animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {vehicle.status}
                    </Badge>
                </div>
            ),
            subtitle: (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md border text-gray-700 font-bold">ID: {vehicle.id}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">Model: <span className="font-bold text-gray-700">{vehicle.model}</span></span>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize font-bold border-teal-200 text-teal-700 bg-teal-50/30">{vehicle.location}</Badge>
                        <Badge variant="outline" className="font-bold border-blue-200 text-blue-700 bg-blue-50/30">{vehicle.assignment}</Badge>
                    </div>
                </div>
            ),
            actions: (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="font-bold shadow-sm">
                        <EyeOff className="w-3.5 h-3.5 mr-2" /> Unwatch
                    </Button>
                    <Button variant="outline" size="sm" className="font-bold shadow-sm">
                        <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                    </Button>

                    <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="inline-flex justify-center items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-bold text-sm shadow-sm gap-2">
                            Add <ChevronDown className="w-4 h-4" />
                        </Menu.Button>
                        <Transition
                            as={React.Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right bg-white divide-y divide-gray-100 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <div className="px-1 py-1">
                                    {addMenuItems.map((item, index) => (
                                        <Menu.Item key={index}>
                                            {({ active }) => (
                                                <button
                                                    className={`${active ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                                                        } group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors`}
                                                >
                                                    <item.icon className={`mr-3 h-4 w-4 ${active ? 'text-teal-600' : 'text-gray-400'}`} aria-hidden="true" />
                                                    {item.label}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            )
        });
        return () => setHeader({});
    }, [setHeader, vehicle]);

    const kpis = [
        { label: 'Odometer', value: vehicle.odometer, icon: Gauge, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Utilization', value: '85%', icon: Activity, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
        { label: 'Location', value: vehicle.location, icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        { label: 'Open Issues', value: '0', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
        { label: 'Status', value: vehicle.status, icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
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

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className={`bg-white p-5 rounded-2xl shadow-sm border ${kpi.border} hover:shadow-md transition-all duration-300 cursor-pointer group`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-xl ${kpi.bg} group-hover:scale-110 transition-transform`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            </div>
                            <span className="text-2xl font-black text-gray-900 tabular-nums tracking-tighter capitalize">{kpi.value}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</span>
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-left-2 duration-300">
                            {/* Detailed Info Card */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div>
                                            Core Details
                                        </h3>
                                        {!isEditing ? (
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                                            >
                                                Edit Details
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleCancel}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSubmit(onSave)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700"
                                                >
                                                    Save Changes
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                        {[
                                            { id: 'fleetNumber', label: 'Vehicle ID / Fleet Number *', value: vehicle.fleetNumber || vehicle.id, editable: true },
                                            { id: 'registrationNumber', label: 'Registration Number', value: vehicle.registrationNumber, editable: true },
                                            { id: 'vehicleType', label: 'Vehicle Type *', value: vehicle.vehicleType, editable: true },
                                            { id: 'status', label: 'Status', value: vehicle.status, status: true, editable: false },
                                            { id: 'make', label: 'Make *', value: vehicle.make, editable: true },
                                            { id: 'model', label: 'Model *', value: vehicle.model, editable: true },
                                            { id: 'year', label: 'Year', value: vehicle.year, editable: true },
                                            { id: 'odometer', label: 'Odometer *', value: vehicle.odometer, highlight: true, editable: true },
                                            { id: 'description', label: 'Description', value: vehicle.description, full: true, editable: true }
                                        ].map((field: any, idx) => (
                                            <div key={idx} className={`${field.full ? 'col-span-2' : 'col-span-1'} flex flex-col gap-1`}>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{field.label}</span>
                                                {isEditing && field.editable ? (
                                                    <div className="mt-1">
                                                        {field.full ? (
                                                            <textarea
                                                                {...register(field.id as any)}
                                                                className="w-full text-sm font-bold text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[80px]"
                                                            />
                                                        ) : (
                                                            <Input
                                                                {...register(field.id as any)}
                                                                className="h-9 text-sm font-bold text-gray-800 bg-white border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                            />
                                                        )}
                                                        {errors[field.id as keyof VehicleDetailsFormValues] && (
                                                            <span className="text-[9px] text-red-500 font-bold mt-1 uppercase">
                                                                {errors[field.id as keyof VehicleDetailsFormValues]?.message}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className={`text-sm font-bold ${field.highlight ? 'text-blue-600 underline cursor-pointer' : field.link ? 'text-teal-600 underline cursor-pointer' : 'text-gray-800'}`}>
                                                        {field.status && (
                                                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${vehicle.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        )}
                                                        {field.value}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4">Vehicle Description</h3>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            {vehicle.description}. This asset is currently active in the {vehicle.location} hub, maintaining strict operational standards.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar Area */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Open Issues Card */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center justify-between">
                                        Open Issues
                                        <Badge variant="outline" className="text-[10px] font-bold">0 Active</Badge>
                                    </h3>
                                    <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-500">All Systems Operational</p>
                                        <p className="text-[10px] text-gray-400 mt-1">No open issues detected for this asset.</p>
                                    </div>
                                </div>

                                {/* Service Reminders Card */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center justify-between">
                                        Reminders
                                        <Bell className="w-4 h-4 text-teal-500" />
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            <div>
                                                <p className="text-[11px] font-black text-blue-900">Next PM Service</p>
                                                <p className="text-[10px] font-bold text-blue-600">In 20 days or 50 hrs</p>
                                            </div>
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
                                            Tire Asset Management
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 ml-3.5">Interactive Position Selection</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="font-bold bg-teal-600 hover:bg-teal-700 shadow-md">Issue New Tire</Button>
                                        <Button variant="outline" size="sm" className="font-bold">Rotation Flow</Button>
                                    </div>
                                </div>

                                <div className="w-full max-w-4xl bg-white rounded-2xl border border-gray-100 p-10 flex justify-center relative z-10 shadow-inner">
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
                                            onTireClick={(tire) => console.log('Selected Tire:', tire)}
                                            className="!shadow-none !border-none !bg-transparent"
                                        />
                                    ) : (
                                        <div className="text-center py-10 text-gray-400 font-medium">
                                            No axle/tire data available.
                                        </div>
                                    )}
                                </div>

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
        </div>
    );
}
