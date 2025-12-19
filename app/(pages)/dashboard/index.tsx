"use client"

import React from 'react'
import { Bell, Plus, CheckCircle, AlertTriangle, ClipboardList, Package, Wrench, Truck, FileText, Users, Settings, HelpCircle, LogOut, MoreVertical } from 'lucide-react'
import { useHeader } from '@/components/HeaderContext'
import { useStockOverviewQuery } from '../stock/query'
import { useInspectionOverviewQuery } from '../inspection/query'
import { formatDistanceToNow } from 'date-fns'

const StatCard = ({ title, value, icon: Icon, trend, iconBg, iconColor, badge }: any) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon size={24} className={iconColor} />
      </div>
      {badge && (
        <span className={`px-3 py-1 ${badge.bg} ${badge.text} rounded-md text-sm font-medium`}>
          {badge.label}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-4xl font-bold text-gray-900 mb-2">{value ? value.toLocaleString() : 0}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  </div>
)

const Dashboard = () => {
  const { setHeader } = useHeader()
  const { data: stockOverview } = useStockOverviewQuery()
  const { data: inspectionOverview } = useInspectionOverviewQuery()

  React.useEffect(() => {
    setHeader({
      title: "Dashboard Overview",
      subtitle: "Welcome back, here's what's happening today",
      searchPlaceholder: "Search tires, vehicles...",
      actions: (
        <>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm">
            <Plus size={20} />
            Add Tire
          </button>
        </>
      ),
    })
    return () => setHeader({})
  }, [setHeader])

  /* Safe access handling */
  const stockData = stockOverview?.data || { total: 0, inuse: 0, instore: 0, needsreplacement: 0 };
  const inspectionData = inspectionOverview?.data || {
    totalInspections: { value: 0 },
    pendingReviews: { value: 0 },
  };

  return (
    <div className="mx-auto flex flex-col gap-6">
      <main className="flex flex-col gap-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tire Stock"
            value={stockData.total}
            icon={Package}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          // badge={{ label: "+12%", bg: "bg-green-50", text: "text-green-600" }} 
          // Removed hardcoded trend for now
          />
          <StatCard
            title="Mounted Tires"
            value={stockData.inuse}
            icon={CheckCircle}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            badge={{ label: "Active", bg: "bg-green-50", text: "text-green-600" }}
          />
          <StatCard
            title="Needs Replacement"
            value={stockData.needsreplacement}
            icon={AlertTriangle}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            badge={{ label: "Alert", bg: "bg-orange-50", text: "text-orange-600" }}
          />
          <StatCard
            title="Pending Inspections"
            value={inspectionData.pendingReviews.value}
            icon={ClipboardList}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            badge={{ label: "Pending", bg: "bg-purple-50", text: "text-purple-600" }}
          />
        </div>

        {/* Charts Section - Stock Status and Tire Distribution */}
        {/* Keeping the hardcoded charts for now as visual placeholders, 
            but updating the numbers in the Donut chart text if possible or leaving as static visual 
            until charting library is properly hooked up to dynamic data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stock Status Overview */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Stock Status Overview</h2>
              {/* ... (Chart remains static/mocked for now as we don't have historical data endpoints yet) ... */}
            </div>
            <div className="h-80 relative flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-400 italic">Historical data visualization coming soon</p>
            </div>
          </div>

          {/* Tire Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tire Distribution</h2>
            <div className="flex items-center justify-center mb-6">
              {/* Simplified visual for now */}
              <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-8 border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stockData.total}</p>
                  <p className="text-xs text-gray-500">Total Tires</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Mounted</span>
                <span className="text-sm font-semibold text-gray-900">{stockData.inuse}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">In Stock</span>
                <span className="text-sm font-semibold text-gray-900">{stockData.instore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Needs Replacement</span>
                <span className="text-sm font-semibold text-gray-900">{stockData.needsreplacement}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ... (Removing Recent Operations / Low Stock / Upcoming Inspections tables for now OR 
               Leaving them as standard UI components but noting they are static until we make specific queries for them) ... 
               I'll remove the hardcoded tables to strictly "Check for non-functioning/broken code". 
               Showing empty or loading state is better than fake data. 
        */}
      </main>
    </div>
  )
}

export default Dashboard