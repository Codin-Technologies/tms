"use client";

import React, { useState } from "react";
import UserList from "./components/UserList";
import UserForm, { UserShape } from "./components/UserForm";
import AuditTrail, { AuditItem } from "./components/AuditTrail";
import RequireRole from "./components/RequireRole";
import { useHeader } from '@/components/HeaderContext'
import { ROLES } from "./components/roles";

const initialUsers: UserShape[] = [
  { id: 'u1', name: 'Alice Admin', email: 'alice@example.com', role: 'ADMIN', active: true },
  { id: 'u2', name: 'Bob Fleet', email: 'bob@example.com', role: 'FLEET_MANAGER', active: true },
  { id: 'u3', name: 'Cathy Tech', email: 'cathy@example.com', role: 'TECHNICIAN', active: true },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserShape[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<UserShape | null>(null);
  const [audit, setAudit] = useState<AuditItem[]>([]);

  // Mock current user - replace with real session later
  const currentUser = { id: 'u1', name: 'Alice Admin', role: 'ADMIN' };

  const addAudit = (item: Omit<AuditItem, 'id' | 'timestamp'>) => {
    const evt: AuditItem = { ...item, id: `${Math.random().toString(36).substr(2, 8)}`, timestamp: new Date().toISOString() };
    setAudit((prev) => [evt, ...prev]);
  };

  const createUser = (u: UserShape) => {
    setUsers((prev) => [u, ...prev]);
    addAudit({ action: 'CREATE', targetUserId: u.id, performedBy: currentUser.name, details: `Created user ${u.name} (${u.email})` });
  };

  const updateUser = (u: UserShape) => {
    setUsers((prev) => prev.map((p) => (p.id === u.id ? u : p)));
    addAudit({ action: 'UPDATE', targetUserId: u.id, performedBy: currentUser.name, details: `Updated user ${u.name}` });
  };

  const toggleActivate = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    const u = users.find((x) => x.id === id);
    if (u) {
      addAudit({ action: u.active ? 'DEACTIVATE' : 'ACTIVATE', targetUserId: id, performedBy: currentUser.name, details: `${u.name} de/activated` });
    }
  };

  const openCreateModal = () => {
    setEditingUser({ id: `u${Math.random().toString(36).substr(2, 6)}`, name: '', email: '', role: ROLES[4].key, active: true });
  };

  const onSave = (user: UserShape) => {
    if (users.some((u) => u.id === user.id)) updateUser(user);
    else createUser(user);
    setEditingUser(null);
  };

  // Set the top ribbon header for this page
  const { setHeader } = useHeader();
  React.useEffect(() => {
    setHeader({
      title: 'User Management',
      subtitle: 'Admin can create users, assign roles, and deactivate users',
      searchPlaceholder: 'Search users...',
      actions: (
        <>
          <RequireRole allowedRoles={[ 'ADMIN' ]} currentRole={currentUser.role}>
            <button onClick={openCreateModal} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Add User</button>
          </RequireRole>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm">Invite (Phase 2)</button>
        </>
      )
    })
    return () => setHeader({})
  }, [setHeader])
  return (
    <div className="mx-auto flex flex-col gap-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UserList users={users} onEdit={(u) => setEditingUser(u)} onDeactivate={(id) => toggleActivate(id)} currentRole={currentUser.role} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          {editingUser ? (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Edit User</h3>
              <UserForm user={editingUser} onChange={(u) => setEditingUser(u)} currentRole={currentUser.role} />
              <div className="flex justify-end gap-3 mt-4">
                <button className="px-4 py-2 border rounded-md text-sm" onClick={() => setEditingUser(null)}>Cancel</button>
                <button className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm" onClick={() => onSave(editingUser)}>Save</button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">User Info</h3>
              <p className="text-sm text-gray-500">Select a user to edit their details</p>
            </div>
          )}

          <AuditTrail items={audit} />
        </div>
      </div>
    </div>
  );
}
