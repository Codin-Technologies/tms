'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/components/HeaderContext';
import {
    Search,
    Filter,
    ClipboardCheck,
    Truck,
    Calendar,
    MapPin,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock vehicle data (reused from previous attempt for consistency)
const mockVehicles = [
    {
        id: 'FL-7823',
        fleetNumber: 'FL-7823',
        registrationNumber: 'ABC-123',
        vehicleType: 'Truck',
        make: 'Freightliner',
        model: 'Cascadia',
        year: '2011',
        location: 'Atlanta',
        status: 'Active',
        lastInspection: '2025-12-28',
        nextInspectionDue: '2026-01-04',
        odometer: '125000',
    },
    {
        id: 'FL-7824',
        fleetNumber: 'FL-7824',
        registrationNumber: 'DEF-456',
        vehicleType: 'Truck',
        make: 'Kenworth',
        model: 'T680',
        year: '2019',
        location: 'Dallas',
        status: 'Active',
        lastInspection: '2025-12-30',
        nextInspectionDue: '2026-01-06',
        odometer: '98500',
    },
    {
        id: 'FL-7825',
        fleetNumber: 'FL-7825',
        registrationNumber: 'GHI-789',
        vehicleType: 'Truck',
        make: 'Peterbilt',
        model: '579',
        year: '2020',
        location: 'Houston',
        status: 'Active',
        lastInspection: '2025-12-25',
        nextInspectionDue: '2026-01-01',
        odometer: '87200',
    },
    {
        id: 'FL-7826',
        fleetNumber: 'FL-7826',
        registrationNumber: 'JKL-012',
        vehicleType: 'Trailer',
        make: 'Great Dane',
        model: 'Everest',
        year: '2018',
        location: 'Atlanta',
        status: 'Active',
        lastInspection: '2025-12-27',
        nextInspectionDue: '2026-01-03',
        odometer: '65000',
    },
    {
        id: 'FL-7827',
        fleetNumber: 'FL-7827',
        registrationNumber: 'MNO-345',
        vehicleType: 'Bus',
        make: 'Prevost',
        model: 'H3-45',
        year: '2021',
        location: 'Dallas',
        status: 'Active',
        lastInspection: '2025-12-29',
        nextInspectionDue: '2026-01-05',
        odometer: '42000',
    },
];

export default function NewInspectionPage() {
    const router = useRouter();
    const { setHeader } = useHeader();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('All');

    React.useEffect(() => {
        setHeader({
            title: 'New Inspection',
            subtitle: 'Select a vehicle to start inspection',
        });
        return () => setHeader({});
    }, [setHeader]);

    // Filter vehicles
    const filteredVehicles = mockVehicles.filter(vehicle => {
        const matchesSearch =
            vehicle.fleetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'All' || vehicle.vehicleType === filterType;

        return matchesSearch && matchesType;
    });

    const handleStartInspection = (vehicleId: string) => {
        // Navigate to the inspection form we created earlier
        // Note: The path is plural 'inspections' based on previous creation
        router.push(`/inspection/vehicle/${vehicleId}/inspection`);
    };

    // Calculate inspection status
    const getInspectionStatus = (nextDue: string) => {
        const dueDate = new Date(nextDue);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue < 0) {
            return { label: 'Overdue', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle };
        } else if (daysUntilDue <= 3) {
            return { label: 'Due Soon', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock };
        } else {
            return { label: 'Up to Date', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 };
        }
    };

    const vehicleTypeOptions = ['All', 'Truck', 'Trailer', 'Bus'];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => router.push('/inspection')}
                    className="group flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-all w-fit mb-6"
                >
                    <div className="p-1.5 rounded-full group-hover:bg-teal-50 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Back to Inspections</span>
                </button>

                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Select Vehicle</h1>
                            <p className="text-sm text-gray-500">Choose a vehicle to begin the inspection process</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="text-2xl font-bold text-gray-900">{mockVehicles.length}</div>
                            <div className="text-xs text-gray-500 font-medium">Total Vehicles</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {mockVehicles.filter(v => {
                                    const status = getInspectionStatus(v.nextInspectionDue);
                                    return status.label === 'Up to Date';
                                }).length}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Up to Date</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {mockVehicles.filter(v => {
                                    const status = getInspectionStatus(v.nextInspectionDue);
                                    return status.label === 'Due Soon';
                                }).length}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Due Soon</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {mockVehicles.filter(v => {
                                    const status = getInspectionStatus(v.nextInspectionDue);
                                    return status.label === 'Overdue';
                                }).length}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Overdue</div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search by fleet number, registration, make, or model..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="pl-10 pr-4 h-11 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none"
                                >
                                    {vehicleTypeOptions.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle List */}
                <div className="space-y-4">
                    {filteredVehicles.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No vehicles found</p>
                            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        filteredVehicles.map(vehicle => {
                            const inspectionStatus = getInspectionStatus(vehicle.nextInspectionDue);
                            const StatusIcon = inspectionStatus.icon;

                            return (
                                <div
                                    key={vehicle.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => handleStartInspection(vehicle.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6 flex-1">
                                            {/* Vehicle Icon */}
                                            <div className="w-16 h-16 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                                                <Truck className="w-8 h-8" />
                                            </div>

                                            {/* Vehicle Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {vehicle.fleetNumber}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {vehicle.vehicleType}
                                                    </Badge>
                                                    <Badge variant="outline" className={`text-xs ${inspectionStatus.color}`}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {inspectionStatus.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {vehicle.make} {vehicle.model} {vehicle.year} • {vehicle.registrationNumber}
                                                </p>
                                                <div className="flex items-center gap-6 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{vehicle.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Last: {new Date(vehicle.lastInspection).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Next: {new Date(vehicle.nextInspectionDue).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <Button
                                            className="bg-teal-600 hover:bg-teal-700 text-white group-hover:bg-teal-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartInspection(vehicle.id);
                                            }}
                                        >
                                            Start Inspection
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
