import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // Merr token-in nga localStorage
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchServices = () =>
  axios.get(`${API_BASE_URL}/services`, { headers: getAuthHeaders() });

export const createService = async (serviceData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/services/create/`,
      serviceData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

export const updateService = (id, data) =>
  axios.patch(`${API_BASE_URL}/services/${id}/`, data, {
    headers: getAuthHeaders(),
  });

export const deleteService = (id) =>
  axios.delete(`${API_BASE_URL}/services/${id}/`, {
    headers: getAuthHeaders(),
  });
