"use client";

import React from "react";

export type AuditItem = {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'ACTIVATE' | 'DELETE';
  targetUserId: string;
  performedBy: string; // user id or name
  timestamp: string;
  details?: string;
};

export default function AuditTrail({ items }: { items: AuditItem[] }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {items.length === 0 && <p className="text-sm text-gray-500">No audit events yet.</p>}
        {items.map((it) => (
          <div key={it.id} className="text-xs text-gray-700 border-b border-gray-100 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{it.action}</p>
                <p className="text-gray-500">Target: {it.targetUserId}</p>
              </div>
              <div className="text-right text-gray-500">
                <p>{new Date(it.timestamp).toLocaleString()}</p>
                <p className="italic text-xs">By: {it.performedBy}</p>
              </div>
            </div>
            {it.details && <p className="text-gray-600 mt-1">{it.details}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
