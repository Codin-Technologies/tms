'use client';

import React, { useEffect, useState } from 'react';
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
    UserPlus
} from 'lucide-react';
import { Menu } from '@headlessui/react';

// Mock vehicle data
const mockVehicleData: Record<string, any> = {
    'FL-7823': {
        id: 'FL-7823',
        name: 'AB103',
        description: 'Bobcat - 2011 New Holland L230 - JAF0L2305BM18CMLY',
        model: 'Freightliner Cascadia',
        hours: '80 hr',
        status: 'Active',
        location: 'Atlanta',
        assignment: 'Unassigned',
        group: 'Atlanta\nGeorgia /',
        operator: 'Unassigned',
        meter: '80 hr',
        image: '/placeholder-vehicle.jpg',
    },
};

const tabs = [
    'Overview',
    'Axle & Wheel Configurations',
    'Tire Management',
    'Sensor Data Snapshots',
    'Service History',
    'Inspection History',
    'Work Orders',
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
    { icon: Gauge, label: 'Add Meter Entry' },
];

export default function VehicleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { setHeader } = useHeader();
    const vehicleId = params.id as string;
    const [activeTab, setActiveTab] = useState('Overview');

    const vehicle = mockVehicleData[vehicleId] || {
        id: vehicleId,
        name: vehicleId,
        description: 'Vehicle Description',
        model: 'Unknown Vehicle',
        hours: 'N/A',
        status: 'Active',
        location: 'N/A',
        assignment: 'Unassigned',
        group: 'N/A',
        operator: 'Unassigned',
        meter: 'N/A',
    };

    useEffect(() => {
        setHeader({
            title: '',
            subtitle: '',
        });
        return () => setHeader({});
    }, [setHeader]);

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.push('/operations')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Vehicles</span>
            </button>

            {/* Vehicle Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                        {/* Vehicle Image */}
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                <span className="text-gray-600 text-xs">Vehicle</span>
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">{vehicle.name}</h1>
                            <p className="text-sm text-gray-600 mb-3">{vehicle.description}</p>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                    {vehicle.hours}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    {vehicle.status}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                    📍 {vehicle.location}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                    {vehicle.assignment}
                                </span>
                            </div>

                            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                                <Edit className="w-3 h-3" />
                                Edit Labels
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            JK
                        </button>
                        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                            <EyeOff className="w-4 h-4" />
                            Unwatch
                        </button>
                        <Menu as="div" className="relative">
                            <Menu.Button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </Menu.Button>
                        </Menu>
                        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>

                        {/* Add Dropdown */}
                        <Menu as="div" className="relative">
                            <Menu.Button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium">
                                Add
                                <ChevronDown className="w-4 h-4" />
                            </Menu.Button>
                            <Menu.Items className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 max-h-96 overflow-y-auto">
                                {addMenuItems.map((item, index) => (
                                    <Menu.Item key={index}>
                                        {({ active }) => (
                                            <button
                                                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm ${active ? 'bg-gray-50' : ''
                                                    }`}
                                            >
                                                <item.icon className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-700">{item.label}</span>
                                            </button>
                                        )}
                                    </Menu.Item>
                                ))}
                            </Menu.Items>
                        </Menu>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex gap-6 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'Overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel - Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
                        <div className="mb-4">
                            <button className="text-sm text-gray-600 hover:text-gray-900">All Fields</button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-start py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Name</span>
                                <span className="text-sm font-medium text-gray-900">{vehicle.name}</span>
                            </div>
                            <div className="flex justify-between items-start py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Meter</span>
                                <span className="text-sm font-medium text-blue-600 underline cursor-pointer">{vehicle.meter}</span>
                            </div>
                            <div className="flex justify-between items-start py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Status</span>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        {vehicle.status}
                                    </span>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-start py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Group</span>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-blue-600 underline cursor-pointer">Atlanta</div>
                                    <div className="text-sm text-gray-500">Georgia /</div>
                                    <button className="text-gray-400 hover:text-gray-600 mt-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-start py-3">
                                <span className="text-sm text-gray-600">Operator</span>
                                <span className="text-sm font-medium text-gray-900">{vehicle.operator}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Issues & Reminders */}
                    <div className="space-y-6">
                        {/* Open Issues */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Open Issues</h2>
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-500">There are no Open Issues</p>
                            </div>
                        </div>

                        {/* Service Reminders */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Service Reminders</h2>
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-500">There are no Service Reminders due soon for this Vehicle</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Other Tabs Content */}
            {activeTab !== 'Overview' && (
                <div className="bg-white rounded-lg border border-gray-200 p-12">
                    <div className="text-center">
                        <p className="text-gray-500">Content for {activeTab} tab</p>
                    </div>
                </div>
            )}
        </div>
    );
}
