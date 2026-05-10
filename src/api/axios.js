import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("cd_admin_token")
  const customerToken = localStorage.getItem("cd_customer_token")
  const token = adminToken || customerToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cd_admin_token")
      localStorage.removeItem("cd_admin_user")
      localStorage.removeItem("cd_customer_token")
      localStorage.removeItem("cd_customer_user")
      const path = window.location.pathname
      if (path.startsWith("/admin")) {
        window.location.href = "/admin/login"
      } else if (path.startsWith("/portal")) {
        window.location.href = "/portal/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api
