import { User } from "@/types/auth";

// Initial mock data to ensure we have something to test with if needed
const INITIAL_USERS: User[] = [
    {
        id: "mock-user-1",
        name: "Test User",
        email: "test@example.com",
        password: "$2b$10$6YCU70qUDEjLb9LwubU1p.RbLyRC5fZvC7eHJRxS592Vu3Cp516UK", // Password: Test@123
        isVerified: true,
        createdAt: new Date().toISOString(),
    }
];

class MockUserRepository {
    private users: User[] = [...INITIAL_USERS];

    public async findByEmail(email: string): Promise<User | undefined> {
        return this.users.find((u) => u.email === email);
    }

    public async findById(id: string): Promise<User | undefined> {
        return this.users.find((u) => u.id === id);
    }

    public async findByVerificationToken(token: string): Promise<User | undefined> {
        return this.users.find((u) => u.verificationToken === token);
    }

    public async create(user: Omit<User, "id" | "createdAt" | "isVerified"> & { verificationToken?: string }): Promise<User> {
        const newUser: User = {
            ...user,
            id: crypto.randomUUID(),
            isVerified: false,
            verificationToken: user.verificationToken || crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        this.users.push(newUser);
        return newUser;
    }

    public async verifyUser(id: string): Promise<User | undefined> {
        const userIndex = this.users.findIndex((u) => u.id === id);
        if (userIndex === -1) return undefined;

        const updatedUser = {
            ...this.users[userIndex],
            isVerified: true,
            verificationToken: undefined,
        };

        this.users[userIndex] = updatedUser;
        return updatedUser;
    }
}

// Singleton instance
export const userRepository = new MockUserRepository();
