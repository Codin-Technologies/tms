"use client";

import React from "react";
import { Check, X } from "lucide-react";

export type Permission = {
    access: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
};

export type ModulePermissions = {
    [moduleName: string]: Permission;
};

const MODULES = [
    "Dashboard",
    "Inventory",
    "Transfers",
    "Reorder & Forecast",
    "Scrap & Quarantine",
    "Operations",
    "TPMS",
    "Inspection",
    "Reports",
    "Users",
];

interface RolePermissionsProps {
    permissions: ModulePermissions;
    onChange: (permissions: ModulePermissions) => void;
    readOnly?: boolean;
}

export default function RolePermissions({
    permissions,
    onChange,
    readOnly = false,
}: RolePermissionsProps) {
    const handleToggle = (module: string, action: keyof Permission) => {
        if (readOnly) return;

        const newPermissions = {
            ...permissions,
            [module]: {
                ...permissions[module],
                [action]: !permissions[module][action],
            },
        };
        onChange(newPermissions);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 border-collapse">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 border-b">Module</th>
                        <th className="px-4 py-3 border-b text-center">Access</th>
                        <th className="px-4 py-3 border-b text-center">Create</th>
                        <th className="px-4 py-3 border-b text-center">Update</th>
                        <th className="px-4 py-3 border-b text-center">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {MODULES.map((module) => {
                        const perm = permissions[module] || {
                            access: false,
                            create: false,
                            update: false,
                            delete: false,
                        };

                        return (
                            <tr key={module} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {module}
                                </td>
                                {(["access", "create", "update", "delete"] as const).map(
                                    (action) => (
                                        <td key={action} className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggle(module, action)}
                                                disabled={readOnly}
                                                className={`p-1 rounded-md transition-colors ${perm[action]
                                                        ? "text-teal-600 bg-teal-50 hover:bg-teal-100"
                                                        : "text-gray-300 hover:bg-gray-100"
                                                    } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                                            >
                                                {perm[action] ? (
                                                    <Check className="w-5 h-5" />
                                                ) : (
                                                    <X className="w-5 h-5 text-gray-200" />
                                                )}
                                            </button>
                                        </td>
                                    )
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
