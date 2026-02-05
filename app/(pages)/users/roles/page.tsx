"use client";

import React, { useState, useEffect } from "react";
import { useHeader } from "@/components/HeaderContext";
import { useSession } from "next-auth/react";
import { fetchRoles, createRole, deleteRole } from "@/actions/user";
import { Role } from "@/types/user";
import RolePermissions, { ModulePermissions } from "../components/RolePermissions";
import { Loader2, Plus, Trash2, Shield, Info } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock permissions state - in a real app, this would be fetched from/saved to the backend
    const [rolePermissions, setRolePermissions] = useState<Record<number, ModulePermissions>>({});

    const { setHeader } = useHeader();
    const { status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            loadRoles();
        }
    }, [status]);

    useEffect(() => {
        setHeader({
            title: "Role Management",
            subtitle: "Define roles and assign granular module permissions",
            actions: (
                <div className="flex gap-2">
                    <Link
                        href="/users"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
                    >
                        Back to Users
                    </Link>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Role
                    </button>
                </div>
            ),
        });
        return () => setHeader({});
    }, [setHeader]);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const result = await fetchRoles();
            if (result.success && result.data) {
                setRoles(result.data);
                if (result.data.length > 0 && !selectedRole) {
                    setSelectedRole(result.data[0]);
                }
            } else {
                toast.error(result.message || "Failed to load roles");
            }
        } catch (error) {
            toast.error("An error occurred while loading roles");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        setSubmitting(true);
        try {
            const result = await createRole(newRoleName);
            if (result.success && result.data) {
                toast.success("Role created successfully");
                setNewRoleName("");
                setShowAddModal(false);
                await loadRoles();
                setSelectedRole(result.data);
            } else {
                toast.error(result.message || "Failed to create role");
            }
        } catch (error) {
            toast.error("An error occurred while creating role");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRole = async (id: number) => {
        if (!confirm("Are you sure you want to delete this role? This cannot be undone.")) return;

        try {
            const result = await deleteRole(id);
            if (result.success) {
                toast.success("Role deleted successfully");
                if (selectedRole?.id === id) {
                    setSelectedRole(null);
                }
                await loadRoles();
            } else {
                toast.error(result.message || "Failed to delete role");
            }
        } catch (error) {
            toast.error("An error occurred while deleting role");
        }
    };

    const handlePermissionsChange = (newPerms: ModulePermissions) => {
        if (!selectedRole) return;
        setRolePermissions(prev => ({
            ...prev,
            [selectedRole.id]: newPerms
        }));
        // In a real app, you'd call an API here to save permissions
        toast.info(`Permissions updated for ${selectedRole.name} (Frontend only)`);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
                    {/* Role List Sidebar */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-teal-600" />
                                Available Roles
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => setSelectedRole(role)}
                                    className={`px-4 py-3 cursor-pointer flex items-center justify-between group transition-colors ${selectedRole?.id === role.id
                                        ? "bg-teal-50 border-r-4 border-r-teal-600"
                                        : "hover:bg-gray-50 border-r-4 border-r-transparent"
                                        }`}
                                >
                                    <span className={`text-sm ${selectedRole?.id === role.id ? "font-bold text-teal-900" : "text-gray-700"}`}>
                                        {role.name}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteRole(role.id);
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permissions Matrix Content */}
                    <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        {selectedRole ? (
                            <>
                                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Permissions for <span className="text-teal-600">{selectedRole.name}</span>
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">Configure what this role can see and do across the system.</p>
                                    </div>
                                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border border-blue-100">
                                        <Info className="w-3.5 h-3.5" />
                                        Auto-saves
                                    </div>
                                </div>
                                <div className="p-0 flex-1 overflow-auto">
                                    <RolePermissions
                                        permissions={rolePermissions[selectedRole.id] || {}}
                                        onChange={handlePermissionsChange}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Shield className="w-16 h-16 mb-4 stroke-1 opacity-20" />
                                <p>Select a role from the list to manage its permissions</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Role Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Create New Role</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Name</label>
                                <input
                                    type="text"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="e.g. Regional Manager"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Roles define groups of permissions. Once created, you can assign this role to any user and customize its access levels.
                            </p>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateRole}
                                    disabled={submitting || !newRoleName.trim()}
                                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Role
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
