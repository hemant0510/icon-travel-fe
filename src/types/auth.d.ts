export interface User {
    id: string;
    email: string;
    password?: string; // Hashed in real life, making it optional for frontend safety
    name: string;
    isVerified: boolean;
    verificationToken?: string;
    createdAt: string;
}

export interface RegisterDTO {
    email: string;
    password?: string;
    name: string;
}

export interface LoginDTO {
    email: string;
    password?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}
