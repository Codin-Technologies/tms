import React from 'react'
import { Search, Bell, Plus, CheckCircle, AlertTriangle, ClipboardList, Package, Wrench, Truck, FileText, Users, Settings, HelpCircle, LogOut, MoreVertical } from 'lucide-react'
// SidebarNav provided by app/(pages)/layout.tsx

// Sidebar moved to components/navigation/sidebarNav.tsx

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
      <h3 className="text-4xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  </div>
)

const Dashboard = () => {
  return (
    <div className="mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening today</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tires, vehicles..."
                className="pl-10 pr-4 py-2.5 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
            <button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm">
              <Plus size={20} />
              Add Tire
            </button>
          </div>
        </div>
      </div>

      <main className="flex flex-col gap-6">
          {/* Stats Grid - 4 cards horizontally */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Tire Stock"
              value={8547}
              icon={Package}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              badge={{ label: "+12%", bg: "bg-green-50", text: "text-green-600" }}
            />
            <StatCard
              title="Mounted Tires"
              value={6234}
              icon={CheckCircle}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              badge={{ label: "Active", bg: "bg-green-50", text: "text-green-600" }}
            />
            <StatCard
              title="Low Stock Items"
              value={127}
              icon={AlertTriangle}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
              badge={{ label: "Alert", bg: "bg-orange-50", text: "text-orange-600" }}
            />
            <StatCard
              title="Pending Inspections"
              value={43}
              icon={ClipboardList}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              badge={{ label: "Today", bg: "bg-purple-50", text: "text-purple-600" }}
            />
          </div>

          {/* Charts Section - Stock Status and Tire Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Stock Status Overview */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Stock Status Overview</h2>
                <select className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Last 90 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 60 Days</option>
                </select>
              </div>
              {/* Line Chart Visualization */}
              <div className="h-80 relative">
                <svg className="w-full h-full" viewBox="0 0 800 300">
                  {/* Grid lines */}
                  <line x1="50" y1="250" x2="750" y2="250" stroke="#e5e7eb" strokeWidth="1"/>
                  <line x1="50" y1="200" x2="750" y2="200" stroke="#e5e7eb" strokeWidth="1"/>
                  <line x1="50" y1="150" x2="750" y2="150" stroke="#e5e7eb" strokeWidth="1"/>
                  <line x1="50" y1="100" x2="750" y2="100" stroke="#e5e7eb" strokeWidth="1"/>
                  <line x1="50" y1="50" x2="750" y2="50" stroke="#e5e7eb" strokeWidth="1"/>
                  
                  {/* Line path */}
                  <path
                    d="M 50 180 L 120 140 L 190 160 L 260 120 L 330 130 L 400 90 L 470 110 L 540 100 L 610 130 L 680 150 L 750 120"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  
                  {/* Area fill */}
                  <path
                    d="M 50 180 L 120 140 L 190 160 L 260 120 L 330 130 L 400 90 L 470 110 L 540 100 L 610 130 L 680 150 L 750 120 L 750 250 L 50 250 Z"
                    fill="url(#gradient)"
                    opacity="0.2"
                  />
                  
                  {/* Data points */}
                  <circle cx="50" cy="180" r="4" fill="#3b82f6"/>
                  <circle cx="120" cy="140" r="4" fill="#3b82f6"/>
                  <circle cx="190" cy="160" r="4" fill="#3b82f6"/>
                  <circle cx="260" cy="120" r="4" fill="#3b82f6"/>
                  <circle cx="330" cy="130" r="4" fill="#3b82f6"/>
                  <circle cx="400" cy="90" r="4" fill="#3b82f6"/>
                  <circle cx="470" cy="110" r="4" fill="#3b82f6"/>
                  <circle cx="540" cy="100" r="4" fill="#3b82f6"/>
                  <circle cx="610" cy="130" r="4" fill="#3b82f6"/>
                  <circle cx="680" cy="150" r="4" fill="#3b82f6"/>
                  <circle cx="750" cy="120" r="4" fill="#3b82f6"/>
                  
                  {/* X-axis labels */}
                  <text x="50" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Jan</text>
                  <text x="120" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Feb</text>
                  <text x="190" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Mar</text>
                  <text x="260" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Apr</text>
                  <text x="330" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">May</text>
                  <text x="400" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Jun</text>
                  <text x="470" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Jul</text>
                  <text x="540" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Aug</text>
                  <text x="610" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Sep</text>
                  <text x="680" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Oct</text>
                  <text x="750" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Nov</text>
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Tire Distribution */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tire Distribution</h2>
              {/* Donut Chart */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Mounted - 45% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="20"
                      strokeDasharray="113 282"
                      strokeDashoffset="0"
                    />
                    {/* In Stock - 35% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="20"
                      strokeDasharray="88 282"
                      strokeDashoffset="-113"
                    />
                    {/* Low Stock - 15% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="20"
                      strokeDasharray="38 282"
                      strokeDashoffset="-201"
                    />
                    {/* Damaged - 5% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="20"
                      strokeDasharray="13 282"
                      strokeDashoffset="-239"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">8,547</p>
                      <p className="text-xs text-gray-500">Total Tires</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <span className="text-sm text-gray-700">Mounted</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-700">In Stock</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-700">Low Stock</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-gray-700">Damaged</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Operations and Low Stock Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Operations */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Operations</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
              </div>
              <div className="space-y-4">
                <OperationItem
                  title="Tire Mounting - TRK-2847"
                  subtitle="Vehicle: FL-3892 | Position: LF"
                  time="2h ago"
                  icon={Wrench}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                />
                <OperationItem
                  title="Tire Rotation - TRK-1923"
                  subtitle="Vehicle: FL-2156 | All Positions"
                  time="4h ago"
                  icon={Package}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <OperationItem
                  title="Tire Repair - TRK-5621"
                  subtitle="Vehicle: FL-8834 | Position: RR"
                  time="5h ago"
                  icon={Wrench}
                  iconBg="bg-orange-100"
                  iconColor="text-orange-600"
                />
                <OperationItem
                  title="Tire Replacement - TRK-3347"
                  subtitle="Vehicle: FL-1209 | Position: RF"
                  time="6h ago"
                  icon={AlertTriangle}
                  iconBg="bg-red-100"
                  iconColor="text-red-600"
                />
                <OperationItem
                  title="Inspection Complete - TRK-7712"
                  subtitle="Vehicle: FL-5643 | Status: Passed"
                  time="7h ago"
                  icon={ClipboardList}
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                />
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">127 Items</span>
              </div>
              <div className="space-y-4">
                <StockAlertItem
                  title="Michelin XZE 295/80R22.5"
                  stock={12}
                  threshold={50}
                />
                <StockAlertItem
                  title="Bridgestone R249 11R22.5"
                  stock={8}
                  threshold={40}
                />
                <StockAlertItem
                  title="Goodyear G291 315/80R22.5"
                  stock={15}
                  threshold={45}
                />
                <StockAlertItem
                  title="Continental HDR2 285/70R19.5"
                  stock={6}
                  threshold={35}
                />
                <StockAlertItem
                  title="Pirelli TH01 315/70R22.5"
                  stock={11}
                  threshold={40}
                />
              </div>
            </div>
          </div>

          {/* Upcoming Inspections Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Inspections</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Schedule Inspection
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Inspection Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scheduled Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Inspector</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck size={20} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">FL-3892</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">Routine Inspection</td>
                    <td className="px-6 py-4 text-gray-700">Dec 15, 2024</td>
                    <td className="px-6 py-4 text-gray-700">Mike Johnson</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View Details</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck size={20} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">FL-2156</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">Pre-Trip Inspection</td>
                    <td className="px-6 py-4 text-gray-700">Dec 16, 2024</td>
                    <td className="px-6 py-4 text-gray-700">Sarah Williams</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View Details</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck size={20} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">FL-8834</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">Workshop Inspection</td>
                    <td className="px-6 py-4 text-gray-700">Dec 17, 2024</td>
                    <td className="px-6 py-4 text-gray-700">David Brown</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Scheduled</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View Details</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck size={20} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">FL-1209</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">End-of-Life Inspection</td>
                    <td className="px-6 py-4 text-gray-700">Dec 18, 2024</td>
                    <td className="px-6 py-4 text-gray-700">Mike Johnson</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Scheduled</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View Details</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </div>
  )
}

const OperationItem = ({ title, subtitle, time, icon: Icon, iconBg, iconColor }: any) => (
  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
    <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-gray-900 text-sm">{title}</p>
      <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
    </div>
    <span className="text-xs text-gray-500">{time}</span>
  </div>
)

const StockAlertItem = ({ title, stock, threshold }: any) => (
  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
    <div className="flex-1">
      <p className="font-semibold text-gray-900 text-sm mb-2">{title}</p>
      <p className="text-xs text-gray-600">Current Stock: {stock} | Threshold: {threshold}</p>
    </div>
    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
      Reorder
    </button>
  </div>
)
export default Dashboard