"use client";

import React, { useState, useEffect } from "react";
import UserList from "./components/UserList";
import UserForm, { UserShape } from "./components/UserForm";
import AuditTrail, { AuditItem } from "./components/AuditTrail";
import RequireRole from "./components/RequireRole";
import { useSession } from "next-auth/react";
import { useHeader } from '@/components/HeaderContext';
import { ROLES } from "./components/roles";
import { fetchUsers, createUser, updateUser, deleteUser, fetchRoles } from "@/actions/user";
import { User, Role } from "@/types/user";
import { Loader2, Settings2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ key: string; label: string }[]>(ROLES);
  const [editingUser, setEditingUser] = useState<UserShape | null>(null);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { data: session, status } = useSession();
  const { setHeader } = useHeader();

  // Real current user from session
  const currentUser = {
    id: session?.user?.id || 'guest',
    name: session?.user?.name || 'Guest User',
    role: (typeof window !== 'undefined' && (window as any).__FORCE_ADMIN) ? 'ADMIN' : ((session?.user as any)?.role || 'GUEST')
  };

  console.log("[UsersPage] Status:", status, "Role:", currentUser.role);

  // Fetch users and roles when session is ready
  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    } else if (status === "unauthenticated") {
      // In a real app, middleware handles this, but we can log it
      console.warn("User is unauthenticated, waiting for login...");
    }
  }, [status]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Parallel fetch
      const [usersResult, rolesResult] = await Promise.all([
        fetchUsers(),
        fetchRoles()
      ]);

      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data);
      } else {
        throw new Error(usersResult.message || "Failed to load users");
      }

      if (rolesResult.success && rolesResult.data) {
        console.log("Fetched roles (raw):", rolesResult.data);

        const apiRoles = rolesResult.data.map(r => {
          // Debugging: Log each role transformation
          // Try using the exact name from the API as the key. 
          // If valid values are "Technician", "Fleet Manager", etc. then sending "technician" might fail.
          console.log(`Role mapping: ID=${r.id}, Name="${r.name}" -> Key="${r.name}"`);

          return {
            key: r.name,
            label: r.name,
            id: r.id
          };
        });

        if (apiRoles.length > 0) {
          setRoles(apiRoles);
        }
      }
    } catch (err: any) {
      console.error("loadData error:", err);
      setError(err.message || "Failed to load data");
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const result = await fetchUsers();
    if (result.success && result.data) {
      setUsers(result.data);
    }
  };

  const addAudit = (item: Omit<AuditItem, 'id' | 'timestamp'>) => {
    const evt: AuditItem = {
      ...item,
      id: `${Math.random().toString(36).substr(2, 8)}`,
      timestamp: new Date().toISOString()
    };
    setAudit((prev) => [evt, ...prev]);
  };

  const handleCreateUser = async (u: UserShape) => {
    setSubmitting(true);
    console.log("Submitting User Payload:", { ...u, role: u.role });
    const result = await createUser({
      name: u.name,
      email: u.email,
      password: (u as any).password || 'defaultPassword123', // Password should come from form
      role: u.role,
    });

    if (result.success && result.data) {
      await loadUsers(); // Reload users list
      addAudit({
        action: 'CREATE',
        targetUserId: result.data.id.toString(),
        performedBy: currentUser.name,
        details: `Created user ${result.data.name} (${result.data.email})`
      });
      toast.success(result.message || "User created successfully");
      setEditingUser(null);
    } else {
      toast.error(result.message || "Failed to create user");
    }
    setSubmitting(false);
  };

  const handleUpdateUser = async (u: UserShape) => {
    setSubmitting(true);
    const userId = typeof u.id === 'string' && u.id.includes('u')
      ? parseInt(u.id.replace('u', ''))
      : typeof u.id === 'string'
        ? parseInt(u.id)
        : u.id;

    const result = await updateUser(userId, {
      name: u.name,
      role: u.role,
    });

    if (result.success && result.data) {
      await loadUsers(); // Reload users list
      addAudit({
        action: 'UPDATE',
        targetUserId: result.data.id.toString(),
        performedBy: currentUser.name,
        details: `Updated user ${result.data.name}`
      });
      toast.success(result.message || "User updated successfully");
      setEditingUser(null);
    } else {
      toast.error(result.message || "Failed to update user");
    }
    setSubmitting(false);
  };

  const toggleActivate = async (id: string | number) => {
    // Convert ID correctly
    const userId = typeof id === 'string' && id.includes('u')
      ? parseInt(id.replace('u', ''))
      : typeof id === 'string'
        ? parseInt(id)
        : id;

    const user = users.find((u) => u.id === userId);

    if (!user) {
      console.error("User not found for ID:", userId, "Original ID:", id);
      toast.error("Could not find user to update");
      return;
    }

    const actionPromise = async () => {
      const result = await deleteUser(userId);
      if (!result.success) throw new Error(result.message || "Failed to update status");
      return result;
    };

    toast.promise(actionPromise(), {
      loading: 'Updating user status...',
      success: (data) => {
        loadUsers();
        addAudit({
          action: user.active ? 'DEACTIVATE' : 'ACTIVATE',
          targetUserId: userId.toString(),
          performedBy: currentUser.name,
          details: `${user.name} ${user.active ? 'deactivated' : 'activated'}`
        });
        return data.message || "User status updated";
      },
      error: (err) => {
        return err.message || "Failed to update user status";
      }
    });
  };

  const openCreateModal = () => {
    // Use the first available role as default, fallback to 'ADMIN' if none valid
    const defaultRole = roles.length > 0 ? roles[0].key : 'ADMIN';

    setEditingUser({
      id: `new-${Math.random().toString(36).substr(2, 6)}`,
      name: '',
      email: '',
      role: defaultRole,
      active: true,
      password: '' // Add password field for new users
    } as any);
  };

  const onSave = async (user: UserShape) => {
    // Check if it's a new user (id starts with 'new-') or existing user
    const isNewUser = typeof user.id === 'string' && user.id.startsWith('new-');

    if (isNewUser) {
      await handleCreateUser(user);
    } else {
      await handleUpdateUser(user);
    }
  };

  // Set the top ribbon header for this page
  useEffect(() => {
    setHeader({
      title: 'User Management',
      subtitle: 'Admin can create users, assign roles, and deactivate users',
      searchPlaceholder: 'Search users...',
      actions: (
        <>
          <RequireRole allowedRoles={['ADMIN', 'Administrator']} currentRole={currentUser.role}>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium transition-colors"
              disabled={loading}
            >
              Add User
            </button>
          </RequireRole>
          <Link
            href="/users/roles"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Manage Roles
          </Link>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium">
            Invite (Phase 2)
          </button>
        </>
      )
    });
    return () => setHeader({});
  }, [setHeader, loading, currentUser.role]);

  // Convert API users to UserShape format
  const userShapes: UserShape[] = users.map(u => ({
    id: u.id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active ?? true,
  }));

  return (
    <div className="mx-auto flex flex-col gap-6">
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
            <span className="text-gray-500 font-medium animate-pulse">Synchronizing users...</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-red-900">Communication Error</h3>
          <p className="text-red-700 mt-1 max-w-md">{error}</p>
          <button
            onClick={loadData}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full">
            <UserList
              users={userShapes}
              onEdit={(u) => {
                console.log("[UsersPage] onEdit clicked for user:", u.id);
                setEditingUser(u);
              }}
              onDeactivate={(id) => {
                console.log("[UsersPage] onDeactivate clicked for id:", id);
                toggleActivate(id);
              }}
              currentRole={currentUser.role}
            />
          </div>

          <div className="w-full">
            <AuditTrail items={audit} />
          </div>
        </div>
      )}

      {/* User Edit/Create Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                {typeof editingUser.id === 'string' && editingUser.id.startsWith('new-') ? 'Create New User' : 'Update User Details'}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                disabled={submitting}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <UserForm
                user={editingUser}
                onChange={(u) => setEditingUser(u)}
                currentRole={currentUser.role}
                isNewUser={typeof editingUser.id === 'string' && editingUser.id.startsWith('new-')}
                availableRoles={roles}
              />

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  className="px-6 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 order-2 sm:order-1"
                  onClick={() => setEditingUser(null)}
                  disabled={submitting}
                >
                  Discard Changes
                </button>
                <button
                  className="px-8 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-600/20 order-1 sm:order-2"
                  onClick={() => onSave(editingUser)}
                  disabled={submitting || !editingUser.name || !editingUser.email}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
