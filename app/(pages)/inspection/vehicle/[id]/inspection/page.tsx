'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/components/HeaderContext';
import { VehicleAxleDiagram } from '@/components/fleet/VehicleAxleDiagram';
import {
    ArrowLeft,
    Save,
    CheckCircle,
    AlertTriangle,
    Flag,
    X,
    ChevronDown,
    ChevronUp,
    Calendar,
    User,
    Gauge,
    Info,
    Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type InspectionStatus = 'not-inspected' | 'pass' | 'attention' | 'critical';
type InspectionType = 'Daily' | 'Weekly' | 'Pre-trip' | 'Post-trip' | 'Workshop';
type WearPattern = 'Normal' | 'Shoulder' | 'Center' | 'Uneven';
type SidewallCondition = 'OK' | 'Cut' | 'Bulge';
type VehicleCheckStatus = 'Pass' | 'Attention' | 'Fail';

interface TireInspectionData {
    position: string;
    // Tread & Wear
    treadDepth: number;
    wearPattern: WearPattern;
    remainingLife: number;
    // Pressure & Condition
    pressure: number;
    sidewallCondition: SidewallCondition;
    visibleDamage: boolean;
    damageNotes?: string;
    // Operational Flags
    underInflated: boolean;
    overInflated: boolean;
    misalignmentSuspected: boolean;
    rotationRecommended: boolean;
    replacementRecommended: boolean;
    // Notes
    inspectorNotes: string;
    // Metadata
    status: InspectionStatus;
    inspectedAt?: Date;
}

interface VehicleCheckItem {
    name: string;
    status: VehicleCheckStatus;
    comment?: string;
}

interface InspectionState {
    vehicleId: string;
    inspectionType: InspectionType;
    odometer: string;
    inspectionDate: Date;
    inspector: string;
    tireInspections: Record<string, TireInspectionData>;
    vehicleChecks: VehicleCheckItem[];
    isDraft: boolean;
    completedAt?: Date;
}

// Mock vehicle data
const mockVehicleData = {
    id: 'FL-7823',
    fleetNumber: 'FL-7823',
    registrationNumber: 'ABC-123',
    vehicleType: 'Truck',
    make: 'Freightliner',
    model: 'Cascadia',
    year: '2011',
    axleConfiguration: {
        vehicleId: 'FL-7823',
        vehicleType: 'TRUCK',
        axles: [
            { axleNumber: 1, axleType: 'STEER' as const, tiresPerSide: 1 },
            { axleNumber: 2, axleType: 'DRIVE' as const, tiresPerSide: 2 },
            { axleNumber: 3, axleType: 'DRIVE' as const, tiresPerSide: 2 },
        ]
    }
};

// Mock tire data
const mockTireData: Record<string, any> = {
    'A1-LEFT1': { sku: 'MICH-XZE-11R22.5', brand: 'Michelin', model: 'XZE', size: '11R22.5', mileage: 45000 },
    'A1-RIGHT1': { sku: 'MICH-XZE-11R22.5', brand: 'Michelin', model: 'XZE', size: '11R22.5', mileage: 45000 },
    'A2-LEFT1': { sku: 'GOOD-G159-11R22.5', brand: 'Goodyear', model: 'G159', size: '11R22.5', mileage: 52000 },
    'A2-LEFT2': { sku: 'GOOD-G159-11R22.5', brand: 'Goodyear', model: 'G159', size: '11R22.5', mileage: 52000 },
    'A2-RIGHT1': { sku: 'GOOD-G159-11R22.5', brand: 'Goodyear', model: 'G159', size: '11R22.5', mileage: 52000 },
    'A2-RIGHT2': { sku: 'GOOD-G159-11R22.5', brand: 'Goodyear', model: 'G159', size: '11R22.5', mileage: 52000 },
    'A3-LEFT1': { sku: 'GOOD-G159-11R22.5', brand: 'Goodyear', model: 'G159', size: '11R22.5', mileage: 48000 },
    'A3-LEFT2': { sku: 'GOOD-G159-11R22.5', brand: 'Goodyear', model: 'G159', size: '11R22.5', mileage: 48000 },
    'A3-RIGHT1': { sku: 'GOOD-G159-11R22.5', brand: 'Goodyear', model: 'G159', size: '11R22.5', mileage: 48000 },
    'A3-RIGHT2': { sku: 'GOOD-G159-11R22.5', brand: 'Goodyear', model: 'G159', size: '11R22.5', mileage: 48000 },
};

const initialVehicleChecks: VehicleCheckItem[] = [
    { name: 'Brakes', status: 'Pass' },
    { name: 'Suspension', status: 'Pass' },
    { name: 'Lights', status: 'Pass' },
    { name: 'Body', status: 'Pass' },
    { name: 'Fluids', status: 'Pass' },
    { name: 'General Safety', status: 'Pass' },
];

// Helper function to map inspection status to TireStatus for diagram
const mapInspectionStatusToTireStatus = (status: InspectionStatus): 'EMPTY' | 'ASSIGNED' | 'WARNING' | 'CRITICAL' => {
    switch (status) {
        case 'not-inspected':
            return 'EMPTY';
        case 'pass':
            return 'ASSIGNED';
        case 'attention':
            return 'WARNING';
        case 'critical':
            return 'CRITICAL';
        default:
            return 'EMPTY';
    }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VehicleInspectionPage() {
    const params = useParams();
    const router = useRouter();
    const { setHeader } = useHeader();
    const vehicleId = params.id as string;

    // State
    const [selectedTirePosition, setSelectedTirePosition] = useState<string | null>(null);
    const [inspectionState, setInspectionState] = useState<InspectionState>({
        vehicleId,
        inspectionType: 'Daily',
        odometer: '125000',
        inspectionDate: new Date(),
        inspector: 'John Smith',
        tireInspections: {},
        vehicleChecks: initialVehicleChecks,
        isDraft: true,
    });
    const [showVehicleChecks, setShowVehicleChecks] = useState(false);

    // Derived state - Map inspection statuses to TireStatus for diagram
    const inspectionStatusByPosition: Record<string, 'EMPTY' | 'ASSIGNED' | 'WARNING' | 'CRITICAL'> = {};
    Object.keys(inspectionState.tireInspections).forEach(pos => {
        inspectionStatusByPosition[pos] = mapInspectionStatusToTireStatus(inspectionState.tireInspections[pos].status);
    });

    const totalTires = Object.keys(mockTireData).length;
    const inspectedCount = Object.keys(inspectionState.tireInspections).length;
    const passCount = Object.values(inspectionState.tireInspections).filter(t => t.status === 'pass').length;
    const attentionCount = Object.values(inspectionState.tireInspections).filter(t => t.status === 'attention').length;
    const criticalCount = Object.values(inspectionState.tireInspections).filter(t => t.status === 'critical').length;

    useEffect(() => {
        setHeader({
            title: `Vehicle Inspection - ${mockVehicleData.fleetNumber}`,
            subtitle: `${mockVehicleData.make} ${mockVehicleData.model} ${mockVehicleData.year}`,
        });
        return () => setHeader({});
    }, [setHeader]);

    // Auto-save draft to localStorage
    useEffect(() => {
        if (inspectionState.isDraft) {
            localStorage.setItem(`inspection-draft-${vehicleId}`, JSON.stringify(inspectionState));
        }
    }, [inspectionState, vehicleId]);

    // Load draft on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem(`inspection-draft-${vehicleId}`);
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setInspectionState({ ...parsed, inspectionDate: new Date(parsed.inspectionDate) });
                toast.info('Loaded saved draft');
            } catch (e) {
                console.error('Failed to load draft', e);
            }
        }
    }, [vehicleId]);

    const handleTireClick = (tire: any) => {
        setSelectedTirePosition(tire.positionId);
    };

    const handleSaveDraft = () => {
        localStorage.setItem(`inspection-draft-${vehicleId}`, JSON.stringify(inspectionState));
        toast.success('Draft saved successfully');
    };

    const handleCompleteInspection = () => {
        // Validation
        if (!inspectionState.odometer) {
            toast.error('Odometer reading is required');
            return;
        }

        if (inspectedCount === 0) {
            toast.error('At least one tire must be inspected');
            return;
        }

        // Check critical tires have notes
        const criticalWithoutNotes = Object.values(inspectionState.tireInspections).filter(
            t => t.status === 'critical' && !t.inspectorNotes
        );
        if (criticalWithoutNotes.length > 0) {
            toast.error('Critical tires must have inspector notes');
            return;
        }

        // Complete inspection
        setInspectionState(prev => ({
            ...prev,
            isDraft: false,
            completedAt: new Date(),
        }));

        localStorage.removeItem(`inspection-draft-${vehicleId}`);
        toast.success('Inspection completed successfully!');

        // TODO: API call to persist inspection
        setTimeout(() => {
            router.push(`/operations/vehicle/${vehicleId}`);
        }, 1500);
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
            localStorage.removeItem(`inspection-draft-${vehicleId}`);
            router.push(`/operations/vehicle/${vehicleId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Back Navigation */}
            <div className="px-8 pt-6">
                <button
                    onClick={() => router.push(`/operations/vehicle/${vehicleId}`)}
                    className="group flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-all w-fit"
                >
                    <div className="p-1.5 rounded-full group-hover:bg-teal-50 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Back to Vehicle</span>
                </button>
            </div>

            {/* Top Context Bar */}
            <TopContextBar
                inspectionState={inspectionState}
                setInspectionState={setInspectionState}
                vehicle={mockVehicleData}
            />

            {/* Main Content */}
            <div className="flex-1 px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1800px] mx-auto">
                    {/* Left Column - Diagram */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">Vehicle Diagram</h3>
                        <div className="flex items-center justify-center min-h-[400px]">
                            <VehicleAxleDiagram
                                axleConfiguration={mockVehicleData.axleConfiguration}
                                tireStatuses={inspectionStatusByPosition}
                                onTireClick={handleTireClick}
                                selectedPosition={selectedTirePosition}
                            />
                        </div>
                        <div className="mt-6 flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                <span className="text-gray-600">Not Inspected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <span className="text-gray-600">Pass</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                <span className="text-gray-600">Attention</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded"></div>
                                <span className="text-gray-600">Critical</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Inspection Panels */}
                    <div className="space-y-6">
                        {selectedTirePosition ? (
                            <TireInspectionPanel
                                position={selectedTirePosition}
                                tireData={mockTireData[selectedTirePosition]}
                                inspectionData={inspectionState.tireInspections[selectedTirePosition]}
                                onUpdate={(data) => {
                                    setInspectionState(prev => ({
                                        ...prev,
                                        tireInspections: {
                                            ...prev.tireInspections,
                                            [selectedTirePosition]: data,
                                        }
                                    }));
                                }}
                            />
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Select a tire from the diagram to begin inspection</p>
                                <p className="text-sm text-gray-400 mt-2">Click on any tire position to inspect</p>
                            </div>
                        )}

                        <VehicleLevelInspectionPanel
                            isOpen={showVehicleChecks}
                            onToggle={() => setShowVehicleChecks(!showVehicleChecks)}
                            checks={inspectionState.vehicleChecks}
                            onUpdate={(checks) => setInspectionState(prev => ({ ...prev, vehicleChecks: checks }))}
                        />

                        <InspectionSummaryCard
                            totalTires={totalTires}
                            inspectedCount={inspectedCount}
                            passCount={passCount}
                            attentionCount={attentionCount}
                            criticalCount={criticalCount}
                        />
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-8 py-4 shadow-lg z-20">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">{inspectedCount}</span> of <span className="font-medium">{totalTires}</span> tires inspected
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleCancel}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={handleSaveDraft}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                            <Flag className="w-4 h-4 mr-2" />
                            Flag for Maintenance
                        </Button>
                        <Button
                            onClick={handleCompleteInspection}
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            disabled={inspectedCount === 0}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete Inspection
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TopContextBar({
    inspectionState,
    setInspectionState,
    vehicle,
}: {
    inspectionState: InspectionState;
    setInspectionState: React.Dispatch<React.SetStateAction<InspectionState>>;
    vehicle: any;
}) {
    return (
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
            <div className="max-w-[1800px] mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-black text-gray-900">
                            Vehicle {vehicle.fleetNumber}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {vehicle.make} {vehicle.model} {vehicle.year} | VIN: {vehicle.registrationNumber}
                        </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                        {inspectionState.isDraft ? 'Draft' : 'Completed'}
                    </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            Odometer *
                        </label>
                        <Input
                            type="text"
                            value={inspectionState.odometer}
                            onChange={(e) => setInspectionState(prev => ({ ...prev, odometer: e.target.value }))}
                            placeholder="Enter odometer"
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Inspection Date
                        </label>
                        <Input
                            type="date"
                            value={inspectionState.inspectionDate.toISOString().split('T')[0]}
                            onChange={(e) => setInspectionState(prev => ({ ...prev, inspectionDate: new Date(e.target.value) }))}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Inspector
                        </label>
                        <Input
                            type="text"
                            value={inspectionState.inspector}
                            onChange={(e) => setInspectionState(prev => ({ ...prev, inspector: e.target.value }))}
                            placeholder="Inspector name"
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Inspection Type</label>
                        <select
                            value={inspectionState.inspectionType}
                            onChange={(e) => setInspectionState(prev => ({ ...prev, inspectionType: e.target.value as InspectionType }))}
                            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Pre-trip">Pre-trip</option>
                            <option value="Post-trip">Post-trip</option>
                            <option value="Workshop">Workshop</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TireInspectionPanel({
    position,
    tireData,
    inspectionData,
    onUpdate,
}: {
    position: string;
    tireData: any;
    inspectionData?: TireInspectionData;
    onUpdate: (data: TireInspectionData) => void;
}) {
    const [formData, setFormData] = useState<TireInspectionData>(
        inspectionData || {
            position,
            treadDepth: 0,
            wearPattern: 'Normal',
            remainingLife: 0,
            pressure: 0,
            sidewallCondition: 'OK',
            visibleDamage: false,
            underInflated: false,
            overInflated: false,
            misalignmentSuspected: false,
            rotationRecommended: false,
            replacementRecommended: false,
            inspectorNotes: '',
            status: 'not-inspected',
        }
    );

    useEffect(() => {
        if (inspectionData) {
            setFormData(inspectionData);
        }
    }, [inspectionData, position]);

    // Auto-calculate remaining life based on tread depth
    useEffect(() => {
        if (formData.treadDepth > 0) {
            const newTireDepth = 16; // mm
            const minDepth = 4; // mm
            const remaining = Math.max(0, Math.min(100, ((formData.treadDepth - minDepth) / (newTireDepth - minDepth)) * 100));
            setFormData(prev => ({ ...prev, remainingLife: Math.round(remaining) }));
        }
    }, [formData.treadDepth]);

    // Auto-determine status
    useEffect(() => {
        let status: InspectionStatus = 'pass';

        if (formData.replacementRecommended || formData.treadDepth < 4 || formData.visibleDamage) {
            status = 'critical';
        } else if (
            formData.underInflated ||
            formData.overInflated ||
            formData.misalignmentSuspected ||
            formData.rotationRecommended ||
            formData.sidewallCondition !== 'OK' ||
            formData.remainingLife < 30
        ) {
            status = 'attention';
        }

        setFormData(prev => ({ ...prev, status }));
    }, [
        formData.treadDepth,
        formData.visibleDamage,
        formData.replacementRecommended,
        formData.underInflated,
        formData.overInflated,
        formData.misalignmentSuspected,
        formData.rotationRecommended,
        formData.sidewallCondition,
        formData.remainingLife,
    ]);

    const handleSave = () => {
        onUpdate({ ...formData, inspectedAt: new Date() });
        toast.success(`Inspection saved for ${position}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-teal-100 text-teal-700 border-teal-200 font-bold">
                            {position}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`${formData.status === 'pass'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : formData.status === 'attention'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : formData.status === 'critical'
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                        >
                            {formData.status === 'not-inspected' ? 'Not Inspected' : formData.status.toUpperCase()}
                        </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                        {tireData.brand} {tireData.model} - {tireData.size}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {tireData.sku} | Mileage: {tireData.mileage.toLocaleString()} mi</p>
                </div>
                <Button size="sm" onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                    <Save className="w-4 h-4 mr-1" />
                    Save
                </Button>
            </div>

            <div className="space-y-6">
                {/* Tread & Wear */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Tread & Wear</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Tread Depth (mm)</label>
                            <Input
                                type="number"
                                value={formData.treadDepth || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, treadDepth: parseFloat(e.target.value) || 0 }))}
                                placeholder="0.0"
                                step="0.1"
                                className="h-9 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Wear Pattern</label>
                            <select
                                value={formData.wearPattern}
                                onChange={(e) => setFormData(prev => ({ ...prev, wearPattern: e.target.value as WearPattern }))}
                                className="w-full h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="Normal">Normal</option>
                                <option value="Shoulder">Shoulder</option>
                                <option value="Center">Center</option>
                                <option value="Uneven">Uneven</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">Remaining Life</span>
                            <span className="text-sm font-bold text-gray-900">{formData.remainingLife}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${formData.remainingLife > 50
                                    ? 'bg-green-500'
                                    : formData.remainingLife > 30
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                style={{ width: `${formData.remainingLife}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Pressure & Condition */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Pressure & Condition</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Pressure (PSI)</label>
                            <Input
                                type="number"
                                value={formData.pressure || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, pressure: parseFloat(e.target.value) || 0 }))}
                                placeholder="0"
                                className="h-9 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Sidewall Condition</label>
                            <select
                                value={formData.sidewallCondition}
                                onChange={(e) => setFormData(prev => ({ ...prev, sidewallCondition: e.target.value as SidewallCondition }))}
                                className="w-full h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="OK">OK</option>
                                <option value="Cut">Cut</option>
                                <option value="Bulge">Bulge</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`damage-${position}`}
                            checked={formData.visibleDamage}
                            onChange={(e) => setFormData(prev => ({ ...prev, visibleDamage: e.target.checked }))}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <label htmlFor={`damage-${position}`} className="text-sm text-gray-700">
                            Visible Damage
                        </label>
                    </div>
                    {formData.visibleDamage && (
                        <textarea
                            value={formData.damageNotes || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, damageNotes: e.target.value }))}
                            placeholder="Describe the damage..."
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 resize-none"
                            rows={2}
                        />
                    )}
                </div>

                {/* Operational Flags */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Operational Flags</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { key: 'underInflated', label: 'Under-inflated' },
                            { key: 'overInflated', label: 'Over-inflated' },
                            { key: 'misalignmentSuspected', label: 'Misalignment Suspected' },
                            { key: 'rotationRecommended', label: 'Rotation Recommended' },
                            { key: 'replacementRecommended', label: 'Replacement Recommended' },
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={`${key}-${position}`}
                                    checked={formData[key as keyof TireInspectionData] as boolean}
                                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
                                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                />
                                <label htmlFor={`${key}-${position}`} className="text-sm text-gray-700">
                                    {label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inspector Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">Inspector Notes</label>
                    <textarea
                        value={formData.inspectorNotes}
                        onChange={(e) => setFormData(prev => ({ ...prev, inspectorNotes: e.target.value }))}
                        placeholder="Add any additional observations or notes..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 resize-none"
                        rows={3}
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formData.inspectorNotes.length} characters</span>
                        <div className="flex items-center gap-1 text-gray-400">
                            <Camera className="w-3 h-3" />
                            <span>Photo upload (coming soon)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VehicleLevelInspectionPanel({
    isOpen,
    onToggle,
    checks,
    onUpdate,
}: {
    isOpen: boolean;
    onToggle: () => void;
    checks: VehicleCheckItem[];
    onUpdate: (checks: VehicleCheckItem[]) => void;
}) {
    const handleStatusChange = (index: number, status: VehicleCheckStatus) => {
        const updated = [...checks];
        updated[index] = { ...updated[index], status };
        onUpdate(updated);
    };

    const handleCommentChange = (index: number, comment: string) => {
        const updated = [...checks];
        updated[index] = { ...updated[index], comment };
        onUpdate(updated);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Vehicle-Level Inspection</h3>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
                    {checks.map((check, index) => (
                        <div key={check.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{check.name}</span>
                                <div className="flex gap-2">
                                    {(['Pass', 'Attention', 'Fail'] as VehicleCheckStatus[]).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(index, status)}
                                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${check.status === status
                                                ? status === 'Pass'
                                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                                    : status === 'Attention'
                                                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                                        : 'bg-red-100 text-red-700 border border-red-300'
                                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {(check.status === 'Attention' || check.status === 'Fail') && (
                                <Input
                                    type="text"
                                    value={check.comment || ''}
                                    onChange={(e) => handleCommentChange(index, e.target.value)}
                                    placeholder="Add comment..."
                                    className="h-8 text-sm"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function InspectionSummaryCard({
    totalTires,
    inspectedCount,
    passCount,
    attentionCount,
    criticalCount,
}: {
    totalTires: number;
    inspectedCount: number;
    passCount: number;
    attentionCount: number;
    criticalCount: number;
}) {
    const progress = (inspectedCount / totalTires) * 100;

    const recommendations = [];
    if (criticalCount > 0) {
        recommendations.push(`Replace ${criticalCount} critical tire${criticalCount > 1 ? 's' : ''}`);
    }
    if (attentionCount > 0) {
        recommendations.push(`Monitor ${attentionCount} tire${attentionCount > 1 ? 's' : ''} requiring attention`);
    }
    if (inspectedCount === totalTires && criticalCount === 0 && attentionCount === 0) {
        recommendations.push('All tires in good condition');
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">Inspection Summary</h3>

            <div className="space-y-4">
                {/* Progress */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-gray-900">{inspectedCount}/{totalTires}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-teal-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-700">{passCount}</div>
                        <div className="text-xs text-green-600 font-medium">Pass</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-700">{attentionCount}</div>
                        <div className="text-xs text-yellow-600 font-medium">Attention</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
                        <div className="text-xs text-red-600 font-medium">Critical</div>
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                            {recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
