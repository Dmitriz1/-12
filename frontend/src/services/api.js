import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Handle token expiration
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (username, password) =>
    apiClient.post('/auth/register', { username, password }),
  login: (username, password) =>
    apiClient.post('/auth/login', { username, password }),
  changePassword: (oldPassword, newPassword) =>
    apiClient.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword }),
  refreshToken: token =>
    apiClient.post('/auth/refresh', { token }),
}

export const transactionsAPI = {
  getAll: (limit = 10, offset = 0) =>
    apiClient.get('/transactions', { params: { limit, offset } }),
  getById: id => apiClient.get(`/transactions/${id}`),
  create: data => apiClient.post('/transactions', data),
  update: (id, data) => apiClient.put(`/transactions/${id}`, data),
  delete: id => apiClient.delete(`/transactions/${id}`),
  getStats: () => apiClient.get('/transactions/stats'),
}

export const groupsAPI = {
  getAll: () => apiClient.get('/groups'),
  getById: id => apiClient.get(`/groups/${id}`),
  create: data => apiClient.post('/groups', data),
  update: (id, data) => apiClient.put(`/groups/${id}`, data),
  delete: id => apiClient.delete(`/groups/{id}`, { params: { group_id: id } }),
  addMember: (groupId, userId) =>
    apiClient.post(`/groups/${groupId}/add-member`, { user_id: userId }),
}

export const analyticsAPI = {
  getOverview: () => apiClient.get('/analytics/overview'),
  getChart: (chartType, params = {}) =>
    apiClient.get(`/analytics/${chartType}`, { params }),
  getExpenses: (startDate, endDate) =>
    apiClient.get('/analytics/expenses', { params: { start_date: startDate, end_date: endDate } }),
}

export const aiAPI = {
  analyzeBudget: data => apiClient.post('/ai/analyze', data),
  getRecommendations: () => apiClient.get('/ai/recommendations'),
}

export default apiClient
