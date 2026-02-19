import AuthService from '@/services/authService';

class AmadeusHttpClient {
  private static instance: AmadeusHttpClient;

  private constructor() {}

  public static getInstance(): AmadeusHttpClient {
    if (!AmadeusHttpClient.instance) {
      AmadeusHttpClient.instance = new AmadeusHttpClient();
    }
    return AmadeusHttpClient.instance;
  }

  private getApiBase(): string {
    const baseUrl = process.env.AMADEUS_BASE_URL;
    if (!baseUrl) {
      throw new Error('Missing AMADEUS_BASE_URL environment variable');
    }
    return baseUrl.replace(/\/v1\/?$/, '');
  }

  public buildUrl(path: string, params?: Record<string, string | number | undefined>): URL {
    const url = new URL(`${this.getApiBase()}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url;
  }

  public async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const token = await AuthService.getToken();
    const url = this.buildUrl(path, params);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  public async post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    const token = await AuthService.getToken();
    const url = this.buildUrl(path);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }
}

export default AmadeusHttpClient.getInstance();
