import axios from "axios"
import toast from "react-hot-toast"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token")
      window.location.href = "/login"
      toast.error("Session expired. Please login again.")
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.")
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timeout. Please check your connection.")
    }

    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  googleLogin: (token) => api.post("/auth/google", { token }),
  verify: (token) =>
    api.get("/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    }),
}

// Customers API
export const customersAPI = {
  getAll: (params) => api.get("/customers", { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  createBulk: (data) => api.post("/customers/bulk", data),
}

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get("/orders", { params }),
  create: (data) => api.post("/orders", data),
  createBulk: (data) => api.post("/orders/bulk", data),
}

// Campaigns API
export const campaignsAPI = {
  getAll: (params) => api.get("/campaigns", { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post("/campaigns", data),
  preview: (rules) => api.post("/campaigns/preview", { rules }),
}

// AI API
export const aiAPI = {
  generateRules: (prompt) => api.post("/ai/rules", { prompt }),
  generateMessage: (objective, audienceDescription) => api.post("/ai/message", { objective, audienceDescription }),
}

export default api
