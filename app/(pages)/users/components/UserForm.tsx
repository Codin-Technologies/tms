"use client";

import React from "react";
import { ROLES } from "./roles";

export type UserShape = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export default function UserForm({
  user,
  onChange,
  currentRole = 'ADMIN',
}: {
  user: UserShape;
  onChange: (u: UserShape) => void;
  currentRole?: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          value={user.name}
          onChange={(e) => onChange({ ...user, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          value={user.email}
          onChange={(e) => onChange({ ...user, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          value={user.role}
          onChange={(e) => onChange({ ...user, role: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          disabled={currentRole !== 'ADMIN'}
        >
          {ROLES.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={user.active}
            onChange={(e) => onChange({ ...user, active: e.target.checked })}
            className="form-checkbox"
          />
          <span className="text-sm">Active</span>
        </label>
      </div>
    </div>
  );
}
