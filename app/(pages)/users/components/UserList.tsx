"use client";

import React from "react";
import { UserShape } from "./UserForm";
import RequireRole from "./RequireRole";

export default function UserList({
  users,
  onEdit,
  onDeactivate,
  currentRole = 'ADMIN',
}: {
  users: UserShape[];
  onEdit: (u: UserShape) => void;
  onDeactivate: (id: string) => void;
  currentRole?: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {users.map((u) => (
          <div key={u.id} className="p-3 border border-gray-100 rounded-md bg-white flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{u.name} <span className="text-xs font-normal text-gray-500">({u.email})</span></p>
              <p className="text-xs text-gray-600">{u.role} - {u.active ? 'Active' : 'Deactivated'}</p>
            </div>
            <div className="flex items-center gap-2">
              <RequireRole allowedRoles={[ 'ADMIN' ]} currentRole={currentRole}>
                <button
                  onClick={() => onEdit(u)}
                  className="px-3 py-1 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeactivate(u.id)}
                  className={`px-3 py-1 rounded-md text-sm ${u.active ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
                >
                  {u.active ? 'Deactivate' : 'Activate'}
                </button>
              </RequireRole>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
