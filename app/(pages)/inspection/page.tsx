'use client';

import React, { useState, useEffect } from 'react';
import { useHeader } from '@/components/HeaderContext'
import { Search, Download, Plus, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import {  useInspectionOverviewQuery } from './query';

// Types
interface InspectionRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  tirePosition: string;
  inspector: {
    name: string;
    avatar: string;
  };
  date: string;
  status: 'passed' | 'failed' | 'pending';
  issues: string;
}

// Mock Data
const mockRecords: InspectionRecord[] = [
  {
    id: 'TRK-001',
    vehicleId: 'FL-7823',
    vehicleName: 'Freightliner Cascadia',
    tirePosition: 'Front Left',
    inspector: {
      name: 'John Smith',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff',
    },
    date: 'Dec 15, 2024',
    status: 'passed',
    issues: 'None',
  },
  {
    id: 'TRK-002',
    vehicleId: 'FL-5621',
    vehicleName: 'Volvo VNL',
    tirePosition: 'Rear Right',
    inspector: {
      name: 'Sarah Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=8b5cf6&color=fff',
    },
    date: 'Dec 14, 2024',
    status: 'failed',
    issues: 'Low Tread Depth',
  },
  {
    id: 'TRK-003',
    vehicleId: 'FL-3309',
    vehicleName: 'Peterbilt 579',
    tirePosition: 'Front Right',
    inspector: {
      name: 'Mike Davis',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Davis&background=10b981&color=fff',
    },
    date: 'Dec 14, 2024',
    status: 'passed',
    issues: 'None',
  },
  {
    id: 'TRK-004',
    vehicleId: 'FL-8891',
    vehicleName: 'Kenworth T680',
    tirePosition: 'Rear Left',
    inspector: {
      name: 'John Smith',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff',
    },
    date: 'Dec 13, 2024',
    status: 'pending',
    issues: 'Under Review',
  },
  {
    id: 'TRK-005',
    vehicleId: 'FL-2234',
    vehicleName: 'Mack Anthem',
    tirePosition: 'Front Left',
    inspector: {
      name: 'Sarah Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=8b5cf6&color=fff',
    },
    date: 'Dec 13, 2024',
    status: 'failed',
    issues: 'Uneven Wear',
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

// Main Component
export default function InspectionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [vehicleType, setVehicleType] = useState('all');
  const [inspector, setInspector] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { isLoading, error, data: inspectionOverview} = useInspectionOverviewQuery();

  // Filter records
  const filteredRecords = mockRecords.filter((record) => {
    if (statusFilter !== 'all' && record.status !== statusFilter) return false;
    if (searchQuery && !record.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !record.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const { setHeader } = useHeader();

  React.useEffect(() => {
    setHeader({
      title: 'Tire Inspections',
      subtitle: 'Monitor and track tire inspection records across your fleet',
      searchPlaceholder: 'Vehicle ID, Inspector...',
      actions: (
        <>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium">
            <Download className="w-5 h-5" />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
            <Plus className="w-5 h-5" />
            New Inspection
          </button>
        </>
      )
    })
    return () => setHeader({})
  }, [setHeader])

  return (
    <div className="space-y-6">
      {/* NOTE: Header moved to TopRibbon via useHeader */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Inspections"
          value={inspectionOverview ? inspectionOverview.data?.totalInspections.value : 0}
          change={`${inspectionOverview?inspectionOverview.data?.totalInspections.monthGrowth : 0} from last month`}
          icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
          iconBg="bg-blue-50"
          changeType="up"
        />
        <StatsCard
          title="Failed Inspections"
          value={inspectionOverview ? inspectionOverview.data?.failedInspections.value : 0}
          change={`${inspectionOverview?inspectionOverview.data?.failedInspections.change : 0} from last month`}
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          iconBg="bg-red-50"
          changeType={inspectionOverview && inspectionOverview.data?.failedInspections.direction === 'up' ? 'up' : 'down'}
        />
        <StatsCard
          title="Pending Reviews"
          value={inspectionOverview ? inspectionOverview.data?.pendingReviews.value : 0}
          change={inspectionOverview && parseInt(inspectionOverview.data?.pendingReviews.value) > 0 ? 'Attention Needed' : 'All Clear'}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          iconBg="bg-yellow-50"
          changeType="warning"
        />
        <StatsCard
          title="Pass Rate"
          value={inspectionOverview ? `${inspectionOverview.data?.passRate.value}%` : '0%'}
          change={`+${inspectionOverview? inspectionOverview.data?.passRate.change : 0}% from last month`}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          iconBg="bg-green-50"
          changeType="up"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filter Inspections</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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
                placeholder="Vehicle ID, Inspector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="truck">Truck</option>
              <option value="trailer">Trailer</option>
            </select>
          </div>

          {/* Inspector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Inspector</label>
            <select
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Inspectors</option>
              <option value="john">John Smith</option>
              <option value="sarah">Sarah Johnson</option>
              <option value="mike">Mike Davis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inspection Records Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Inspection Records</h2>
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length}
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
                  Tire Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{record.id}</div>
                        <div className="text-sm text-gray-500">{record.vehicleName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.tirePosition}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={record.inspector.avatar}
                        alt={record.inspector.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{record.inspector.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'passed'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {record.status === 'passed' ? '✓ Passed' : record.status === 'failed' ? '✗ Failed' : '○ Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.issues}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">View</button>
                    <button className="text-gray-600 hover:text-gray-900">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length}
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