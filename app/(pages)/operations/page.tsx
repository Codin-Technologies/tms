'use client';

import React, { useState, useEffect } from 'react';
import { useHeader } from '@/components/HeaderContext'
import TaskColumn from './components/TaskColumn';
import VehicleFleetList from './components/VehicleFleetList';
import TireConfigurationViewer from './components/TireConfigurationViewer';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

// Mock data
const mockTasks = {
  new: [
    {
      id: '#TK-2847',
      title: 'Tire Rotation',
      vehicle: 'Vehicle: FL-7823 | Front Left',
      timestamp: '2m ago',
      badge: 'Rotation',
      badgeColor: 'purple' as const,
    },
    {
      id: '#TK-2846',
      title: 'Tire Replacement',
      vehicle: 'Vehicle: FL-5621 | Rear Right',
      timestamp: '8m ago',
      badge: 'Replacement',
      badgeColor: 'red' as const,
    },
  ],
  assigned: [
    {
      id: '#TK-2845',
      title: 'Install New Tire',
      vehicle: 'Vehicle: FL-3309 | Front Right',
      timestamp: '1h ago',
      badge: 'Installation',
      badgeColor: 'green' as const,
    },
    {
      id: '#TK-2843',
      title: 'Tire Inspection',
      vehicle: 'Vehicle: FL-8891 | All Tires',
      timestamp: '2h ago',
      badge: 'Inspection',
      badgeColor: 'blue' as const,
    },
  ],
  completed: [
    {
      id: '#TK-2842',
      title: 'Tire Replacement',
      vehicle: 'Vehicle: FC-2234 | Rear Left',
      timestamp: '3h ago',
      badge: 'Replacement',
      badgeColor: 'red' as const,
    },
    {
      id: '#TK-2841',
      title: 'Tire Rotation',
      vehicle: 'Vehicle: FC-6677 | All Axles',
      timestamp: '4h ago',
      badge: 'Rotation',
      badgeColor: 'purple' as const,
    },
  ],
};

const mockVehicles = [
  {
    id: 'FL-7823',
    name: 'Freightliner Cascadia',
    model: 'Freightliner Cascadia',
    status: 'Active' as const,
    tyres: '18/18',
    lastService: '2 days ago',
  },
  {
    id: 'FL-5621',
    name: 'Kenworth T680',
    model: 'Kenworth T680',
    status: 'Service' as const,
    tyres: '17/18',
    lastService: '1 week ago',
  },
  {
    id: 'FL-3309',
    name: 'Peterbilt 579',
    model: 'Peterbilt 579',
    status: 'Active' as const,
    tyres: '18/18',
    lastService: '5 days ago',
  },
  {
    id: 'FL-8891',
    name: 'Volvo VNL',
    model: 'Volvo VNL',
    status: 'Active' as const,
    tyres: '18/18',
    lastService: '3 days ago',
  },
  {
    id: 'FL-2234',
    name: 'Mack Anthem',
    model: 'Mack Anthem',
    status: 'Active' as const,
    tyres: '18/18',
    lastService: '1 day ago',
  },
];

export default function OperationsPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<typeof mockVehicles[0] | null>(null);
  const [vehicles, setVehicles] = useState(mockVehicles);

  const { setHeader } = useHeader();

  useEffect(() => {
    // set page header
    try {
      setHeader({
        title: 'Tire Operations',
        subtitle: 'Manage tire rotations, inspections, and replacements',
        searchPlaceholder: 'Search vehicles, tasks...',
        // actions omitted - actions are available inside the page content
      });
    } catch (e) {}
    return () => {
      try { setHeader({}); } catch (e) {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mock tire configuration for selected vehicle
  const tireConfiguration = {
    front: [
      { id: 'FL', label: 'FL', status: 'good' as const },
      { id: 'FR', label: 'FR', status: 'good' as const },
    ],
    middle: [
      { id: 'MJ-0-L1', label: 'MJ-0', status: 'warning' as const },
      { id: 'MJ-0-L2', label: 'MJ-0', status: 'warning' as const },
      { id: 'MJ-0-R1', label: 'MJ-0', status: 'good' as const },
      { id: 'MJ-0-R2', label: 'MJ-0', status: 'good' as const },
    ],
    rear: [
      { id: 'MR-0-L1', label: 'MR-0', status: 'critical' as const },
      { id: 'MR-0-L2', label: 'MR-0', status: 'critical' as const },
      { id: 'MR-0-R1', label: 'MR-0', status: 'good' as const },
      { id: 'MR-0-R2', label: 'MR-0', status: 'good' as const },
    ],
  };

  const handleTireClick = (tireId: string) => {
    console.log('Tire clicked:', tireId);
  };

  return (
    <div className="space-y-6">
      {/* Page content uses the global TopRibbon for title/subtitle */}

      {/* Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn
          title="New Tasks"
          count={4}
          tasks={mockTasks.new}
          icon={<AlertCircle className="w-5 h-5 text-orange-500" />}
        />
        <TaskColumn
          title="Assigned"
          count={6}
          tasks={mockTasks.assigned}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
        <TaskColumn
          title="Completed"
          count={12}
          tasks={mockTasks.completed}
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        />
      </div>

      {/* Bottom Section: Vehicle Fleet & Tire Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Fleet List - Takes 1 column */}
          <div className="lg:col-span-1">
          <VehicleFleetList vehicles={vehicles} onSelectVehicle={setSelectedVehicle} onAddVehicle={(v) => setVehicles((prev) => [v, ...prev])} />
        </div>

        {/* Tire Configuration Viewer - Takes 2 columns */}
        <div className="lg:col-span-2">
          <TireConfigurationViewer
            title={selectedVehicle ? `${selectedVehicle.id} - Tire Configuration` : 'FL-7823 - Tire Configuration'}
            subtitle={selectedVehicle ? selectedVehicle.model : 'Freightliner Cascadia | 3-Axle Configuration'}
            axles={tireConfiguration}
            onTireClick={handleTireClick}
          />
        </div>
      </div>
    </div>
  );
}
