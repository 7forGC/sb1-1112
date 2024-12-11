// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    AUTH: '/api/auth',
    USERS: '/api/users',
    MESSAGES: '/api/messages',
    ADMIN: '/api/admin',
    METRICS: '/api/metrics'
  }
};