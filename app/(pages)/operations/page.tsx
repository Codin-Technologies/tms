'use client';

import React, { useEffect, useState } from 'react';
import { useHeader } from '@/components/HeaderContext';
import { useRouter } from 'next/navigation';
import {
  Search,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Wrench
} from 'lucide-react';

// Types
interface Vehicle {
  id: string;
  model: string;
  status: 'Active' | 'Service' | 'Inactive';
  tireCount: string;
  lastService: string;
  driver: string;
  hasIssues?: boolean;
  serviceOverdue?: boolean;
  needsAttention?: boolean;
}

// Mock vehicle data with enhanced properties
const mockVehicles: Vehicle[] = [
  {
    id: 'FL-7823',
    model: 'Freightliner Cascadia',
    status: 'Active',
    tireCount: '18/18',
    lastService: '2 days ago',
    driver: 'John Smith',
    hasIssues: false,
    serviceOverdue: false,
    needsAttention: false,
  },
  {
    id: 'FL-5621',
    model: 'Kenworth T680',
    status: 'Service',
    tireCount: '17/18',
    lastService: '35 days ago',
    driver: 'Sarah Johnson',
    hasIssues: true,
    serviceOverdue: true,
    needsAttention: true,
  },
  {
    id: 'FL-3309',
    model: 'Peterbilt 579',
    status: 'Active',
    tireCount: '18/18',
    lastService: '5 days ago',
    driver: 'Mike Davis',
    hasIssues: false,
    serviceOverdue: false,
    needsAttention: false,
  },
  {
    id: 'FL-8891',
    model: 'Volvo VNL',
    status: 'Active',
    tireCount: '18/18',
    lastService: '3 days ago',
    driver: 'Emily Brown',
    hasIssues: false,
    serviceOverdue: false,
    needsAttention: false,
  },
  {
    id: 'FL-2234',
    model: 'Mack Anthem',
    status: 'Active',
    tireCount: '16/18',
    lastService: '1 day ago',
    driver: 'David Wilson',
    hasIssues: true,
    serviceOverdue: false,
    needsAttention: false,
  },
  {
    id: 'FL-9876',
    model: 'International LT',
    status: 'Inactive',
    tireCount: '16/18',
    lastService: '45 days ago',
    driver: 'Unassigned',
    hasIssues: true,
    serviceOverdue: true,
    needsAttention: true,
  },
  {
    id: 'FL-4567',
    model: 'Freightliner Cascadia',
    status: 'Active',
    tireCount: '18/18',
    lastService: '4 days ago',
    driver: 'Lisa Anderson',
    hasIssues: false,
    serviceOverdue: false,
    needsAttention: false,
  },
  {
    id: 'FL-1234',
    model: 'Kenworth W900',
    status: 'Service',
    tireCount: '15/18',
    lastService: '3 days ago',
    driver: 'Robert Taylor',
    hasIssues: true,
    serviceOverdue: false,
    needsAttention: false,
  },
];

// Stats Card Component
const StatsCard = ({
  title,
  value,
  change,
  icon,
  iconBg,
  changeType
}: {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  iconBg: string;
  changeType?: 'up' | 'down' | 'neutral' | 'warning';
}) => {
  const changeColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
    warning: 'text-yellow-600',
  };

  const ChangeIcon = changeType === 'up' ? TrendingUp : changeType === 'down' ? TrendingDown : null;

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center gap-1">
            {ChangeIcon && <ChangeIcon className={`w-4 h-4 ${changeColors[changeType!]}`} />}
            <span className={`text-sm ${changeColors[changeType || 'neutral']}`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function OperationsPage() {
  const router = useRouter();
  const { setHeader } = useHeader();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [vehicleType, setVehicleType] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setHeader({
      title: 'Tire Operations',
      subtitle: 'Monitor and manage vehicle fleet tire operations',
      searchPlaceholder: 'Search vehicles...',
      actions: (
        <>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium">
            <Download className="w-5 h-5" />
            Export
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 font-medium">
            <Plus className="w-5 h-5" />
            Add Vehicle
          </button>
        </>
      ),
    });
    return () => setHeader({});
  }, [setHeader]);

  // Calculate stats
  const totalVehicles = mockVehicles.length;
  const activeWorkOrders = mockVehicles.filter(v => v.status === 'Service').length;
  const openIssues = mockVehicles.filter(v => v.hasIssues).length;
  const serviceOverdue = mockVehicles.filter(v => v.serviceOverdue).length;
  const needsAttention = mockVehicles.filter(v => v.needsAttention).length;

  // Filter vehicles
  const filteredVehicles = mockVehicles.filter((vehicle) => {
    // Search filter
    if (searchQuery &&
      !vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter === 'has-issues' && !vehicle.hasIssues) return false;
    if (statusFilter === 'service-overdue' && !vehicle.serviceOverdue) return false;
    if (statusFilter === 'needs-attention' && !vehicle.needsAttention) return false;
    if (statusFilter === 'all-clear' && (vehicle.hasIssues || vehicle.serviceOverdue)) return false;

    // Driver filter
    if (driverFilter !== 'all' && vehicle.driver !== driverFilter) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Get unique drivers for filter
  const uniqueDrivers = Array.from(new Set(mockVehicles.map(v => v.driver)));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Work Orders"
          value={activeWorkOrders}
          change={`${totalVehicles} total vehicles`}
          icon={<Wrench className="w-6 h-6 text-blue-600" />}
          iconBg="bg-blue-50"
          changeType="neutral"
        />
        <StatsCard
          title="Open Issues"
          value={openIssues}
          change={`${openIssues} vehicles affected`}
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          iconBg="bg-red-50"
          changeType="warning"
        />
        <StatsCard
          title="Service Overdue"
          value={serviceOverdue}
          change="Requires attention"
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          iconBg="bg-yellow-50"
          changeType="warning"
        />
        <StatsCard
          title="Immediate Attention"
          value={needsAttention}
          change={`${totalVehicles - needsAttention} vehicles clear`}
          icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
          iconBg="bg-orange-50"
          changeType="down"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filter Vehicles</h2>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDateRange('30');
              setVehicleType('all');
              setDriverFilter('all');
            }}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Vehicle ID, Model, Driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Vehicles</option>
              <option value="has-issues">Has Issues</option>
              <option value="service-overdue">Service Overdue</option>
              <option value="needs-attention">Needs Attention</option>
              <option value="all-clear">All Clear</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Service</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Types</option>
              <option value="truck">Truck</option>
              <option value="trailer">Trailer</option>
            </select>
          </div>

          {/* Driver */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Drivers</option>
              {uniqueDrivers.map((driver) => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Fleet Vehicles</h2>
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alerts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/operations/vehicle/${vehicle.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{vehicle.id}</div>
                        <div className="text-sm text-gray-500">{vehicle.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={`https://ui-avatars.com/api/?name=${vehicle.driver.replace(' ', '+')}&background=10b981&color=fff`}
                        alt={vehicle.driver}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{vehicle.driver}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.status === 'Service'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {vehicle.status === 'Active' ? '✓ Active' : vehicle.status === 'Service' ? '○ Service' : '✗ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${vehicle.tireCount.split('/')[0] === vehicle.tireCount.split('/')[1]
                        ? 'text-green-600'
                        : 'text-orange-600'
                      }`}>
                      {vehicle.tireCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vehicle.lastService}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {vehicle.hasIssues && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Issue</span>
                      )}
                      {vehicle.serviceOverdue && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Overdue</span>
                      )}
                      {!vehicle.hasIssues && !vehicle.serviceOverdue && (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/operations/vehicle/${vehicle.id}`);
                      }}
                      className="text-teal-600 hover:text-teal-900 mr-4"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
