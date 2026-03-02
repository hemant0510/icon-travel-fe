import { AuthResponse } from '../models/responses/AuthResponse';

class AuthService {
    private static instance: AuthService;
    private accessToken: string | null = null;
    private tokenExpiration: number = 0;
    private tokenPromise: Promise<string> | null = null;
    private fetchMutex: Promise<void> | null = null;
    private retryCount: number = 0;
    private readonly MAX_RETRIES = 3;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async getToken(): Promise<string> {
        // Wait for any ongoing mutex lock
        if (this.fetchMutex) {
            await this.fetchMutex;
        }

        // If token is valid, return it
        if (this.accessToken && !this.isTokenExpired()) {
            return this.accessToken;
        }

        // If a request is already in progress, wait for it
        if (this.tokenPromise) {
            return this.tokenPromise;
        }

        // Create mutex lock
        let releaseMutex: ((value: void | PromiseLike<void>) => void) | undefined;
        this.fetchMutex = new Promise<void>((resolve) => {
            releaseMutex = resolve;
        });

        try {
            // Otherwise, fetch a new token with retry logic
            this.tokenPromise = this.fetchTokenWithRetry().finally(() => {
                this.tokenPromise = null;
            });

            const token = await this.tokenPromise;
            return token;
        } finally {
            // Release mutex
            if (releaseMutex) {
                releaseMutex();
            }
            this.fetchMutex = null;
        }
    }

    private async fetchTokenWithRetry(): Promise<string> {
        for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const token = await this.fetchToken();
                this.retryCount = 0; // Reset on success
                return token;
            } catch (error) {
                if (attempt === this.MAX_RETRIES) {
                    throw error;
                }
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise<void>(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Failed to fetch token after retries');
    }

    private isTokenExpired(): boolean {
        // Check if token is expired or about to expire (within 60 seconds)
        return Date.now() >= this.tokenExpiration - 60000;
    }

    private async fetchToken(): Promise<string> {
        const clientId = process.env.AMADEUS_CLIENT_ID;
        const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
        const baseUrl = process.env.AMADEUS_BASE_URL;

        if (!clientId || !clientSecret || !baseUrl) {
            const error = new Error('Missing Amadeus API credentials in environment variables');
            console.error('AuthService: Missing credentials');
            throw error;
        }

        const apiBase = baseUrl.replace(/\/v1\/?$/, '');
        const url = `${apiBase}/v1/security/oauth2/token`;
        const body = new URLSearchParams();
        body.append('client_id', clientId);
        body.append('client_secret', clientSecret);
        body.append('grant_type', 'client_credentials');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`AuthService: Token fetch failed [${response.status}]`, errorText);
                
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Invalid Amadeus API credentials');
                } else if (response.status >= 500) {
                    throw new Error('Amadeus API server error');
                }
                
                throw new Error(`Failed to fetch token: ${response.status}`);
            }

            const data: AuthResponse = await response.json();

            this.accessToken = data.access_token;
            // expires_in is in seconds, convert to milliseconds and add to current time
            this.tokenExpiration = Date.now() + (data.expires_in * 1000);

            return this.accessToken;
        } catch (error) {
            console.error('AuthService:', error);
            throw error;
        }
    }
}

export default AuthService.getInstance();
