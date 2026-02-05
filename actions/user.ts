import api from "@/lib/api";
import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    Role,
    UserListResponse,
    UserResponse,
    RoleListResponse,
    ApiError
} from "@/types/user";

/**
 * Fetch all users from the API
 */
export const fetchUsers = async (): Promise<{ success: boolean; data?: User[]; message?: string }> => {
    try {
        console.log("Calling Fetch Users API...");
        const response = await api.get<UserListResponse | User[]>('/api/admin/users');
        console.log("Fetch Users raw response:", response.status, response.data);

        let usersData: User[] | undefined;

        if (Array.isArray(response.data)) {
            usersData = response.data;
        } else if (response.data && Array.isArray((response.data as any).data)) {
            usersData = (response.data as any).data;
        } else if (response.data && typeof response.data === 'object' && Array.isArray((response.data as any).users)) {
            usersData = (response.data as any).users;
        }

        if (usersData) {
            console.log(`Successfully parsed ${usersData.length} users`);
            return {
                success: true,
                data: usersData,
            };
        }

        console.error("Unknown response format:", response.data);
        throw new Error("Invalid API response format: Expected an array or data.data/data.users array");
    } catch (error: any) {
        console.error("fetchUsers error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to fetch users",
        };
    }
};

/**
 * Fetch a single user by ID
 */
export const fetchUserById = async (id: number): Promise<{ success: boolean; data?: User; message?: string }> => {
    try {
        const response = await api.get<UserResponse>(`/api/admin/users/${id}`);

        if (response.data && response.data.data) {
            return {
                success: true,
                data: response.data.data,
            };
        }

        throw new Error("Invalid API response format");
    } catch (error: any) {
        console.error("fetchUserById error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to fetch user",
        };
    }
};

/**
 * Create a new user
 */
export const createUser = async (data: CreateUserRequest): Promise<{ success: boolean; data?: User; message?: string }> => {
    try {
        const response = await api.post<UserResponse>('/api/admin/users', data);

        if (response.status === 201 && response.data) {
            return {
                success: true,
                data: response.data.data,
                message: "User created successfully",
            };
        }

        throw new Error("Failed to create user");
    } catch (error: any) {
        console.error("createUser error:", error);
        console.error("Error response:", JSON.stringify(error.response?.data, null, 2));

        // Handle validation errors
        if (error.response?.data?.errors) {
            const validationErrors = error.response.data.errors;
            const errorMessages = Object.values(validationErrors).flat().join(", ");
            return {
                success: false,
                message: errorMessages || "Validation failed",
            };
        }

        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to create user",
        };
    }
};

/**
 * Update an existing user
 */
export const updateUser = async (id: number, data: UpdateUserRequest): Promise<{ success: boolean; data?: User; message?: string }> => {
    try {
        const response = await api.put<UserResponse>(`/api/admin/users/${id}`, data);

        if (response.status === 200 && response.data) {
            return {
                success: true,
                data: response.data.data,
                message: "User updated successfully",
            };
        }

        throw new Error("Failed to update user");
    } catch (error: any) {
        console.error("updateUser error:", error);
        console.error("Error response:", JSON.stringify(error.response?.data, null, 2));

        // Handle validation errors
        if (error.response?.data?.errors) {
            const validationErrors = error.response.data.errors;
            const errorMessages = Object.values(validationErrors).flat().join(", ");
            return {
                success: false,
                message: errorMessages || "Validation failed",
            };
        }

        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to update user",
        };
    }
};

/**
 * Delete/deactivate a user
 */
export const deleteUser = async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete(`/api/admin/users/${id}`);

        if (response.status === 200) {
            return {
                success: true,
                message: "User deactivated successfully",
            };
        }

        throw new Error("Failed to deactivate user");
    } catch (error: any) {
        console.error("deleteUser error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to deactivate user",
        };
    }
};

/**
 * Fetch all available roles
 */
export const fetchRoles = async (): Promise<{ success: boolean; data?: Role[]; message?: string }> => {
    try {
        const response = await api.get<RoleListResponse | Role[]>('/api/admin/roles');
        console.log("DEBUG fetchRoles raw response:", JSON.stringify(response.data, null, 2));

        let rolesData: Role[] | undefined;

        if (Array.isArray(response.data)) {
            rolesData = response.data;
        } else if (response.data && Array.isArray((response.data as any).data)) {
            rolesData = (response.data as any).data;
        } else if (response.data && typeof response.data === 'object' && Array.isArray((response.data as any).roles)) {
            rolesData = (response.data as any).roles;
        }

        if (rolesData) {
            console.log(`Successfully parsed ${rolesData.length} roles`);
            return {
                success: true,
                data: rolesData,
            };
        }

        console.error("Unknown roles response format:", response.data);
        throw new Error("Invalid API response format: Expected an array or data.data/data.roles array");
    } catch (error: any) {
        console.error("fetchRoles error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to fetch roles",
        };
    }
};

/**
 * Create a new role
 */
export const createRole = async (name: string): Promise<{ success: boolean; data?: Role; message?: string }> => {
    try {
        const response = await api.post<{ success: boolean; data: Role }>('/api/admin/roles', { name });

        if (response.status === 201 && response.data) {
            return {
                success: true,
                data: response.data.data,
                message: "Role created successfully",
            };
        }

        throw new Error("Failed to create role");
    } catch (error: any) {
        console.error("createRole error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to create role",
        };
    }
};

/**
 * Delete a role
 */
export const deleteRole = async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete(`/api/admin/roles/${id}`);

        if (response.status === 200) {
            return {
                success: true,
                message: "Role deleted successfully",
            };
        }

        throw new Error("Failed to delete role");
    } catch (error: any) {
        console.error("deleteRole error:", error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to delete role",
        };
    }
};
