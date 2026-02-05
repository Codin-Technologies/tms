"use client";

import React from "react";
import { ROLES } from "./roles";

export type UserShape = {
  id: string | number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  password?: string; // Optional password field for new users
};

export default function UserForm({
  user,
  onChange,
  currentRole = 'ADMIN',
  isNewUser = false,
  availableRoles = ROLES,
}: {
  user: UserShape;
  onChange: (u: UserShape) => void;
  currentRole?: string;
  isNewUser?: boolean;
  availableRoles?: { key: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name *</label>
        <input
          value={user.name}
          onChange={(e) => onChange({ ...user, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          placeholder="Enter full name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email *</label>
        <input
          type="email"
          value={user.email}
          onChange={(e) => onChange({ ...user, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          placeholder="user@example.com"
          required
          disabled={!isNewUser} // Email cannot be changed after creation
        />
        {!isNewUser && (
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        )}
      </div>
      {isNewUser && (
        <div>
          <label className="block text-sm font-medium mb-1">Password *</label>
          <input
            type="password"
            value={user.password || ''}
            onChange={(e) => onChange({ ...user, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Enter password"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Role *</label>
        <select
          value={user.role}
          onChange={(e) => onChange({ ...user, role: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          disabled={currentRole !== 'ADMIN'}
        >
          {availableRoles.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
        {currentRole !== 'ADMIN' && (
          <p className="text-xs text-gray-500 mt-1">Only admins can change roles</p>
        )}
      </div>
      <div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={user.active}
            onChange={(e) => onChange({ ...user, active: e.target.checked })}
            className="form-checkbox h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm">Active</span>
        </label>
      </div>
    </div>
  );
}
