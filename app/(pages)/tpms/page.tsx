"use client";

import React, { useEffect, useState } from "react";
import { useHeader } from '@/components/HeaderContext'
import { Truck, TrendingUp, AlertTriangle, CheckCircle, User } from "lucide-react";

/** --- Types --- **/
type Pressures = {
  frontLeft: string;
  frontRight: string;
  rearLeft: string;
  rearRight: string;
};

type Vehicle = {
  id: string;
  license: string;
  status: "Moving" | "Critical" | "Idle" | "Offline" | string;
  statusColor: string;
  iconColor: string;
  pressures: Pressures;
  speed: number;
  updated: string;
};

/** --- Mock data generator (same as your design) --- **/
const generateVehicleData = (): Vehicle[] => {
  const getRandomPressure = (min = 28, max = 35) =>
    (Math.random() * (max - min) + min).toFixed(1);
  const getRandomSpeed = () => Math.floor(Math.random() * 70);

  return [
    {
      id: "001",
      license: "ABC-1234",
      status: "Moving",
      statusColor: "text-green-500",
      iconColor: "bg-green-100 text-green-600",
      pressures: {
        frontLeft: getRandomPressure(31, 33),
        frontRight: getRandomPressure(31, 33),
        rearLeft: getRandomPressure(31, 33),
        rearRight: getRandomPressure(31, 33),
      },
      speed: 45,
      updated: "2s ago",
    },
    {
      id: "002",
      license: "XYZ-5678",
      status: "Critical",
      statusColor: "text-red-500",
      iconColor: "bg-red-100 text-red-600",
      pressures: {
        frontLeft: "18.2",
        frontRight: "31.5",
        rearLeft: "32.1",
        rearRight: "25.8",
      },
      speed: 0,
      updated: "1s ago",
    },
    {
      id: "003",
      license: "DEF-9012",
      status: "Idle",
      statusColor: "text-gray-500",
      iconColor: "bg-blue-100 text-blue-600",
      pressures: {
        frontLeft: getRandomPressure(32, 34),
        frontRight: getRandomPressure(32, 34),
        rearLeft: getRandomPressure(32, 34),
        rearRight: getRandomPressure(32, 34),
      },
      speed: 0,
      updated: "5s ago",
    },
    {
      id: "004",
      license: "GHI-3456",
      status: "Moving",
      statusColor: "text-green-500",
      iconColor: "bg-green-100 text-green-600",
      pressures: {
        frontLeft: "31.9",
        frontRight: "27.3",
        rearLeft: getRandomPressure(31, 33),
        rearRight: getRandomPressure(31, 33),
      },
      speed: getRandomSpeed(),
      updated: "3s ago",
    },
    {
      id: "005",
      license: "JKL-7890",
      status: "Offline",
      statusColor: "text-gray-400",
      iconColor: "bg-gray-100 text-gray-600",
      pressures: {
        frontLeft: "-",
        frontRight: "-",
        rearLeft: "-",
        rearRight: "-",
      },
      speed: 0,
      updated: "offline",
    },
    {
      id: "006",
      license: "MNO-2468",
      status: "Moving",
      statusColor: "text-green-500",
      iconColor: "bg-green-100 text-green-600",
      pressures: {
        frontLeft: getRandomPressure(31, 33),
        frontRight: getRandomPressure(31, 33),
        rearLeft: getRandomPressure(31, 33),
        rearRight: getRandomPressure(31, 33),
      },
      speed: getRandomSpeed(),
      updated: "1s ago",
    },
  ];
};

/** --- Helper functions --- **/
const getPressureColor = (pressure: string) => {
  if (pressure === "-") return "bg-gray-400";
  const p = parseFloat(pressure);
  if (isNaN(p)) return "bg-gray-400";
  if (p < 25) return "bg-red-500";
  if (p < 28) return "bg-yellow-500";
  return "bg-green-500";
};

const getPressureTextColor = (pressure: string) => {
  if (pressure === "-") return "text-gray-600";
  const p = parseFloat(pressure);
  if (isNaN(p)) return "text-gray-600";
  if (p < 25) return "text-red-600";
  if (p < 28) return "text-yellow-600";
  return "text-green-600";
};

/** --- Main component --- **/
const TireMonitoringDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(generateVehicleData());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Stats calculations
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === "Moving").length;
  const criticalAlerts = vehicles.filter((v) => v.status === "Critical").length;
  const avgPressure =
    vehicles
      .filter((v) => v.status !== "Offline")
      .reduce((sum, v) => {
        const pressures = Object.values(v.pressures)
          .filter((p) => p !== "-")
          .map(Number)
          .filter((n) => !Number.isNaN(n));
        if (pressures.length === 0) return sum;
        return sum + pressures.reduce((a, b) => a + b, 0) / pressures.length;
      }, 0) /
    Math.max(1, vehicles.filter((v) => v.status !== "Offline").length);

  // Simulate real-time updates (replace with websocket in prod)
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(generateVehicleData());
      setCurrentTime(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader({
      title: 'TPMS',
      subtitle: 'Real-time Tire Pressure Monitoring System',
      actions: (
        <>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-medium">System Online</span>
          </div>
          <span className="text-gray-600">Last Updated: {currentTime.toLocaleTimeString()}</span>
        </>
      )
    })
    const id = setInterval(() => {
      setHeader({
        title: 'TPMS',
        subtitle: 'Real-time Tire Pressure Monitoring System',
        actions: (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-medium">System Online</span>
            </div>
            <span className="text-gray-600">Last Updated: {new Date().toLocaleTimeString()}</span>
          </>
        )
      });
    }, 3000);

    return () => { clearInterval(id); setHeader({}); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-500 rounded-lg p-3">
            <Truck className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TPMS</h1>
            <p className="text-gray-600">Real-time Tire Pressure Monitoring System</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-medium">System Online</span>
          </div>
          <span className="text-gray-600">
            Last Updated: {currentTime.toLocaleTimeString()}
          </span>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <User className="text-gray-600" size={24} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Vehicles</p>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Truck className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalVehicles}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Active Vehicles</p>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{activeVehicles}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Critical Alerts</p>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{criticalAlerts}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Avg Pressure</p>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgPressure.toFixed(1)} PSI</p>
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow-sm p-6">
            {/* Vehicle Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`${vehicle.iconColor} p-3 rounded-lg`}>
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Vehicle #{vehicle.id}</h3>
                  <p className="text-sm text-gray-600">License: {vehicle.license}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${vehicle.status === 'Moving' ? 'bg-green-500' : vehicle.status === 'Critical' ? 'bg-red-500' : vehicle.status === 'Idle' ? 'bg-gray-400' : 'bg-gray-300'}`}></div>
                <span className={`text-sm font-medium ${vehicle.statusColor}`}>
                  {vehicle.status}
                </span>
              </div>
            </div>

            {/* Tire Pressure Grid */}
            <div className="space-y-4">
              {/* Front Tires */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center space-y-2">
                  <span className={`${getPressureColor(vehicle.pressures.frontLeft)} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                    {vehicle.pressures.frontLeft}
                  </span>
                  <Truck className="text-gray-300" size={48} />
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <span className={`${getPressureColor(vehicle.pressures.frontRight)} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                    {vehicle.pressures.frontRight}
                  </span>
                </div>
              </div>

              {/* Rear Tires */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center space-y-2">
                  <span className={`${getPressureColor(vehicle.pressures.rearLeft)} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                    {vehicle.pressures.rearLeft}
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <span className={`${getPressureColor(vehicle.pressures.rearRight)} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                    {vehicle.pressures.rearRight}
                  </span>
                </div>
              </div>

              {/* Pressure Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Front Left</p>
                  <p className={`text-lg font-bold ${getPressureTextColor(vehicle.pressures.frontLeft)}`}>
                    {vehicle.pressures.frontLeft} PSI
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Front Right</p>
                  <p className={`text-lg font-bold ${getPressureTextColor(vehicle.pressures.frontRight)}`}>
                    {vehicle.pressures.frontRight} PSI
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Rear Left</p>
                  <p className={`text-lg font-bold ${getPressureTextColor(vehicle.pressures.rearLeft)}`}>
                    {vehicle.pressures.rearLeft} PSI
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Rear Right</p>
                  <p className={`text-lg font-bold ${getPressureTextColor(vehicle.pressures.rearRight)}`}>
                    {vehicle.pressures.rearRight} PSI
                  </p>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-600">
                <span>Speed: {vehicle.speed} mph</span>
                <span>Updated: {vehicle.updated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TireMonitoringDashboard;
