import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Shtojmë response interceptor për të bërë refresh token automatikisht
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kontrollojmë për status 401 dhe që të mos përpiqemi më shumë se një herë
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
          // Nëse nuk ka refresh token, refuzo dhe bën logout në app
          return Promise.reject(error);
        }

        // Bëjmë kërkesë për token të ri me refresh token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;
        // Ruajmë tokenin e ri në localStorage
        localStorage.setItem(ACCESS_TOKEN, newAccessToken);

        // Vendosim tokenin e ri në header për kërkesën origjinale dhe e rifreskojmë
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Nëse refresh token ka skaduar ose ka gabim, fshij tokenat dhe bëj logout
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        // opsionale: redirect në login këtu
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const apiNoAuth = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export { api, apiNoAuth };
