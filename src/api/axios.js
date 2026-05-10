import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // Determine which token to use based on the API endpoint
    const isAdminRoute = config.url.includes("/admin") || 
                        (config.url.includes("/auth") && !config.url.includes("/customers"));
    
    const adminToken = localStorage.getItem("cd_admin_token");
    const customerToken = localStorage.getItem("cd_customer_token");

    if (isAdminRoute && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (!isAdminRoute && customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isPortal = window.location.pathname.startsWith("/portal");
      
      // Clear both storage for safety
      localStorage.removeItem("cd_customer_token");
      localStorage.removeItem("cd_customer_user");
      localStorage.removeItem("cd_admin_token");
      localStorage.removeItem("cd_admin_user");

      if (isPortal) {
        if (window.location.pathname !== "/portal/login") {
          window.location.href = "/portal/login";
        }
      } else {
        if (window.location.pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
