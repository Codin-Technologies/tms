'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  model: string;
  status: 'Active' | 'Service';
  tyres: string;
  lastService: string;
}

interface VehicleFleetListProps {
  vehicles: Vehicle[];
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onAddVehicle?: (vehicle: Vehicle) => void;
}

export default function VehicleFleetList({
  vehicles,
  onSelectVehicle,
  onAddVehicle,
}: VehicleFleetListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    id: '',
    name: '',
    model: '',
    status: 'Active',
    tyres: '',
    lastService: '',
  });

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Fleet</h3>

      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="relative flex-1 mr-2">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => onSelectVehicle?.(vehicle)}
            className="p-3 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors bg-white"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-gray-900">{vehicle.id}</p>
                <p className="text-sm text-gray-600">{vehicle.name}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(
                  vehicle.status
                )}`}
              >
                {vehicle.status}
              </span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Tyres</span>
                <br />
                {vehicle.tyres}
              </p>
              <p>
                <span className="font-medium">Last Service</span>
                <br />
                {vehicle.lastService}
              </p>
            </div>
            
          </div>
        ))}
      </div>
      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Add New Vehicle</h2>
            <div className="space-y-3 text-black">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle ID</label>
                <input
                  value={newVehicle.id}
                  onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="FL-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={newVehicle.status}
                    onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Service</label>
                  <input
                    value={newVehicle.lastService}
                    onChange={(e) => setNewVehicle({ ...newVehicle, lastService: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 5 days ago"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tyres</label>
                <input
                  value={newVehicle.tyres}
                  onChange={(e) => setNewVehicle({ ...newVehicle, tyres: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 18/18"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newVehicle.id || !newVehicle.name) return;
                    onAddVehicle?.(newVehicle);
                    setNewVehicle({ id: '', name: '', model: '', status: 'Active', tyres: '', lastService: '' });
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
