import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constants";
import { api } from "../api/api";

export default async function fetchUserData() {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN);
    console.log("Tokeni:", token);

    if (!token) return null;

    const decoded = jwtDecode(token);
    const userId = decoded.user_id || decoded.id || decoded.sub;

    if (!userId) {
      console.error("Nuk u gjet ID në token");
      return null;
    }

    const response = await api.get(`/api/users/${userId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("UserData fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetch user failed:", error.response?.data || error);
    return null;
  }
}
