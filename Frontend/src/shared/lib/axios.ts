import axios from 'axios';
import { toast } from 'sonner';

// Shared Axios Instance with Credentials & Vite Proxy Support
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

// Response Interceptor for Graceful Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network Error or CORS failure
      toast.error('Network Error', {
        description: 'Unable to reach QueueForge server. Please verify backend service and CORS configuration.',
      });
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401) {
      // Clear client session cookie fallback if unauthorized
      document.cookie = 'token=; Max-Age=0; path=/';
    } else if (status === 429) {
      toast.warning('Rate Limit Exceeded', {
        description: data?.message || "You're sending requests too fast. Please wait a moment before trying again.",
      });
    } else if (status >= 500) {
      toast.error('Server Error', {
        description: data?.message || 'An internal backend server error occurred.',
      });
    }

    return Promise.reject(error);
  }
);
