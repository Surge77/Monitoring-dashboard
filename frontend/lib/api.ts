const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
    token?: string;
}

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, token } = options;
        const authToken = token || this.token;

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include',
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(err.error || 'Request failed');
        }

        return res.json();
    }

    async login(email: string, password: string) {
        const result = await this.request<{ user: unknown; token: string }>('/auth/login', {
            method: 'POST',
            body: { email, password },
        });
        this.setToken(result.token);
        return result;
    }

    async register(email: string, password: string) {
        const result = await this.request<{ user: unknown; token: string }>('/auth/register', {
            method: 'POST',
            body: { email, password },
        });
        this.setToken(result.token);
        return result;
    }

    async logout() {
        await this.request('/auth/logout', { method: 'POST' });
        this.setToken(null);
    }

    async getMe() {
        return this.request<{ user: unknown }>('/auth/me');
    }

    async getMetrics() {
        return this.request<{ metrics: unknown[] }>('/metrics');
    }

    async getMetric(id: string) {
        return this.request<{ metric: unknown }>(`/metrics/${id}`);
    }

    async getMetricAggregate(id: string, range: string, type: string) {
        return this.request<unknown>(`/metrics/${id}/aggregate?range=${range}&type=${type}`);
    }

    async getAlerts() {
        return this.request<{ alertRules: unknown[] }>('/alerts');
    }

    async createAlert(data: { metricId: string; operator: string; threshold: number }) {
        return this.request<{ alertRule: unknown }>('/alerts', { method: 'POST', body: data });
    }

    async updateAlert(id: string, data: { operator?: string; threshold?: number; isActive?: boolean }) {
        return this.request<{ alertRule: unknown }>(`/alerts/${id}`, { method: 'PUT', body: data });
    }

    async deleteAlert(id: string) {
        return this.request<{ success: boolean }>(`/alerts/${id}`, { method: 'DELETE' });
    }

    async getAlertEvents(limit = 50) {
        return this.request<{ alertEvents: unknown[] }>(`/alerts/events?limit=${limit}`);
    }
}

export const api = new ApiClient();
