import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  changePassword: (data: object) => api.put('/auth/change-password', data),
};

// ─── Incidents ───────────────────────────────────────────────────────────────
export const incidentApi = {
  getAll: (params?: object) => api.get('/incidents', { params }),
  getById: (id: string) => api.get(`/incidents/${id}`),
  updateStatus: (id: string, data: object) => api.put(`/incidents/${id}/status`, data),
  assign: (id: string, data: object) => api.put(`/incidents/${id}/assign`, data),
  getStats: () => api.get('/incidents/stats'),

  // Lost child
  createLostChild: (data: object) => api.post('/incidents/lost-child', data),
  getLostChildCases: (params?: object) => api.get('/incidents/lost-child/active', { params }),
  generateAnnouncements: (data: object) =>
    api.post('/incidents/lost-child/announcements', data),

  // Medical
  createMedical: (data: object) => api.post('/incidents/medical', data),
  getMedicalEmergencies: (params?: object) =>
    api.get('/incidents/medical/active', { params }),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiApi = {
  analyzeLostChild: (description: string) =>
    api.post('/ai/lost-child/analyze', { description }),
  analyzeMedical: (description: string) =>
    api.post('/ai/medical/analyze', { description }),
  analyzeCrowd: (description: string) =>
    api.post('/ai/crowd/analyze', { description }),
  accessibilityAssist: (request: string) =>
    api.post('/ai/accessibility/assist', { request }),
  translate: (text: string, fromLang: string, toLang: string) =>
    api.post('/ai/translate', { text, fromLang, toLang }),
  translateAll: (text: string) => api.post('/ai/translate/all', { text }),
  summarize: (conversation: string) => api.post('/ai/summarize', { conversation }),
  queryKnowledge: (question: string) => api.post('/ai/knowledge', { question }),
  chat: (message: string, moduleType: string, chatId?: string) =>
    api.post('/ai/chat', { message, moduleType, chatId }),
};

// ─── Users (Admin) ───────────────────────────────────────────────────────────
export const userApi = {
  getAll: (params?: object) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  updateRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  toggleActive: (id: string) => api.put(`/users/${id}/toggle-active`),
  getAuditLogs: (params?: object) => api.get('/users/audit-logs', { params }),
};

// ─── Knowledge Base ──────────────────────────────────────────────────────────
export const knowledgeApi = {
  getAll: (params?: object) => api.get('/knowledge', { params }),
  getById: (id: string) => api.get(`/knowledge/${id}`),
  create: (data: object) => api.post('/knowledge', data),
  update: (id: string, data: object) => api.put(`/knowledge/${id}`, data),
  remove: (id: string) => api.delete(`/knowledge/${id}`),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export type ApiError = {
  message: string;
  details?: Array<{ field: string; message: string }>;
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}
