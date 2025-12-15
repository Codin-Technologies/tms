'use client';

import React, { useState, useEffect } from 'react';
import { useHeader } from '@/components/HeaderContext'
import { Download, FileText, TrendingUp, DollarSign, Gauge, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock Data
const tireUsageOverTime = [
  { month: 'Jan', usage: 2400 },
  { month: 'Feb', usage: 2210 },
  { month: 'Mar', usage: 2890 },
  { month: 'Apr', usage: 2000 },
  { month: 'May', usage: 2181 },
  { month: 'Jun', usage: 2500 },
  { month: 'Jul', usage: 2100 },
  { month: 'Aug', usage: 2847 },
];

const wearPatternData = [
  { pattern: 'Normal', count: 450, percentage: 65 },
  { pattern: 'Center Wear', count: 120, percentage: 17 },
  { pattern: 'Edge Wear', count: 80, percentage: 12 },
  { pattern: 'Uneven', count: 42, percentage: 6 },
];

const brandDistribution = [
  { name: 'Michelin', value: 35, color: '#3b82f6' },
  { name: 'Goodyear', value: 28, color: '#8b5cf6' },
  { name: 'Bridgestone', value: 22, color: '#10b981' },
  { name: 'Continental', value: 15, color: '#f59e0b' },
];

const costBreakdown = [
  { fleet: 'Fleet A', cost: 12500 },
  { fleet: 'Fleet B', cost: 18200 },
  { fleet: 'Fleet C', cost: 9800 },
  { fleet: 'Fleet D', cost: 15600 },
  { fleet: 'Fleet E', cost: 11400 },
];

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  iconBg,
  changeColor 
}: { 
  title: string; 
  value: string | number; 
  change: string; 
  icon: React.ReactNode; 
  iconBg: string;
  changeColor: string;
}) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        <span className={`text-sm font-medium ${changeColor}`}>
          {change}
        </span>
      </div>
    </div>
  );
};

// Main Component
export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [fleet, setFleet] = useState('all');
  const [tireBrand, setTireBrand] = useState('all');
  const [reportType, setReportType] = useState('comprehensive');

  const { setHeader } = useHeader();

  React.useEffect(() => {
    setHeader({
      title: 'Tire Usage Reports',
      subtitle: 'Generate comprehensive reports and analyze tire performance',
      actions: (
        <>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium">
            <Download className="w-5 h-5" />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
            <FileText className="w-5 h-5" />
            Generate PDF
          </button>
        </>
      )
    })
    return () => setHeader({})
  }, [setHeader])

  return (
    <div className="space-y-6">
      {/* Header provided by TopRibbon */}

      {/* Report Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Report Filters</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>

          {/* Fleet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fleet</label>
            <select
              value={fleet}
              onChange={(e) => setFleet(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Fleets</option>
              <option value="fleet-a">Fleet A</option>
              <option value="fleet-b">Fleet B</option>
              <option value="fleet-c">Fleet C</option>
            </select>
          </div>

          {/* Tire Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tire Brand</label>
            <select
              value={tireBrand}
              onChange={(e) => setTireBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Brands</option>
              <option value="michelin">Michelin</option>
              <option value="goodyear">Goodyear</option>
              <option value="bridgestone">Bridgestone</option>
            </select>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tires Tracked"
          value="2,847"
          change="+12%"
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
          iconBg="bg-blue-50"
          changeColor="text-green-600"
        />
        <StatsCard
          title="Avg. Miles Traveled"
          value="48,200"
          change="+6%"
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          iconBg="bg-purple-50"
          changeColor="text-green-600"
        />
        <StatsCard
          title="Cost Per Mile"
          value="$0.18"
          change="-8%"
          icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
          iconBg="bg-yellow-50"
          changeColor="text-red-600"
        />
        <StatsCard
          title="Performance Score"
          value="87.5"
          change="+13%"
          icon={<Gauge className="w-6 h-6 text-green-600" />}
          iconBg="bg-green-50"
          changeColor="text-green-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tire Usage Over Time */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Tire Usage Over Time</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                Miles
              </button>
              <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                Hours
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tireUsageOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Brand Distribution */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Brand Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={brandDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }: any) => {
                  const total = brandDistribution.reduce((sum, item) => sum + item.value, 0);
                  const percentage = ((value / total) * 100).toFixed(0);
                  return `${name} ${percentage}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {brandDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wear Pattern Analysis */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Wear Pattern Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wearPatternData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="pattern" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Pattern Details */}
          <div className="mt-4 space-y-2">
            {wearPatternData.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    pattern.pattern === 'Normal' ? 'bg-green-500' :
                    pattern.pattern === 'Center Wear' ? 'bg-yellow-500' :
                    pattern.pattern === 'Edge Wear' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">{pattern.pattern}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{pattern.count}</span>
                  <span className="text-xs text-gray-500 ml-2">({pattern.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown by Fleet */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Cost Breakdown by Fleet</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis type="category" dataKey="fleet" stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Bar dataKey="cost" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Total Cost Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Cost</span>
              <span className="text-xl font-bold text-gray-900">
                ${costBreakdown.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Fleet Performance Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fleet ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Tires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Miles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issues</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {['A', 'B', 'C', 'D', 'E'].map((fleet, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Fleet {fleet}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{(Math.random() * 500 + 200).toFixed(0)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{(Math.random() * 20000 + 30000).toFixed(0)} mi</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{(Math.random() * 20).toFixed(0)}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Good
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {(Math.random() * 15 + 80).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}