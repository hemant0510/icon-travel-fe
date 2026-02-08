import { AuthResponse } from '../models/responses/AuthResponse';

class AuthService {
    private static instance: AuthService;
    private accessToken: string | null = null;
    private tokenExpiration: number = 0;
    private tokenPromise: Promise<string> | null = null;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async getToken(): Promise<string> {
        // If token is valid, return it
        if (this.accessToken && !this.isTokenExpired()) {
            return this.accessToken;
        }

        // If a request is already in progress, wait for it
        if (this.tokenPromise) {
            return this.tokenPromise;
        }

        // Otherwise, fetch a new token
        this.tokenPromise = this.fetchToken().finally(() => {
            this.tokenPromise = null;
        });

        return this.tokenPromise;
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
            throw new Error('Missing Amadeus API credentials in environment variables');
        }

        const url = `${baseUrl}/security/oauth2/token`;
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
                throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
            }

            const data: AuthResponse = await response.json();

            this.accessToken = data.access_token;
            // expires_in is in seconds, convert to milliseconds and add to current time
            this.tokenExpiration = Date.now() + (data.expires_in * 1000);

            return this.accessToken;
        } catch (error) {
            console.error('Error fetching auth token:', error);
            throw error;
        }
    }
}

export default AuthService.getInstance();
