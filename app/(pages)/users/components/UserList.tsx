"use client";

import React from "react";
import { UserShape } from "./UserForm";
import RequireRole from "./RequireRole";
import { UserX, UserCheck, Edit2 } from "lucide-react";

export default function UserList({
  users,
  onEdit,
  onDeactivate,
  currentRole = 'ADMIN',
}: {
  users: UserShape[];
  onEdit: (u: UserShape) => void;
  onDeactivate: (id: string | number) => void;
  currentRole?: string;
}) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <UserX className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No users found</h3>
        <p className="text-gray-500 mt-1">Get started by creating a new user.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Users ({users.length})</h3>
      <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
        {users.map((u) => (
          <div key={u.id} className="p-4 border border-gray-100 rounded-xl bg-white flex flex-col sm:flex-row sm:items-center justify-between hover:border-teal-200 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-base font-bold shadow-sm ${u.active ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-gray-50 text-gray-500 border border-gray-100'
                }`}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                    {u.name}
                  </p>
                  {!u.active && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-tighter">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{u.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                    {u.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 justify-end">
              <RequireRole allowedRoles={['ADMIN', 'Administrator']} currentRole={currentRole}>
                <button
                  onClick={() => {
                    onEdit(u);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
                  title="Edit user"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="sm:hidden text-sm font-medium">Edit</span>
                </button>
                <button
                  onClick={() => onDeactivate(u.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${u.active
                    ? 'border-red-100 text-red-600 bg-red-50/30 hover:bg-red-50 hover:border-red-200'
                    : 'border-green-100 text-green-600 bg-green-50/30 hover:bg-green-50 hover:border-green-200'
                    }`}
                  title={u.active ? 'Deactivate user' : 'Activate user'}
                >
                  {u.active ? (
                    <>
                      <UserX className="w-4 h-4" />
                      <span className="sm:hidden text-sm font-medium">Deactivate</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span className="sm:hidden text-sm font-medium">Activate</span>
                    </>
                  )}
                </button>
              </RequireRole>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
