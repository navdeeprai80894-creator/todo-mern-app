import axios from 'axios';

const TOKEN_KEY = 'taskboard_token';

export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || ''}/api`, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/login') || err.config?.url?.startsWith('/auth/register');
    if (err.response?.status === 401 && !isAuthCall) window.dispatchEvent(new Event('auth:expired'));
    return Promise.reject(err);
  }
);

// Turns any axios failure into a readable message.
export function errorMessage(err) {
  if (err.response) {
    const { message, details } = err.response.data?.error || {};
    if (details?.length > 1) return details.map((d) => d.message).join('. ');
    return message || 'Something went wrong. Please try again.';
  }
  if (err.code === 'ECONNABORTED') return 'The server took too long to respond.';
  return 'Cannot reach the server. Check your connection.';
}

export default api;
