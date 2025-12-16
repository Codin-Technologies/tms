'use client';

import React from 'react';

interface TaskCardProps {
  id: string;
  title: string;
  vehicle: string;
  timestamp: string;
  badge: string;
  badgeColor?: 'blue' | 'red' | 'purple' | 'green';
}

export default function TaskCard({
  id,
  title,
  vehicle,
  timestamp,
  badge,
  badgeColor = 'blue',
}: TaskCardProps) {
  const badgeColorMap = {
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
  };

  return (
    <div
      tabIndex={0}
      role="listitem"
      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      <div className="text-sm text-gray-500 mb-2">{id}</div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{vehicle}</p>
      <div className="flex justify-between items-center">
        <span className={`text-xs px-2 py-1 rounded font-medium ${badgeColorMap[badgeColor]}`}>
          {badge}
        </span>
        <span className="text-xs text-gray-500">{timestamp}</span>
      </div>
    </div>
  );
}
