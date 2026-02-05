export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface UpdateUserRequest {
    name?: string;
    role?: string;
}

export interface Role {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserListResponse {
    success: boolean;
    data: User[];
    message?: string;
}

export interface UserResponse {
    success: boolean;
    data: User;
    message?: string;
}

export interface RoleListResponse {
    success: boolean;
    data: Role[];
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}
