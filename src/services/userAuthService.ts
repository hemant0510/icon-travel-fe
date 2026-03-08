import {
    RegisterDTO,
    LoginDTO,
    User,
} from "@/types/auth";

class UserAuthService {
    private static instance: UserAuthService;
    private constructor() { }

    public static getInstance(): UserAuthService {
        if (!UserAuthService.instance) {
            UserAuthService.instance = new UserAuthService();
        }
        return UserAuthService.instance;
    }

    public async register(data: RegisterDTO): Promise<{ message: string; user?: User }> {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.message || "Registration failed");
        }
        return result;
    }

    public async login(data: LoginDTO): Promise<{ message: string; user: User }> {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.message || "Login failed");
        }
        return result;
    }

    public async verify(token: string): Promise<{ message: string }> {
        const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || "Verification failed");
        }
        return result;
    }

    public async getMe(): Promise<{ user: User }> {
        const response = await fetch("/api/auth/me");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || "Not authenticated");
        }
        return result;
    }

    public async logout(): Promise<void> {
        await fetch("/api/auth/logout", { method: "POST" });
    }
}

const userAuthService = UserAuthService.getInstance();
export default userAuthService;
